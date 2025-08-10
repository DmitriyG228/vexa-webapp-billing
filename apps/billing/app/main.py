from __future__ import annotations

import os
import json
import hmac
import hashlib
from typing import Any, Dict, Optional

import stripe
import httpx
from fastapi import FastAPI, HTTPException, Request, status
from pydantic import BaseModel, EmailStr


STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
ADMIN_API_URL = os.getenv("ADMIN_API_URL")
ADMIN_API_TOKEN = os.getenv("ADMIN_API_TOKEN")

if not STRIPE_SECRET_KEY:
    raise RuntimeError("STRIPE_SECRET_KEY env var is required for billing service")
if not ADMIN_API_URL or not ADMIN_API_TOKEN:
    raise RuntimeError("ADMIN_API_URL and ADMIN_API_TOKEN env vars are required for billing service")

stripe.api_key = STRIPE_SECRET_KEY
stripe.api_version = "2023-10-16"

app = FastAPI(title="Billing Service", version="0.1.0")


def verify_stripe_signature(payload: bytes, signature: str, secret: str) -> bool:
    try:
        timestamp: Optional[str] = None
        received_signature: Optional[str] = None
        for part in (signature or "").split(","):
            if part.startswith("t="):
                timestamp = part.split("=")[1]
            elif part.startswith("v1="):
                received_signature = part.split("=")[1]

        if not timestamp or not received_signature:
            print(f"❌ [WEBHOOK] Missing timestamp or signature: t={timestamp}, v1={received_signature}")
            return False

        expected_signature = hmac.new(
            secret.encode("utf-8"),
            f"{timestamp}.{payload.decode('utf-8')}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        is_valid = hmac.compare_digest(received_signature, expected_signature)
        if not is_valid:
            print(f"❌ [WEBHOOK] Signature mismatch:")
            print(f"   Timestamp: {timestamp}")
            print(f"   Received:  {received_signature[:20]}...")
            print(f"   Expected:  {expected_signature[:20]}...")
            print(f"   Secret:    {secret[:20]}...")
            print(f"   Payload length: {len(payload)}")
        else:
            print(f"✅ [WEBHOOK] Signature valid for timestamp {timestamp}")
        
        return is_valid
    except Exception as e:
        print(f"❌ [WEBHOOK] Signature verification error: {e}")
        return False


async def admin_request(method: str, path: str, json_body: Optional[Dict[str, Any]] = None) -> httpx.Response:
    url = f"{ADMIN_API_URL}{path}"
    headers = {"X-Admin-API-Key": ADMIN_API_TOKEN}
    async with httpx.AsyncClient() as client:
        resp = await client.request(method, url, json=json_body, headers=headers, timeout=30)
        return resp


def extract_email_from_subscription(sub: Dict[str, Any]) -> Optional[str]:
    # Prefer explicit metadata
    metadata = sub.get("metadata") or {}
    email = metadata.get("userEmail") or metadata.get("email")
    if email:
        return email
    # Try nested customer_details (if event carried it)
    cust_details = (sub.get("customer_details") or {})
    if cust_details.get("email"):
        return cust_details["email"]
    return None


def compute_entitlements_from_subscription(sub: Dict[str, Any]) -> Dict[str, Any]:
    status_val = sub.get("status") or "inactive"
    items = (sub.get("items") or {}).get("data") or []
    quantity = 0
    if items:
        first_item = items[0]
        quantity = int(first_item.get("quantity") or 0)
    
    # Bot count logic: 0 for canceled/deleted, quantity for active/trialing
    max_bots = quantity if status_val in ("active", "trialing") else 0
    
    # Cancellation tracking fields
    scheduled_to_cancel = bool(sub.get("cancel_at_period_end"))
    cancel_at = sub.get("cancel_at")  # Unix timestamp when cancellation takes effect
    canceled_at = sub.get("canceled_at")  # Unix timestamp when subscription was canceled
    current_period_end = sub.get("current_period_end")
    current_period_start = sub.get("current_period_start")
    trial_end = sub.get("trial_end")
    trial_start = sub.get("trial_start")
    
    return {
        "subscription_status": status_val,
        "max_concurrent_bots": max_bots,
        "subscription_scheduled_to_cancel": scheduled_to_cancel,
        "subscription_cancel_at_period_end": scheduled_to_cancel,
        "subscription_cancellation_date": canceled_at,
        "subscription_current_period_end": current_period_end,
        "subscription_current_period_start": current_period_start,
        "subscription_trial_end": trial_end,
        "subscription_trial_start": trial_start,
    }


@app.post("/v1/stripe/webhook")
async def stripe_webhook(request: Request):
    print(f"🔔 [WEBHOOK] Received webhook request")
    print(f"🔔 [WEBHOOK] Headers: {dict(request.headers)}")
    body = await request.body()
    print(f"🔔 [WEBHOOK] Body length: {len(body)}")
    signature = request.headers.get("stripe-signature")
    if not STRIPE_WEBHOOK_SECRET or not signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing webhook secret or signature")
    if not verify_stripe_signature(body, signature, STRIPE_WEBHOOK_SECRET):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    event = json.loads(body.decode("utf-8"))
    event_type = event.get("type")
    data_object = (event.get("data") or {}).get("object") or {}

    # Only handle subscription-related events for now
    if event_type in {"customer.subscription.updated", "customer.subscription.created", "customer.subscription.deleted"}:
        sub = data_object
        entitlements = compute_entitlements_from_subscription(sub)

        # Try to get email; if not present, fetch the customer
        email = extract_email_from_subscription(sub)
        if not email:
            cust_id = sub.get("customer")
            if cust_id:
                try:
                    customer = stripe.Customer.retrieve(cust_id)
                    email = customer.get("email")
                except stripe.error.StripeError as e:
                    print(f"Warning: Could not retrieve customer {cust_id}: {e}")
                    # For testing, use fake email based on customer ID
                    email = f"{cust_id}@stripe.customer"

        if not email:
            # Without an email we cannot map to a user; accept but no-op
            return {"received": True, "note": "No email to map user"}

        # Find or create user by email to obtain user_id
        resp = await admin_request("POST", "/admin/users", {"email": email})
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=f"Admin API user upsert failed: {resp.text}")
        user_data = resp.json()
        user_id = user_data.get("id")
        if not user_id:
            # Some admin responses may wrap the user
            user_id = (user_data.get("data") or {}).get("id")

        # Patch user with subscription details
        patch_payload = {
            "stripe_customer_id": sub.get("customer"),
            "stripe_subscription_id": sub.get("id"),
            **entitlements,
            "subscription_tier": (sub.get("metadata") or {}).get("tier") or "standard",
        }
        resp2 = await admin_request("PATCH", f"/admin/users/{user_id}", patch_payload)
        if resp2.status_code not in (200, 201):
            raise HTTPException(status_code=resp2.status_code, detail=f"Admin API patch failed: {resp2.text}")

        return {"received": True}

    # ignore others for now
    return {"received": True, "ignored": event_type}


