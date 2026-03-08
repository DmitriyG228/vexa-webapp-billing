from __future__ import annotations

import time
from typing import Any, Dict

import stripe
from fastapi import APIRouter, HTTPException

from .config import get_price_id
from .context import _ensure_customer
from .models import UsageReport

router = APIRouter()


@router.post("/v1/usage")
async def report_usage(req: UsageReport) -> Dict[str, Any]:
    """Report metered usage for a customer's subscription."""
    if req.plan_type not in ("bot_service", "transcription_api"):
        raise HTTPException(status_code=400, detail=f"Invalid plan_type '{req.plan_type}'")

    price_id = get_price_id(req.plan_type)
    customer = _ensure_customer(req.email)

    # Find active subscription with this price
    subs = stripe.Subscription.list(customer=customer.id, status="active", limit=50)
    target_item = None
    for sub in subs.data:
        items = (sub.get("items") or {}).get("data") or []
        for item in items:
            item_price = item.get("price", {})
            item_price_id = item_price.get("id") if isinstance(item_price, dict) else item.get("price")
            if item_price_id == price_id:
                target_item = item
                break
        if target_item:
            break

    if not target_item:
        raise HTTPException(
            status_code=404,
            detail=f"No active subscription with plan '{req.plan_type}' for {req.email}",
        )

    ts = req.timestamp or int(time.time())
    usage_quantity = int(req.quantity)
    if usage_quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    create_kwargs: Dict[str, Any] = {
        "subscription_item": target_item["id"],
        "quantity": usage_quantity,
        "timestamp": ts,
        "action": "increment",
    }
    if req.idempotency_key:
        create_kwargs["idempotency_key"] = req.idempotency_key

    usage_record = stripe.SubscriptionItem.create_usage_record(**create_kwargs)
    print(f"[USAGE] Reported {usage_quantity} {req.plan_type} for {req.email}")

    return {
        "reported": True,
        "plan_type": req.plan_type,
        "quantity": usage_quantity,
        "usage_record_id": usage_record.get("id"),
        "subscription_item_id": target_item["id"],
    }
