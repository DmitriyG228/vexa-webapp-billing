from __future__ import annotations

from typing import Any, Dict

import stripe
from fastapi import HTTPException

from .config import (
    DATABASE_URL, INITIAL_BOT_CREDIT_CENTS, TX_FREE_CREDIT_MINUTES,
    get_price_id, get_product_id,
)
from .context import CustomerContext


# ── Welcome credit helper ────────────────────────────────────────────────────

async def _apply_welcome_credit_if_needed(ctx: CustomerContext, plan: str) -> None:
    """Bug fix #2: Apply $5 welcome credit as real Stripe customer balance credit,
    not as a fake line item. Only once per customer (tracked via DB flag).
    """
    if not DATABASE_URL:
        return

    from .db import merge_user_data

    if plan == "bot_service" and not ctx.user_data.get("bot_welcome_credit_given"):
        try:
            stripe.Customer.create_balance_transaction(
                ctx.customer_id,
                amount=-INITIAL_BOT_CREDIT_CENTS,  # negative = credit
                currency="usd",
                description="Welcome credit — Pay-as-you-go ($5)",
            )
            await merge_user_data(ctx.email, {
                "bot_welcome_credit_given": True,
                "bot_balance_cents": INITIAL_BOT_CREDIT_CENTS,
            })
            print(f"[CREDIT] Applied ${INITIAL_BOT_CREDIT_CENTS/100:.2f} welcome credit for {ctx.email}")
        except Exception as e:
            print(f"[CREDIT] Failed to apply welcome credit: {e}")


# ── 1. New subscription checkout ────────────────────────────────────────────

