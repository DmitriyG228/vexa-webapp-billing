from __future__ import annotations

import time
from typing import Any, Dict, Optional, Set

import stripe
from fastapi import APIRouter, HTTPException, Request, status

from .config import STRIPE_WEBHOOK_SECRET, STRIPE_IDS, BOT_PLANS, ADDON, DATABASE_URL, INITIAL_BOT_CREDIT_CENTS, TX_FREE_CREDIT_MINUTES
from .admin import admin_request

router = APIRouter()

# ── Idempotency ──────────────────────────────────────────────────────────────
# In-memory set (upgrade to Redis later if needed)
_processed_events: Set[str] = set()
_MAX_PROCESSED = 10000


# ── Helpers ──────────────────────────────────────────────────────────────────

def _extract_email(sub: Dict[str, Any]) -> Optional[str]:
    metadata = sub.get("metadata") or {}
    email = metadata.get("userEmail") or metadata.get("email")
    if email:
        return email
    cust_details = sub.get("customer_details") or {}
    if cust_details.get("email"):
        return cust_details["email"]
    return None


def _identify_plan(sub: Dict[str, Any]) -> str:
    items = (sub.get("items") or {}).get("data") or []
    for item in items:
        price = item.get("price", {})
        price_id = price.get("id") if isinstance(price, dict) else item.get("price")
        for plan_type, ids in STRIPE_IDS.items():
            if ids.get("price_id") == price_id:
                return plan_type
    tier = (sub.get("metadata") or {}).get("tier")
    return tier or "standard"


def _sub_fields(plan_type: str) -> str:
    """Return JSONB field prefix: bot plans use 'subscription_*', addons use 'tx_subscription_*'."""
    return "tx_subscription" if plan_type in ADDON else "subscription"


def _compute_entitlements(sub: Dict[str, Any]) -> Dict[str, Any]:
    status_val = sub.get("status") or "inactive"
    plan_type = _identify_plan(sub)
    is_addon = plan_type in ADDON
    prefix = _sub_fields(plan_type)

    scheduled_to_cancel = bool(sub.get("cancel_at_period_end"))
    normalized_status = (
        "scheduled_to_cancel" if scheduled_to_cancel and status_val == "active" else status_val
    )

    # Bot entitlements — addons never touch max_bots
    max_bots = None  # None = don't change
    if not is_addon:
        if normalized_status in ("canceled", "incomplete_expired", "unpaid"):
            max_bots = 0
        elif normalized_status in ("active", "trialing", "scheduled_to_cancel"):
            if plan_type == "individual":
                max_bots = 1
            elif plan_type == "bot_service":
                max_bots = 1  # default 1, auto-scaling bumps it later
        else:
            max_bots = 0

    return {
        f"{prefix}_status": normalized_status,
        f"{prefix}_tier": plan_type,
        f"{prefix}_cancel_at_period_end": scheduled_to_cancel,
        f"{prefix}_cancellation_date": (
            (sub.get("cancel_at") or sub.get("current_period_end")) if scheduled_to_cancel
            else sub.get("canceled_at")
        ),
        f"{prefix}_current_period_end": sub.get("current_period_end"),
        f"{prefix}_current_period_start": sub.get("current_period_start"),
        f"{prefix}_trial_end": sub.get("trial_end"),
        f"{prefix}_trial_start": sub.get("trial_start"),
        "max_concurrent_bots": max_bots,
        "_plan_type": plan_type,
        "_is_addon": is_addon,
    }


