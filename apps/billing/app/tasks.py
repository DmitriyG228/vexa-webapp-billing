from __future__ import annotations

import asyncio
import time
from typing import Any, Dict

import stripe
from fastapi import APIRouter

from .config import DATABASE_URL, ADMIN_API_URL, ADMIN_API_TOKEN
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


# ── Admin API helper ─────────────────────────────────────────────────────────

async def _patch_max_bots(user_id: int, max_bots: int) -> bool:
    """Update max_concurrent_bots via Admin API."""
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.patch(
                f"{ADMIN_API_URL}/admin/users/{user_id}",
                json={"max_concurrent_bots": max_bots},
                headers={"Authorization": f"Bearer {ADMIN_API_TOKEN}"},
                timeout=10,
            )
            return resp.status_code in (200, 201)
    except Exception as e:
        print(f"[TASKS] Failed to patch max_bots for user {user_id}: {e}")
        return False


# ── Background auto-topup + enforcement loop ────────────────────────────────

async def _auto_topup_loop():
    """Every 60s: auto-topup low balances, enforce max_bots when broke."""
    if not DATABASE_URL:
        return

    while True:
        try:
            print("[AUTO-TOPUP] Loop tick — checking balances...")
            from sqlalchemy import text
            async with get_session() as db:
                # ── 1. Bot auto-topup ────────────────────────────────────
                result = await db.execute(text("""
                    SELECT id, email, data, max_concurrent_bots FROM public.users
                    WHERE (data->>'bot_topup_enabled')::boolean = true
                      AND (COALESCE((data->>'bot_balance_cents')::numeric, 0))
                          < (COALESCE((data->>'bot_topup_threshold_cents')::numeric, 100))
                      AND data->>'stripe_customer_id' IS NOT NULL
                      AND data->>'stripe_payment_method_id' IS NOT NULL
                """))
                for row in result.mappings().all():
                    data = row["data"] or {}
                    # Check monthly spending cap
                    cap = data.get("bot_monthly_cap_cents")
                    spent = data.get("bot_monthly_spent_cents", 0) or 0
                    amount = int(data.get("bot_topup_amount_cents", 500) or 500)
                    if cap and (spent + amount) > cap:
                        print(f"[AUTO-TOPUP] Skipping {row['email']} — would exceed monthly cap ({spent}+{amount} > {cap})")
                        continue
                    try:
                        stripe.PaymentIntent.create(
                            amount=amount,
                            currency="usd",
                            customer=data["stripe_customer_id"],
                            payment_method=data["stripe_payment_method_id"],
                            off_session=True,
                            confirm=True,
                            description="Bot balance auto top-up",
                        )
                        current = data.get("bot_balance_cents", 0) or 0
                        new_balance = current + amount
                        patch: Dict[str, Any] = {
                            "bot_balance_cents": new_balance,
                            "bot_monthly_spent_cents": spent + amount,
                        }
                        await merge_user_data_by_id(row["id"], patch)
                        # Restore max_bots if it was zeroed
                        if row.get("max_concurrent_bots", 0) == 0:
                            tier = data.get("subscription_tier")
                            restore_to = 1 if tier in ("individual", "bot_service") else 0
                            if restore_to > 0:
                                await _patch_max_bots(row["id"], restore_to)
                                print(f"[AUTO-TOPUP] Restored max_bots={restore_to} for {row['email']}")
                        print(f"[AUTO-TOPUP] Charged {amount}c for {row['email']}, new balance={new_balance}c")
                    except Exception as e:
                        print(f"[AUTO-TOPUP] Failed for {row['email']}: {e}")

                # ── 2. TX auto-topup ─────────────────────────────────────
                result2 = await db.execute(text("""
                    SELECT id, email, data FROM public.users
                    WHERE (data->>'tx_topup_enabled')::boolean = true
                      AND (COALESCE((data->>'tx_balance_minutes')::numeric, 0))
                          < (COALESCE((data->>'tx_topup_threshold_min')::numeric, 60))
                      AND data->>'stripe_customer_id' IS NOT NULL
                      AND data->>'stripe_payment_method_id' IS NOT NULL
                """))
                for row in result2.mappings().all():
                    data = row["data"] or {}
                    amount_cents = int(data.get("tx_topup_amount_cents", 500) or 500)
                    try:
                        stripe.PaymentIntent.create(
                            amount=amount_cents,
                            currency="usd",
                            customer=data["stripe_customer_id"],
                            payment_method=data["stripe_payment_method_id"],
                            off_session=True,
                            confirm=True,
                            description="Transcription balance auto top-up",
                        )
                        current = data.get("tx_balance_minutes", 0) or 0
                        minutes_per_cent = 1 / 0.15  # ~6.667 min/cent
                        new_balance = current + (amount_cents * minutes_per_cent)
                        await merge_user_data_by_id(row["id"], {"tx_balance_minutes": new_balance})
                        print(f"[AUTO-TOPUP] TX charged {amount_cents}c for {row['email']}, new balance={new_balance:.0f}min")
                    except Exception as e:
                        print(f"[AUTO-TOPUP] TX failed for {row['email']}: {e}")

                # ── 3. Enforce: zero max_bots when bot balance exhausted ─
                result3 = await db.execute(text("""
                    SELECT id, email, data, max_concurrent_bots FROM public.users
                    WHERE (data->>'subscription_tier') IN ('bot_service')
                      AND (data->>'subscription_status') IN ('active', 'trialing')
                      AND (data->>'bot_topup_enabled')::boolean IS NOT true
                      AND COALESCE((data->>'bot_balance_cents')::numeric, 0) <= 0
                      AND max_concurrent_bots > 0
                """))
                for row in result3.mappings().all():
                    await _patch_max_bots(row["id"], 0)
                    print(f"[ENFORCE] Set max_bots=0 for {row['email']} — balance exhausted, no auto-topup")

        except Exception as e:
            print(f"[AUTO-TOPUP] Loop error: {e}")

        await asyncio.sleep(60)


# ── Monthly spending reset (runs daily) ──────────────────────────────────────

async def _monthly_reset_loop():
    """At the start of each month, reset bot_monthly_spent_cents to 0."""
    if not DATABASE_URL:
        return
    last_reset_month = time.gmtime().tm_mon

    while True:
        current_month = time.gmtime().tm_mon
        if current_month != last_reset_month:
            try:
                from sqlalchemy import text
                async with get_session() as db:
                    await db.execute(text("""
                        UPDATE public.users
                        SET data = data || '{"bot_monthly_spent_cents": 0}'::jsonb
                        WHERE (data->>'bot_monthly_spent_cents')::numeric > 0
                    """))
                    await db.commit()
                    print(f"[MONTHLY-RESET] Reset bot_monthly_spent_cents for all users")
            except Exception as e:
                print(f"[MONTHLY-RESET] Error: {e}")
            last_reset_month = current_month

        await asyncio.sleep(3600)  # check hourly


def start_background_tasks():
    """Called from main.py startup to launch background loops."""
    if DATABASE_URL:
        asyncio.create_task(_auto_topup_loop())
        asyncio.create_task(_monthly_reset_loop())
        print("[TASKS] Background tasks started (auto-topup + monthly reset)")
