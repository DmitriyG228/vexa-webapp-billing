"""
Receiver for post-meeting hooks from bot-manager.

Bot-manager sends: POST /v1/hooks/meeting-completed
with meeting data (duration, user, platform, etc.)

This is the billing side of the generic hook system.
Bot-manager doesn't know about billing — it just fires hooks.
"""
from __future__ import annotations

from typing import Any, Dict

import stripe
from fastapi import APIRouter

from .config import get_price_id
from .context import _ensure_customer
from .db import get_user_data, merge_user_data

router = APIRouter()


@router.post("/v1/hooks/meeting-completed")
async def handle_meeting_completed(payload: Dict[str, Any]):
    meeting = payload.get("meeting", {})
    email = meeting.get("user_email")
    duration_seconds = meeting.get("duration_seconds", 0)
    meeting_id = meeting.get("id")

    if not email or duration_seconds <= 0:
        return {"skipped": True, "reason": "missing email or non-positive duration"}

    duration_minutes = duration_seconds / 60.0
    # $0.45/hr = $0.0075/min = 0.75 cents/min
    cost_cents = int(duration_minutes * 0.75 + 0.5)

    result = {
        "meeting_id": meeting_id,
        "email": email,
        "duration_minutes": round(duration_minutes, 1),
        "cost_cents": cost_cents,
    }

    # 1. Deduct from prepaid bot balance
    # Balance CAN go negative — we never cut a meeting short.
    # Negative balance means the user owes; auto-topup or next topup covers it.
    # The account page and auto-topup task must handle negative values gracefully.
    try:
        data = await get_user_data(email)
        current = data.get("bot_balance_cents", 0) or 0
        new_balance = current - cost_cents  # allow negative
        await merge_user_data(email, {
            "bot_balance_cents": new_balance,
            "bot_monthly_spent_cents": (data.get("bot_monthly_spent_cents", 0) or 0) + cost_cents,
        })
        result["balance_deducted"] = True
        result["new_balance_cents"] = new_balance
    except Exception as e:
        result["balance_deducted"] = False
        result["balance_error"] = str(e)

    # 2. Report metered usage to Stripe (for PAYG subscribers)
    try:
        customer = _ensure_customer(email)
        subs = stripe.Subscription.list(customer=customer.id, status="active", limit=50)

        price_id = get_price_id("bot_service")
        target_item = None
        for sub in subs.data:
            for item in (sub.get("items") or {}).get("data", []):
                item_price = item.get("price", {})
                if (item_price.get("id") if isinstance(item_price, dict) else item.get("price")) == price_id:
                    target_item = item
                    break
            if target_item:
                break

        if target_item:
            import time
            stripe.SubscriptionItem.create_usage_record(
                target_item["id"],
                quantity=max(1, int(duration_minutes + 0.5)),
                timestamp=int(time.time()),
                action="increment",
                idempotency_key=f"meeting-{meeting_id}" if meeting_id else None,
            )
            result["stripe_reported"] = True
        else:
            result["stripe_reported"] = False
            result["stripe_reason"] = "no active bot_service subscription"

    except Exception as e:
        result["stripe_reported"] = False
        result["stripe_error"] = str(e)

    return result
