from __future__ import annotations

import time
from typing import Any, Dict, Optional

import stripe
from fastapi import APIRouter, HTTPException

from .config import get_price_id
from .admin import admin_request
from .models import TrialRequest

router = APIRouter()


@router.post("/v1/trials/api-key")
async def create_api_key_trial(req: TrialRequest) -> Dict[str, Any]:
    customers = stripe.Customer.list(email=req.email, limit=1)
    if customers.data:
        customer = customers.data[0]
    else:
        customer = stripe.Customer.create(email=req.email, metadata={"userId": str(req.userId)})

    subs = stripe.Subscription.list(customer=customer.id, limit=50)
    created_trial = False
    sub_obj: Optional[Any] = None

    if len(subs.data) == 0:
        price_id = get_price_id("individual")
        trial_end = int(time.time()) + 3600  # 1 hour

        sub_obj = stripe.Subscription.create(
            customer=customer.id,
            items=[{"price": price_id, "quantity": 1}],
            trial_end=trial_end,
            trial_settings={"end_behavior": {"missing_payment_method": "cancel"}},
            metadata={
                "userId": str(req.userId),
                "userEmail": req.email,
                "tier": "individual",
                "trialType": "1_hour",
                "createdVia": "api_key_creation",
            },
        )
        created_trial = True

    token_resp = await admin_request("POST", f"/admin/users/{req.userId}/tokens")
    if token_resp.status_code not in (200, 201):
        raise HTTPException(status_code=token_resp.status_code, detail=f"Token create failed: {token_resp.text}")
    token_json = token_resp.json()

    if created_trial and sub_obj is not None:
        patch = {
            "stripe_customer_id": sub_obj.get("customer"),
            "stripe_subscription_id": sub_obj.get("id"),
            "max_concurrent_bots": 1,
            "subscription_status": "trialing",
            "subscription_tier": "individual",
        }
        await admin_request("PATCH", f"/admin/users/{req.userId}", patch)

    response: Dict[str, Any] = {"token": token_json.get("token") or token_json}
    if created_trial:
        response.update({
            "trialCreated": True,
            "trialDuration": "1 hour",
            "trialExpiresAt": sub_obj.get("trial_end"),
            "message": "API key created with 1-hour FREE trial",
        })
    else:
        response.update({"trialCreated": False, "message": "API key created. Existing subscription detected."})

    return response