async def new_checkout(ctx: CustomerContext, plan: str) -> Dict[str, Any]:
    """First-time subscriber — Stripe Checkout session."""
    line_items = []

    if plan == "individual":
        line_items.append({"price": get_price_id("individual"), "quantity": 1})
    elif plan == "bot_service":
        line_items.append({"price": get_price_id("bot_service")})
        # $5 credit applied post-checkout via webhook (not as checkout line item)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown bot plan '{plan}'")

    sub_data: Dict[str, Any] = {
        "metadata": {
            "userEmail": ctx.email,
            "tier": plan,
        }
    }

    try:
        checkout = stripe.checkout.Session.create(
            mode="subscription",
            customer=ctx.customer_id,
            line_items=line_items,
            success_url=ctx.success_url,
            cancel_url=ctx.cancel_url,
            allow_promotion_codes=True,
            payment_method_collection="if_required",
            subscription_data=sub_data,
        )
        return {"url": checkout.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Checkout error: {str(e)}")


# ── 2. Plan switch (has payment method) ─────────────────────────────────────

async def switch(ctx: CustomerContext, plan: str) -> Dict[str, Any]:
    """Switch bot plan: create new FIRST, then cancel old.
    Bug fix #1: Old code canceled first, risking a gap. Now we create new sub
    with error_if_incomplete to ensure payment works before canceling old.
    """
    new_price_id = get_price_id(plan)

    sub_params: Dict[str, Any] = {
        "customer": ctx.customer_id,
        "items": [{"price": new_price_id}],
        "default_payment_method": ctx.payment_method_id,
        "payment_behavior": "error_if_incomplete",
        "metadata": {
            "userEmail": ctx.email,
            "tier": plan,
        },
    }

    if plan == "individual":
        sub_params["items"] = [{"price": new_price_id, "quantity": 1}]

    try:
        new_sub = stripe.Subscription.create(**sub_params)
        print(f"[SWITCH] Created new sub {new_sub.id} for {plan}")
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Failed to create new subscription: {str(e)}")

    # Now cancel old — safe because new sub is confirmed
    credit_amount = ""
    try:
        canceled_sub = stripe.Subscription.cancel(ctx.bot_sub.id, prorate=True, invoice_now=True)
        print(f"[SWITCH] Canceled old sub {ctx.bot_sub.id}")
        # Extract proration credit from the final invoice
        if canceled_sub.latest_invoice:
            try:
                invoice = stripe.Invoice.retrieve(canceled_sub.latest_invoice)
                if invoice.total < 0:
                    credit_amount = f"{abs(invoice.total) / 100:.2f}"
                elif invoice.amount_due < 0:
                    credit_amount = f"{abs(invoice.amount_due) / 100:.2f}"
                elif invoice.ending_balance and invoice.ending_balance < 0:
                    credit_amount = f"{abs(invoice.ending_balance) / 100:.2f}"
                print(f"[SWITCH] Proration credit: ${credit_amount or '0'} (total={invoice.total}, due={invoice.amount_due}, ending_bal={invoice.ending_balance})")
            except Exception as e:
                print(f"[SWITCH] Could not read proration credit: {e}")
    except stripe.error.StripeError as e:
        print(f"[SWITCH] WARNING: Old sub cancel failed: {e} (new sub {new_sub.id} is active)")

    # Apply welcome credit if switching to bot_service
    await _apply_welcome_credit_if_needed(ctx, plan)

    credit_param = f"&credit={credit_amount}" if credit_amount else ""
    return {"url": f"{ctx.success_url}?switched={plan}{credit_param}"}


# ── 3. Switch via checkout (no payment method yet) ──────────────────────────

def switch_via_checkout(ctx: CustomerContext, plan: str) -> Dict[str, Any]:
    """User wants to switch but has no card on file — need checkout to collect payment."""
    line_items = []
    if plan == "individual":
        line_items.append({"price": get_price_id("individual"), "quantity": 1})
    elif plan == "bot_service":
        line_items.append({"price": get_price_id("bot_service")})
    else:
        raise HTTPException(status_code=400, detail=f"Unknown bot plan '{plan}'")

    try:
        checkout = stripe.checkout.Session.create(
            mode="subscription",
            customer=ctx.customer_id,
            line_items=line_items,
            success_url=ctx.success_url,
            cancel_url=ctx.cancel_url,
            allow_promotion_codes=True,
            subscription_data={
                "metadata": {
                    "userEmail": ctx.email,
                    "tier": plan,
                    "replaces_sub": ctx.bot_sub.id if ctx.bot_sub else "",
                }
            },
        )
        return {"url": checkout.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Checkout error: {str(e)}")


# ── 4. Addon checkout ───────────────────────────────────────────────────────

def addon_checkout(ctx: CustomerContext, plan: str) -> Dict[str, Any]:
    """Add-on product (transcription_api) — always creates new checkout."""
    price_id = get_price_id(plan)
    try:
        checkout = stripe.checkout.Session.create(
            mode="subscription",
            customer=ctx.customer_id,
            line_items=[{"price": price_id}],
            success_url=ctx.success_url,
            cancel_url=ctx.cancel_url,
            payment_method_collection="if_required",
            subscription_data={
                "metadata": {
                    "userEmail": ctx.email,
                    "tier": plan,
                }
            },
        )
        return {"url": checkout.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Checkout error: {str(e)}")


# ── 5. One-time payment (consultation) ──────────────────────────────────────

def one_time_checkout(ctx: CustomerContext, plan: str, quantity: int = 1) -> Dict[str, Any]:
    """Bug fix #3: Consultation always uses mode=payment, checked first in router
    so it never falls through to addon/subscription paths."""
    price_id = get_price_id(plan)
    try:
        checkout = stripe.checkout.Session.create(
            mode="payment",
            customer=ctx.customer_id,
            line_items=[{"price": price_id, "quantity": quantity}],
            success_url=ctx.success_url,
            cancel_url=ctx.cancel_url,
            allow_promotion_codes=True,
            metadata={
                "userEmail": ctx.email,
                "tier": plan,
            },
        )
        return {"url": checkout.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Checkout error: {str(e)}")


# ── 6. Portal (manage existing) ─────────────────────────────────────────────

def portal(ctx: CustomerContext) -> Dict[str, Any]:
    """Send existing subscriber to Stripe Customer Portal."""
    try:
        session = stripe.billing_portal.Session.create(
            customer=ctx.customer_id,
            return_url=ctx.return_url,
        )
        return {"url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Portal error: {str(e)}")