async def _sync_entitlements(email: str, sub: Dict[str, Any]) -> None:
    """Reconcile subscription → Admin API user patch.
    Bot plans write to subscription_* fields. Addons write to tx_subscription_* fields.
    They never overwrite each other.
    """
    entitlements = _compute_entitlements(sub)
    plan_type = entitlements.pop("_plan_type")
    is_addon = entitlements.pop("_is_addon")
    max_bots = entitlements.pop("max_concurrent_bots")
    prefix = _sub_fields(plan_type)
    sub_id_field = f"stripe_{prefix}_id" if is_addon else "stripe_subscription_id"

    # Guard: if this is a cancellation, don't overwrite a newer active subscription.
    status_field = f"{prefix}_status"
    cancel_statuses = ("canceled", "incomplete_expired")
    if entitlements.get(status_field) in cancel_statuses and DATABASE_URL:
        from .db import get_user_data
        current_data = await get_user_data(email)
        current_sub_id = current_data.get(sub_id_field)
        if current_sub_id and current_sub_id != sub.get("id"):
            print(f"[WEBHOOK] Ignoring canceled sub {sub.get('id')} — user has newer sub {current_sub_id}")
            return

    # Upsert user
    resp = await admin_request("POST", "/admin/users", {"email": email})
    if resp.status_code not in (200, 201):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Admin API user upsert failed: {resp.text}",
        )
    user_data = resp.json()
    user_id = user_data.get("id") or (user_data.get("data") or {}).get("id")

    # For bot_service, preserve current max_concurrent_bots if higher than default
    if max_bots is not None and plan_type == "bot_service":
        current_max = user_data.get("max_concurrent_bots", 0)
        if current_max > max_bots:
            max_bots = current_max

    # Build Admin API patch — only include max_bots for bot plans
    patch: Dict[str, Any] = {
        "data": {
            "updated_by_webhook": int(time.time()),
            "stripe_customer_id": sub.get("customer"),
            sub_id_field: sub.get("id"),
            **entitlements,
        },
    }
    if max_bots is not None:
        patch["max_concurrent_bots"] = max_bots

    resp2 = await admin_request("PATCH", f"/admin/users/{user_id}", patch)
    if resp2.status_code not in (200, 201):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Admin API patch failed: {resp2.text}",
        )

    # Also write to DB via merge_user_data (atomic JSONB merge)
    if DATABASE_URL:
        from .db import merge_user_data
        db_patch = {
            "updated_by_webhook": int(time.time()),
            "stripe_customer_id": sub.get("customer"),
            sub_id_field: sub.get("id"),
            **entitlements,
        }
        await merge_user_data(email, db_patch)

    # Apply welcome credit for new bot_service subscriptions
    if DATABASE_URL and plan_type == "bot_service" and sub.get("status") in ("active", "trialing"):
        from .db import get_user_data, merge_user_data
        data = await get_user_data(email)
        if not data.get("bot_welcome_credit_given"):
            try:
                cust_id = sub.get("customer")
                stripe.Customer.create_balance_transaction(
                    cust_id,
                    amount=-INITIAL_BOT_CREDIT_CENTS,
                    currency="usd",
                    description="Welcome credit — Pay-as-you-go ($5)",
                )
                await merge_user_data(email, {
                    "bot_welcome_credit_given": True,
                    "bot_balance_cents": INITIAL_BOT_CREDIT_CENTS,
                })
                print(f"[WEBHOOK] Applied ${INITIAL_BOT_CREDIT_CENTS/100:.2f} welcome credit for {email}")
            except Exception as e:
                print(f"[WEBHOOK] Welcome credit failed for {email}: {e}")

    # Handle sub that replaces another (plan switch via checkout)
    replaces = (sub.get("metadata") or {}).get("replaces_sub")
    if replaces:
        try:
            stripe.Subscription.cancel(replaces, prorate=True, invoice_now=True)
            print(f"[WEBHOOK] Canceled replaced sub {replaces}")
        except stripe.error.StripeError as e:
            print(f"[WEBHOOK] WARNING: Could not cancel replaced sub {replaces}: {e}")


# ── Webhook endpoint ─────────────────────────────────────────────────────────

@router.post("/v1/stripe/webhook")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("stripe-signature")
    if not STRIPE_WEBHOOK_SECRET or not signature:
        raise HTTPException(status_code=400, detail="Missing webhook secret or signature")

    try:
        event = stripe.Webhook.construct_event(body, signature, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook parsing error")

    event_id = event.get("id")
    event_type = event.get("type")
    data_object = (event.get("data") or {}).get("object") or {}
    print(f"[WEBHOOK] {event_type} ({event_id})")

    # Idempotency check
    if event_id in _processed_events:
        return {"received": True, "note": "already processed"}
    if len(_processed_events) > _MAX_PROCESSED:
        _processed_events.clear()
    _processed_events.add(event_id)

    # ── Subscription events ──────────────────────────────────────────────
    if event_type in {
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    }:
        sub = data_object
        email = _extract_email(sub)
        if not email:
            cust_id = sub.get("customer")
            if cust_id:
                try:
                    customer = stripe.Customer.retrieve(cust_id)
                    email = customer.get("email")
                except stripe.error.StripeError:
                    email = None
        if not email:
            return {"received": True, "note": "No email to map user"}

        await _sync_entitlements(email, sub)
        return {"received": True}

    # Bug fix #6: Remove checkout.session.completed handler — redundant with subscription.created
    # Stripe fires subscription.created for every new checkout, so handling both causes duplicate work.

    if event_type == "invoice.paid":
        invoice = data_object
        print(f"[WEBHOOK] Invoice paid: {invoice.get('id')} amount={invoice.get('amount_paid')}")
        return {"received": True}

    return {"received": True, "ignored": event_type}


@router.post("/webhook/stripe")
async def stripe_webhook_alias(request: Request):
    return await stripe_webhook(request)