class TrialRequest(BaseModel):
    email: EmailStr
    userId: int


@app.post("/v1/trials/api-key")
async def create_api_key_trial(req: TrialRequest):
    # 1) Ensure customer
    customers = stripe.Customer.list(email=req.email, limit=1)
    if customers.data:
        customer = customers.data[0]
    else:
        customer = stripe.Customer.create(email=req.email, metadata={"userId": str(req.userId)})

    # 2) Check if any subscriptions exist
    subs = stripe.Subscription.list(customer=customer.id, limit=50)
    created_trial = False
    sub_obj: Optional[Dict[str, Any]] = None

    if len(subs.data) == 0:
        # Find product/price
        products = stripe.Product.list(active=True, limit=100)
        bot_product = next((p for p in products.data if p.name == "Bot subscription"), None)
        if not bot_product:
            raise HTTPException(status_code=400, detail="Product 'Bot subscription' not found. Run stripe_sync script.")
        prices = stripe.Price.list(product=bot_product.id, active=True, limit=100)
        startup_price = next((p for p in prices.data if getattr(p, "nickname", None) == "Startup"), None)
        if not startup_price:
            raise HTTPException(status_code=400, detail="Price 'Startup' not found. Run stripe_sync script.")

        trial_end = int(__import__("time").time()) + 60 * 60  # 1 hour
        sub_obj = stripe.Subscription.create(
            customer=customer.id,
            items=[{"price": startup_price.id, "quantity": 1}],
            trial_end=trial_end,
            trial_settings={"end_behavior": {"missing_payment_method": "cancel"}},
            metadata={
                "userId": str(req.userId),
                "userEmail": req.email,
                "tier": "api_key_trial",
                "trialType": "1_hour",
                "createdVia": "api_key_creation",
            },
        )
        created_trial = True

    # 3) Create API token via Admin API
    token_resp = await admin_request("POST", f"/admin/users/{req.userId}/tokens")
    if token_resp.status_code not in (200, 201):
        raise HTTPException(status_code=token_resp.status_code, detail=f"Admin API token create failed: {token_resp.text}")
    token_json = token_resp.json()

    # 4) Patch user with subscription info if we created one
    if created_trial and sub_obj is not None:
        patch_payload = {
            "stripe_customer_id": sub_obj.get("customer"),
            "stripe_subscription_id": sub_obj.get("id"),
            "max_concurrent_bots": 1,
            "subscription_status": "trialing",
            "subscription_tier": "api_key_trial",
        }
        await admin_request("PATCH", f"/admin/users/{req.userId}", patch_payload)

    response: Dict[str, Any] = {"token": token_json.get("token") or token_json}
    if created_trial:
        response.update({
            "trialCreated": True,
            "trialDuration": "1 hour",
            "trialExpiresAt": sub_obj.get("trial_end"),
            "message": "API key created with 1-hour FREE trial",
        })
    else:
        response.update({
            "trialCreated": False,
            "message": "API key created. Existing subscription detected.",
        })

    return response


class PortalRequest(BaseModel):
    email: EmailStr
    returnUrl: Optional[str] = None


@app.post("/v1/portal/session")
async def create_portal_session(req: PortalRequest):
    customers = stripe.Customer.list(email=req.email, limit=1)
    if not customers.data:
        raise HTTPException(status_code=404, detail="No customer found for this email")
    customer = customers.data[0]
    subs = stripe.Subscription.list(customer=customer.id, status="all", limit=5)
    active = next((s for s in subs.data if s.status in ("active", "trialing")), None)
    args: Dict[str, Any] = {
        "customer": customer.id,
        "return_url": req.returnUrl or "http://localhost:3001/dashboard", #TODO: Should be dynamic
    }
    if active and active.status == "trialing":
        args["flow_data"] = {"type": "payment_method_update"}
    session = stripe.billing_portal.Session.create(**args)  # type: ignore[attr-defined]
    return {"url": session.url}


# Add alias route for Stripe webhook (matches the public URL)
@app.post("/webhook/stripe")
async def stripe_webhook_alias(request: Request):
    """Alias route for Stripe webhook to match public URL path."""
    return await stripe_webhook(request)


@app.get("/")
async def health():
    return {"status": "ok", "service": "billing"}

