from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Optional

import stripe

from .config import BOT_PLANS, DATABASE_URL, PORTAL_RETURN_URL


@dataclass
class CustomerContext:
    user_id: Optional[int]
    customer_id: str
    email: str
    bot_sub: Optional[Any]          # active/trialing/past_due sub in BOT_PLANS
    bot_tier: Optional[str]
    has_payment_method: bool
    payment_method_id: Optional[str]
    user_data: Dict[str, Any]       # public.users.data JSONB (empty until Phase 2)
    success_url: str
    cancel_url: str
    return_url: str


def _ensure_customer(email: str) -> Any:
    customers = stripe.Customer.list(email=email, limit=1)
    if customers.data:
        return customers.data[0]
    return stripe.Customer.create(email=email, metadata={"userEmail": email})


def _find_bot_subscription(customer_id: str) -> tuple[Optional[Any], Optional[str]]:
    """Find the best active bot subscription and its tier."""
    subs = stripe.Subscription.list(customer=customer_id, status="all", limit=50)
    for sub in subs.data:
        if sub.status not in ("active", "trialing", "past_due"):
            continue
        tier = (sub.metadata or {}).get("tier", "")
        if tier in BOT_PLANS:
            return sub, tier
    return None, None


def _has_payment_method(customer_id: str) -> tuple[bool, Optional[str]]:
    pms = stripe.PaymentMethod.list(customer=customer_id, type="card")
    if pms.data:
        return True, pms.data[0].id
    return False, None


async def load(email: str, origin: Optional[str] = None,
               success_url: Optional[str] = None,
               cancel_url: Optional[str] = None,
               return_url: Optional[str] = None) -> CustomerContext:
    """Build CustomerContext: 3 Stripe calls + 1 DB read."""
    default_origin = origin or PORTAL_RETURN_URL.rsplit("/", 1)[0]

    # 1. Ensure Stripe customer
    customer = _ensure_customer(email)

    # 2. Find active bot subscription
    bot_sub, bot_tier = _find_bot_subscription(customer.id)

    # 3. Check payment method
    has_pm, pm_id = _has_payment_method(customer.id)

    # 4. Load DB user data (if DATABASE_URL configured)
    user_id = None
    user_data: Dict[str, Any] = {}
    if DATABASE_URL:
        from .db import get_user_by_email
        db_user = await get_user_by_email(email)
        if db_user:
            user_id = db_user.get("id")
            user_data = db_user.get("data") or {}

    return CustomerContext(
        user_id=user_id,
        customer_id=customer.id,
        email=customer.email or email,
        bot_sub=bot_sub,
        bot_tier=bot_tier,
        has_payment_method=has_pm,
        payment_method_id=pm_id,
        user_data=user_data,
        success_url=success_url or f"{default_origin}/account",
        cancel_url=cancel_url or f"{default_origin}/pricing",
        return_url=return_url or f"{default_origin}/account",
    )
