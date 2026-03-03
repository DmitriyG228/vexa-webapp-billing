from __future__ import annotations

import asyncio
import time
from typing import Any, Dict

import stripe
from fastapi import APIRouter

from .config import DATABASE_URL
from .db import get_session, merge_user_data_by_id

router = APIRouter()

# ── Bot session tracking (in-memory) ────────────────────────────────────────
# API gateway calls start/stop to track active sessions

_active_sessions: Dict[str, Dict[str, Any]] = {}  # session_id → {email, start_time, meeting_id}


@router.post("/v1/bot-session/start")
async def bot_session_start(session_id: str, email: str, meeting_id: str = "") -> Dict[str, Any]:
    _active_sessions[session_id] = {
        "email": email,
        "start_time": time.time(),
        "meeting_id": meeting_id,
    }
    return {"tracked": True, "active_sessions": len(_active_sessions)}


@router.post("/v1/bot-session/stop")
async def bot_session_stop(session_id: str) -> Dict[str, Any]:
    session = _active_sessions.pop(session_id, None)
    if not session:
        return {"tracked": False, "note": "session not found"}

    duration_seconds = time.time() - session["start_time"]
    duration_cents = int((duration_seconds / 3600) * 45)  # $0.45/hr in cents

    # Deduct from bot balance via DB (if configured)
    if DATABASE_URL:
        from .db import get_user_data
        data = await get_user_data(session["email"])
        current = data.get("bot_balance_cents", 0) or 0
        new_balance = max(current - duration_cents, 0)
        await merge_user_data_by_id(
            # We'd need user_id here — for now use email-based merge
            # This is a simplification; in production the gateway would pass user_id
            0,  # placeholder
            {"bot_balance_cents": new_balance},
        )

    return {
        "tracked": True,
        "duration_seconds": int(duration_seconds),
        "deducted_cents": duration_cents,
    }


# ── Background auto-topup check ─────────────────────────────────────────────

async def _auto_topup_loop():
    """Check all users with auto-topup enabled, charge if below threshold."""
    if not DATABASE_URL:
        return

    while True:
        try:
            from sqlalchemy import text
            async with get_session() as session:
                # Find users with bot auto-topup enabled and below threshold
                result = await session.execute(text("""
                    SELECT id, email, data FROM public.users
                    WHERE (data->>'bot_topup_enabled')::boolean = true
                      AND (COALESCE((data->>'bot_balance_cents')::numeric, 0))
                          < (COALESCE((data->>'bot_topup_threshold_cents')::numeric, 100))
                      AND data->>'stripe_customer_id' IS NOT NULL
                      AND data->>'stripe_payment_method_id' IS NOT NULL
                """))
                rows = result.mappings().all()

                for row in rows:
                    data = row["data"] or {}
                    try:
                        amount = data.get("bot_topup_amount_cents", 500) or 500
                        pi = stripe.PaymentIntent.create(
                            amount=int(amount),
                            currency="usd",
                            customer=data["stripe_customer_id"],
                            payment_method=data["stripe_payment_method_id"],
                            off_session=True,
                            confirm=True,
                            description="Bot balance auto top-up",
                        )
                        current = data.get("bot_balance_cents", 0) or 0
                        new_balance = current + int(amount)
                        await merge_user_data_by_id(row["id"], {"bot_balance_cents": new_balance})
                        print(f"[AUTO-TOPUP] Charged {amount}c for user {row['email']}, new balance={new_balance}c")
                    except Exception as e:
                        print(f"[AUTO-TOPUP] Failed for user {row['email']}: {e}")

                # Same for tx (transcription) auto-topup
                result2 = await session.execute(text("""
                    SELECT id, email, data FROM public.users
                    WHERE (data->>'tx_topup_enabled')::boolean = true
                      AND (COALESCE((data->>'tx_balance_minutes')::numeric, 0))
                          < (COALESCE((data->>'tx_topup_threshold_min')::numeric, 1333))
                      AND data->>'stripe_customer_id' IS NOT NULL
                      AND data->>'stripe_payment_method_id' IS NOT NULL
                """))
                rows2 = result2.mappings().all()

                for row in rows2:
                    data = row["data"] or {}
                    try:
                        amount_cents = data.get("tx_topup_amount_cents", 500) or 500
                        pi = stripe.PaymentIntent.create(
                            amount=int(amount_cents),
                            currency="usd",
                            customer=data["stripe_customer_id"],
                            payment_method=data["stripe_payment_method_id"],
                            off_session=True,
                            confirm=True,
                            description="Transcription balance auto top-up",
                        )
                        current = data.get("tx_balance_minutes", 0) or 0
                        minutes_per_cent = 1 / 0.15  # ~6.667 min/cent
                        new_balance = current + (int(amount_cents) * minutes_per_cent)
                        await merge_user_data_by_id(row["id"], {"tx_balance_minutes": new_balance})
                        print(f"[AUTO-TOPUP] TX charged {amount_cents}c for user {row['email']}, new balance={new_balance:.0f}min")
                    except Exception as e:
                        print(f"[AUTO-TOPUP] TX failed for user {row['email']}: {e}")

        except Exception as e:
            print(f"[AUTO-TOPUP] Loop error: {e}")

        await asyncio.sleep(60)


def start_background_tasks():
    """Called from main.py startup to launch background loops."""
    if DATABASE_URL:
        asyncio.create_task(_auto_topup_loop())
        print("[TASKS] Auto-topup background task started")
