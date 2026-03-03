from __future__ import annotations

from typing import Any, Dict

import stripe
from fastapi import APIRouter, HTTPException

from .config import INITIAL_BOT_CREDIT_CENTS, TX_FREE_CREDIT_MINUTES
from .context import _ensure_customer
from .db import get_user_data, merge_user_data
from .models import (
    BalanceCheckRequest, BalanceDeductRequest, BalanceCreditRequest,
    TopupSettingsRequest, TopupRequest, PaymentMethodRequest,
)

router = APIRouter()

# ── Field mapping ────────────────────────────────────────────────────────────
# product → JSONB field names

_FIELDS = {
    "bot": {
        "balance": "bot_balance_cents",
        "topup_enabled": "bot_topup_enabled",
        "topup_threshold": "bot_topup_threshold_cents",
        "topup_amount": "bot_topup_amount_cents",
        "welcome_given": "bot_welcome_credit_given",
    },
    "tx": {
        "balance": "tx_balance_minutes",
        "topup_enabled": "tx_topup_enabled",
        "topup_threshold": "tx_topup_threshold_min",
        "topup_amount": "tx_topup_amount_cents",
        "welcome_given": "tx_free_credit_given",
    },
}


def _fields(product: str) -> Dict[str, str]:
    f = _FIELDS.get(product)
    if not f:
        raise HTTPException(status_code=400, detail=f"Unknown product '{product}'. Use 'bot' or 'tx'.")
    return f


# ── Check balance ────────────────────────────────────────────────────────────

@router.post("/v1/balance/check")
async def balance_check(req: BalanceCheckRequest) -> Dict[str, Any]:
    f = _fields(req.product)
    data = await get_user_data(req.email)
    available = data.get(f["balance"], 0) or 0
    required = req.required or 0
    return {
        "allowed": available >= required,
        "available": available,
        "required": required,
        "product": req.product,
    }


# ── Deduct balance ───────────────────────────────────────────────────────────

@router.post("/v1/balance/deduct")
async def balance_deduct(req: BalanceDeductRequest) -> Dict[str, Any]:
    f = _fields(req.product)
    data = await get_user_data(req.email)
    current = data.get(f["balance"], 0) or 0
    new_balance = max(current - req.amount, 0)
    await merge_user_data(req.email, {f["balance"]: new_balance})
    return {"new_balance": new_balance, "product": req.product}


# ── Credit balance ───────────────────────────────────────────────────────────

@router.post("/v1/balance/credit")
async def balance_credit(req: BalanceCreditRequest) -> Dict[str, Any]:
    f = _fields(req.product)
    data = await get_user_data(req.email)
    current = data.get(f["balance"], 0) or 0
    new_balance = current + req.amount
    await merge_user_data(req.email, {f["balance"]: new_balance})
    return {"new_balance": new_balance, "product": req.product}


# ── Get all balances ─────────────────────────────────────────────────────────

@router.get("/v1/balance/{email}")
async def get_balances(email: str) -> Dict[str, Any]:
    data = await get_user_data(email)
    return {
        "bot": {
            "balance_cents": data.get("bot_balance_cents", 0) or 0,
            "topup_enabled": data.get("bot_topup_enabled", False),
            "topup_threshold_cents": data.get("bot_topup_threshold_cents", 100),
            "topup_amount_cents": data.get("bot_topup_amount_cents", 500),
            "welcome_credit_given": data.get("bot_welcome_credit_given", False),
        },
        "tx": {
            "balance_minutes": data.get("tx_balance_minutes", 0) or 0,
            "topup_enabled": data.get("tx_topup_enabled", False),
            "topup_threshold_min": data.get("tx_topup_threshold_min", 1333.0),
            "topup_amount_cents": data.get("tx_topup_amount_cents", 500),
            "free_credit_given": data.get("tx_free_credit_given", False),
        },
    }


# ── Topup settings ──────────────────────────────────────────────────────────

@router.put("/v1/balance/topup-settings")
async def topup_settings(req: TopupSettingsRequest) -> Dict[str, Any]:
    f = _fields(req.product)
    patch: Dict[str, Any] = {f["topup_enabled"]: req.enabled}
    if req.threshold is not None:
        patch[f["topup_threshold"]] = req.threshold
    if req.amount_cents is not None:
        patch[f["topup_amount"]] = req.amount_cents
    await merge_user_data(req.email, patch)
    return {"saved": True, "product": req.product}


# ── Manual topup (charge saved card) ────────────────────────────────────────

@router.post("/v1/balance/topup")
async def manual_topup(req: TopupRequest) -> Dict[str, Any]:
    f = _fields(req.product)
    data = await get_user_data(req.email)

    pm_id = data.get("stripe_payment_method_id")
    cust_id = data.get("stripe_customer_id")

    # Try to find payment method from Stripe if not saved locally
    if not pm_id and cust_id:
        try:
            customer = stripe.Customer.retrieve(cust_id)
            pm_id = (customer.get("invoice_settings") or {}).get("default_payment_method")
            if not pm_id:
                pm_id = customer.get("default_source")
            if pm_id:
                await merge_user_data(req.email, {"stripe_payment_method_id": pm_id})
        except stripe.error.StripeError:
            pass

    if not pm_id or not cust_id:
        raise HTTPException(status_code=400, detail="No saved payment method. Add a card first.")

    amount_cents = data.get(f["topup_amount"], 500) or 500

    try:
        pi = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            customer=cust_id,
            payment_method=pm_id,
            off_session=True,
            confirm=True,
            description=f"{'Bot' if req.product == 'bot' else 'Transcription'} balance top-up",
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Payment failed: {str(e)}")

    # Credit balance
    current = data.get(f["balance"], 0) or 0
    if req.product == "bot":
        new_balance = current + amount_cents
    else:
        # Convert cents to minutes: $0.0015/min → 1 cent = 0.6667 min
        minutes_per_cent = 1 / 0.15  # ~6.667 minutes per cent
        new_balance = current + (amount_cents * minutes_per_cent)

    await merge_user_data(req.email, {f["balance"]: new_balance})

    return {
        "charged_cents": amount_cents,
        "new_balance": new_balance,
        "product": req.product,
        "payment_intent_id": pi.id,
    }


# ── Save payment method ─────────────────────────────────────────────────────

@router.post("/v1/balance/payment-method")
async def save_payment_method(req: PaymentMethodRequest) -> Dict[str, Any]:
    data = await get_user_data(req.email)
    cust_id = data.get("stripe_customer_id")

    if not cust_id:
        # Create or find Stripe customer
        customer = _ensure_customer(req.email)
        cust_id = customer.id
        await merge_user_data(req.email, {"stripe_customer_id": cust_id})

    try:
        stripe.PaymentMethod.attach(req.pm_id, customer=cust_id)
        stripe.Customer.modify(
            cust_id,
            invoice_settings={"default_payment_method": req.pm_id},
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Failed to save payment method: {str(e)}")

    await merge_user_data(req.email, {"stripe_payment_method_id": req.pm_id})

    return {"saved": True, "payment_method_id": req.pm_id}
