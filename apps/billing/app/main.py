from __future__ import annotations

import os
import json
from datetime import datetime
import time
from typing import Any, Dict, List, Optional

import stripe
import httpx
from fastapi import FastAPI, HTTPException, Request, status
from pydantic import BaseModel, EmailStr


STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
ADMIN_API_URL = os.getenv("ADMIN_API_URL")
ADMIN_API_TOKEN = os.getenv("ADMIN_API_TOKEN")
# Default return URL for Customer Portal
PORTAL_RETURN_URL = os.getenv("PORTAL_RETURN_URL")
if not PORTAL_RETURN_URL:
    raise RuntimeError("PORTAL_RETURN_URL env var is required for billing service")

if not STRIPE_SECRET_KEY:
    raise RuntimeError("STRIPE_SECRET_KEY env var is required for billing service")
if not ADMIN_API_URL or not ADMIN_API_TOKEN:
    raise RuntimeError("ADMIN_API_URL and ADMIN_API_TOKEN env vars are required for billing service")

stripe.api_key = STRIPE_SECRET_KEY
stripe.api_version = "2023-10-16"

app = FastAPI(title="Billing Service", version="0.2.0")


# ── Stripe price IDs (loaded from stripe_ids.json) ───────────────────────────

def _load_stripe_ids() -> Dict[str, Dict[str, str]]:
    """Load Stripe product/price IDs created by stripe_sync.py."""
    # Try multiple paths (billing service may run from different cwd)
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "product", "stripe_ids.json"),
        os.path.join(os.path.dirname(__file__), "stripe_ids.json"),
        "product/stripe_ids.json",
    ]
    for path in candidates:
        abs_path = os.path.abspath(path)
        if os.path.exists(abs_path):
            with open(abs_path) as f:
                ids = json.load(f)
            print(f"[BILLING] Loaded Stripe IDs from {abs_path}: {list(ids.keys())}")
            return ids
    print("[BILLING] WARNING: stripe_ids.json not found, will fall back to product search")
    return {}


STRIPE_IDS = _load_stripe_ids()

# Plan type → entitlements mapping
PLAN_ENTITLEMENTS = {
    "individual": {"max_concurrent_bots": 1},
    "bot_service": {"max_concurrent_bots": 0},  # usage-based, no fixed limit
    "transcription_api": {"max_concurrent_bots": 0},
}


def _get_price_id(plan_type: str) -> str:
    """Get Stripe price ID for a plan type."""
    ids = STRIPE_IDS.get(plan_type)
    if ids:
        return ids["price_id"]
    raise HTTPException(status_code=400, detail=f"No Stripe price configured for plan '{plan_type}'. Run stripe_sync.py.")


def _get_product_id(plan_type: str) -> str:
    """Get Stripe product ID for a plan type."""
    ids = STRIPE_IDS.get(plan_type)
    if ids:
        return ids["product_id"]
    raise HTTPException(status_code=400, detail=f"No Stripe product configured for plan '{plan_type}'. Run stripe_sync.py.")


# ── Legacy fallback for old "Bot subscription" product ────────────────────────

def _get_bot_product_and_price():
    """Legacy: find old Bot subscription product. Used for portal and trials."""
    # First try new IDs
    if "individual" in STRIPE_IDS:
        product = stripe.Product.retrieve(STRIPE_IDS["individual"]["product_id"])
        price = stripe.Price.retrieve(STRIPE_IDS["individual"]["price_id"])
        return product, price
    # Fallback to old product name
    products = stripe.Product.list(active=True, limit=100)
    bot_product = next((p for p in products.data if p.name in ("Bot subscription", "Vexa Individual")), None)
    if not bot_product:
        raise HTTPException(status_code=400, detail="No subscription product found. Run stripe_sync.py.")
    prices = stripe.Price.list(product=bot_product.id, active=True, limit=100)
    price = prices.data[0] if prices.data else None
    if not price:
        raise HTTPException(status_code=400, detail="No price found for product. Run stripe_sync.py.")
    return bot_product, price


# ── Admin API helper ──────────────────────────────────────────────────────────

async def admin_request(method: str, path: str, json_body: Optional[Dict[str, Any]] = None) -> httpx.Response:
    url = f"{ADMIN_API_URL}{path}"
    headers = {"X-Admin-API-Key": ADMIN_API_TOKEN}
    async with httpx.AsyncClient() as client:
        resp = await client.request(method, url, json=json_body, headers=headers, timeout=30)
        return resp


# ── Subscription helpers ─────────────────────────────────────────────────────

def extract_email_from_subscription(sub: Dict[str, Any]) -> Optional[str]:
    metadata = sub.get("metadata") or {}
    email = metadata.get("userEmail") or metadata.get("email")
    if email:
        return email
    cust_details = (sub.get("customer_details") or {})
    if cust_details.get("email"):
        return cust_details["email"]
    return None


def _identify_plan_from_subscription(sub: Dict[str, Any]) -> str:
    """Identify which plan a subscription belongs to based on its price IDs."""
    items = (sub.get("items") or {}).get("data") or []
    for item in items:
        price_id = item.get("price", {}).get("id") if isinstance(item.get("price"), dict) else item.get("price")
        for plan_type, ids in STRIPE_IDS.items():
            if ids.get("price_id") == price_id:
                return plan_type
    # Check metadata
    tier = (sub.get("metadata") or {}).get("tier")
    if tier:
        return tier
    return "standard"


def compute_entitlements_from_subscription(sub: Dict[str, Any]) -> Dict[str, Any]:
    status_val = sub.get("status") or "inactive"
    items = (sub.get("items") or {}).get("data") or []
    quantity = 0
    if items:
        first_item = items[0]
        quantity = int(first_item.get("quantity") or 0)

    plan_type = _identify_plan_from_subscription(sub)

    # Cancellation tracking
    scheduled_to_cancel = bool(sub.get("cancel_at_period_end"))
    cancel_at = sub.get("cancel_at")
    canceled_at = sub.get("canceled_at")
    current_period_end = sub.get("current_period_end")
    current_period_start = sub.get("current_period_start")
    trial_end = sub.get("trial_end")
    trial_start = sub.get("trial_start")

    normalized_status = (
        "scheduled_to_cancel" if scheduled_to_cancel and status_val == "active" else status_val
    )

    # Bot entitlements based on plan type
    plan_ent = PLAN_ENTITLEMENTS.get(plan_type, {})
    if normalized_status in ("canceled", "incomplete_expired", "unpaid"):
        max_bots = 0
    elif normalized_status in ("active", "trialing", "scheduled_to_cancel"):
        # For individual plan: fixed 1 bot (or quantity)
        # For metered plans: use plan default (0 = unlimited/usage-based)
        if plan_type == "individual":
            max_bots = max(quantity, plan_ent.get("max_concurrent_bots", 1))
        else:
            max_bots = plan_ent.get("max_concurrent_bots", quantity)
    else:
        max_bots = 0

    cancellation_date = (
        (cancel_at or sub.get("current_period_end")) if scheduled_to_cancel else canceled_at
    )

    return {
        "subscription_status": normalized_status,
        "max_concurrent_bots": max_bots,
        "subscription_tier": plan_type,
        "subscription_scheduled_to_cancel": scheduled_to_cancel,
        "subscription_cancel_at_period_end": scheduled_to_cancel,
        "subscription_cancellation_date": cancellation_date,
        "subscription_current_period_end": current_period_end,
        "subscription_current_period_start": current_period_start,
        "subscription_trial_end": trial_end,
        "subscription_trial_start": trial_start,
    }


def _ensure_customer(email: str) -> Any:
    customers = stripe.Customer.list(email=email, limit=1)
    if customers.data:
        return customers.data[0]
    return stripe.Customer.create(email=email, metadata={"userEmail": email})


def _has_any_subscription(customer_id: str) -> bool:
    subs = stripe.Subscription.list(customer=customer_id, status="all", limit=50)
    has = next((s for s in subs.data if s.status in ("active", "trialing", "past_due")), None) is not None
    return has


def _get_customer_best_subscription(customer_id: str) -> Dict[str, Any]:
    try:
        subs = stripe.Subscription.list(customer=customer_id, status="all", limit=50)
        if not subs.data:
            return {"subscription_status": "none", "max_concurrent_bots": 0}

        priority_order = ["active", "trialing", "scheduled", "past_due", "unpaid", "canceled", "incomplete"]
        best_subscription = None
        best_priority = float('inf')

        for sub in subs.data:
            try:
                priority = priority_order.index(sub.status)
                if priority < best_priority:
                    best_priority = priority
                    best_subscription = sub
            except ValueError:
                if best_priority > 100:
                    best_subscription = sub
                    best_priority = 100

        if best_subscription:
            return compute_entitlements_from_subscription(best_subscription)
        return {"subscription_status": "none", "max_concurrent_bots": 0}

    except Exception as e:
        print(f"[RECONCILE] Error: {e}")
        return {"subscription_status": "error", "max_concurrent_bots": 0}


def _reconcile_customer_entitlements(customer_email: str) -> Dict[str, Any]:
    try:
        customers = stripe.Customer.list(email=customer_email, limit=1)
        if not customers.data:
            return {"subscription_status": "no_customer", "max_concurrent_bots": 0}

        customer = customers.data[0]
        entitlements = _get_customer_best_subscription(customer.id)
        print(f"[RECONCILE] {customer_email}: {entitlements.get('subscription_tier', 'none')} -> {entitlements['max_concurrent_bots']} bots")
        return entitlements

    except Exception as e:
        print(f"[RECONCILE] Error: {e}")
        return {"subscription_status": "error", "max_concurrent_bots": 0}


# ── Webhook ───────────────────────────────────────────────────────────────────

@app.post("/v1/stripe/webhook")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("stripe-signature")
    if not STRIPE_WEBHOOK_SECRET or not signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing webhook secret or signature")

    try:
        event = stripe.Webhook.construct_event(body, signature, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Webhook parsing error")

    event_type = event.get("type")
    data_object = (event.get("data") or {}).get("object") or {}
    print(f"[WEBHOOK] {event_type} ({event.get('id')})")

    if event_type in {
        "customer.subscription.updated",
        "customer.subscription.created",
        "customer.subscription.deleted",
    }:
        sub = data_object
        email = extract_email_from_subscription(sub)
        if not email:
            cust_id = sub.get("customer")
            if cust_id:
                try:
                    customer = stripe.Customer.retrieve(cust_id)
                    email = customer.get("email")
                except stripe.error.StripeError:
                    email = f"{cust_id}@stripe.customer"

        if not email:
            return {"received": True, "note": "No email to map user"}

        entitlements = _reconcile_customer_entitlements(email)

        resp = await admin_request("POST", "/admin/users", {"email": email})
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=f"Admin API user upsert failed: {resp.text}")
        user_data = resp.json()
        user_id = user_data.get("id") or (user_data.get("data") or {}).get("id")

        patch_payload = {
            "max_concurrent_bots": entitlements["max_concurrent_bots"],
            "data": {
                "updated_by_webhook": int(time.time()),
                "stripe_customer_id": sub.get("customer"),
                "stripe_subscription_id": sub.get("id"),
                **{k: v for k, v in entitlements.items() if k != "max_concurrent_bots"}
            }
        }
        resp2 = await admin_request("PATCH", f"/admin/users/{user_id}", patch_payload)
        if resp2.status_code not in (200, 201):
            raise HTTPException(status_code=resp2.status_code, detail=f"Admin API patch failed: {resp2.text}")

        return {"received": True}

    elif event_type == "checkout.session.completed":
        checkout_session = data_object
        subscription_id = checkout_session.get("subscription")

        if subscription_id:
            try:
                subscription = stripe.Subscription.retrieve(subscription_id)
                customer_id = subscription.get("customer")
                customer = stripe.Customer.retrieve(customer_id)
                email = customer.get("email")

                if email:
                    entitlements = _reconcile_customer_entitlements(email)
                    resp = await admin_request("POST", "/admin/users", {"email": email})
                    if resp.status_code not in (200, 201):
                        return {"received": True, "error": "Admin API user upsert failed"}

                    user_data = resp.json()
                    user_id = user_data.get("id") or (user_data.get("data") or {}).get("id")

                    if user_id:
                        patch_payload = {
                            "max_concurrent_bots": entitlements["max_concurrent_bots"],
                            "data": {
                                "updated_by_webhook": int(time.time()),
                                "stripe_customer_id": customer_id,
                                "stripe_subscription_id": subscription.get("id"),
                                **{k: v for k, v in entitlements.items() if k != "max_concurrent_bots"}
                            }
                        }
                        await admin_request("PATCH", f"/admin/users/{user_id}", patch_payload)
                        print(f"[WEBHOOK] Checkout processed for {email}")

            except stripe.error.StripeError as e:
                print(f"[WEBHOOK] Error retrieving subscription {subscription_id}: {e}")
                return {"received": True, "error": f"Stripe error: {e}"}

        return {"received": True}

    elif event_type == "invoice.paid":
        # Handle metered billing invoice completion
        invoice = data_object
        print(f"[WEBHOOK] Invoice paid: {invoice.get('id')} amount={invoice.get('amount_paid')}")
        return {"received": True}

    else:
        return {"received": True, "ignored": event_type}


@app.post("/webhook/stripe")
async def stripe_webhook_alias(request: Request):
    return await stripe_webhook(request)


# ── Usage reporting (metered billing) ─────────────────────────────────────────

class UsageReport(BaseModel):
    email: EmailStr
    plan_type: str  # "bot_service", "realtime", "transcription_api"
    quantity: float  # hours or minutes depending on plan
    timestamp: Optional[int] = None  # Unix timestamp, defaults to now
    idempotency_key: Optional[str] = None


@app.post("/v1/usage")
async def report_usage(req: UsageReport):
    """Report metered usage for a customer's subscription."""
    if req.plan_type not in ("bot_service", "realtime", "transcription_api"):
        raise HTTPException(status_code=400, detail=f"Invalid plan_type '{req.plan_type}' for usage reporting")

    price_id = _get_price_id(req.plan_type)

    # Find customer
    customer = _ensure_customer(req.email)

    # Find active subscription with this price
    subs = stripe.Subscription.list(customer=customer.id, status="active", limit=50)
    target_item = None
    for sub in subs.data:
        items = (sub.get("items") or {}).get("data") or []
        for item in items:
            item_price_id = item.get("price", {}).get("id") if isinstance(item.get("price"), dict) else item.get("price")
            if item_price_id == price_id:
                target_item = item
                break
        if target_item:
            break

    if not target_item:
        raise HTTPException(
            status_code=404,
            detail=f"No active subscription with plan '{req.plan_type}' found for {req.email}"
        )

    # Report usage to Stripe
    ts = req.timestamp or int(time.time())

    # Stripe usage records use integer quantities
    # For sub-dollar amounts, we report in the native unit (hours or minutes)
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

    print(f"[USAGE] Reported {usage_quantity} {req.plan_type} units for {req.email} (item {target_item['id']})")

    return {
        "reported": True,
        "plan_type": req.plan_type,
        "quantity": usage_quantity,
        "usage_record_id": usage_record.get("id"),
        "subscription_item_id": target_item["id"],
    }


# ── Trials ────────────────────────────────────────────────────────────────────

class TrialRequest(BaseModel):
    email: EmailStr
    userId: int


@app.post("/v1/trials/api-key")
async def create_api_key_trial(req: TrialRequest):
    customers = stripe.Customer.list(email=req.email, limit=1)
    if customers.data:
        customer = customers.data[0]
    else:
        customer = stripe.Customer.create(email=req.email, metadata={"userId": str(req.userId)})

    subs = stripe.Subscription.list(customer=customer.id, limit=50)
    created_trial = False
    sub_obj: Optional[Dict[str, Any]] = None

    if len(subs.data) == 0:
        # Use new Individual price for trials
        price_id = _get_price_id("individual")

        trial_end = int(time.time()) + 3600
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
        raise HTTPException(status_code=token_resp.status_code, detail=f"Admin API token create failed: {token_resp.text}")
    token_json = token_resp.json()

    if created_trial and sub_obj is not None:
        patch_payload = {
            "stripe_customer_id": sub_obj.get("customer"),
            "stripe_subscription_id": sub_obj.get("id"),
            "max_concurrent_bots": 1,
            "subscription_status": "trialing",
            "subscription_tier": "individual",
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
        response.update({"trialCreated": False, "message": "API key created. Existing subscription detected."})

    return response


# ── Portal ────────────────────────────────────────────────────────────────────

class PortalRequest(BaseModel):
    email: EmailStr
    returnUrl: Optional[str] = None


@app.post("/v1/portal/session")
async def create_portal_session_endpoint(req: PortalRequest):
    customer = _ensure_customer(req.email)
    return_url = req.returnUrl or PORTAL_RETURN_URL

    try:
        # Use simple portal with cancel + payment method update
        session = stripe.billing_portal.Session.create(
            customer=customer.id,
            return_url=return_url,
        )
        return {"url": session.url}
    except stripe.error.StripeError as e:
        print(f"[PORTAL] Error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to create portal session: {str(e)}")


# ── Resolve URL (checkout or portal) ─────────────────────────────────────────

class ResolveUrlRequest(BaseModel):
    email: EmailStr
    context: str  # "pricing" | "dashboard"
    plan_type: Optional[str] = None  # "individual", "bot_service", "transcription_api"
    quantity: Optional[int] = None
    origin: Optional[str] = None
    successUrl: Optional[str] = None
    cancelUrl: Optional[str] = None
    returnUrl: Optional[str] = None


@app.post("/v1/stripe/resolve-url")
async def resolve_billing_url(req: ResolveUrlRequest):
    if req.context not in ("pricing", "dashboard"):
        raise HTTPException(status_code=400, detail="context must be 'pricing' or 'dashboard'")

    customer = _ensure_customer(req.email)
    has_subscription = _has_any_subscription(customer.id)
    print(f"[RESOLVE] {customer.email} has_subscription={has_subscription}")

    default_origin = req.origin or PORTAL_RETURN_URL.rsplit("/", 1)[0]
    success_url = req.successUrl or f"{default_origin}/account"
    cancel_url = req.cancelUrl or f"{default_origin}/pricing"

    # Add-on products (transcription_api) → always checkout alongside existing sub.
    # Bot plans (individual, bot_service) are mutually exclusive → switch cancels old.
    ADDON_PLAN_TYPES = {"transcription_api"}
    BOT_PLAN_TYPES = {"individual", "bot_service"}
    go_to_checkout = False

    if req.plan_type in ADDON_PLAN_TYPES:
        # Add-ons can stack alongside any subscription
        go_to_checkout = True
    elif has_subscription and req.plan_type in BOT_PLAN_TYPES:
        # Check if this is a plan switch (different bot plan)
        subs = stripe.Subscription.list(customer=customer.id, status="all", limit=50)
        active_sub = next((s for s in subs.data if s.status in ("active", "trialing", "past_due")), None)
        if active_sub:
            current_tier = active_sub.metadata.get("tier", "")
            if current_tier != req.plan_type:
                # Switch: cancel old subscription, then create checkout for new one
                print(f"[RESOLVE] Switching {customer.email} from '{current_tier}' to '{req.plan_type}', canceling {active_sub.id}")
                stripe.Subscription.cancel(active_sub.id)
                go_to_checkout = True
            # else: same plan → fall through to Portal

    if has_subscription and not go_to_checkout:
        # Manage existing subscription via Stripe Portal
        portal_return_url = f"{default_origin}/account"
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer.id,
                return_url=portal_return_url,
            )
            return {"url": session.url}
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Portal error: {str(e)}")
    else:
        if req.context == "pricing":
            plan_type = req.plan_type or "individual"

            # Build line items based on plan
            line_items: List[Dict[str, Any]] = []

            if plan_type == "individual":
                price_id = _get_price_id("individual")
                line_items.append({"price": price_id, "quantity": 1})
            elif plan_type == "bot_service":
                price_id = _get_price_id("bot_service")
                line_items.append({"price": price_id})
                # Optionally add real-time add-on
            elif plan_type == "transcription_api":
                price_id = _get_price_id("transcription_api")
                line_items.append({"price": price_id})
            else:
                raise HTTPException(status_code=400, detail=f"Unknown plan_type '{plan_type}'")

            try:
                checkout = stripe.checkout.Session.create(
                    mode="subscription",
                    customer=customer.id,
                    line_items=line_items,
                    success_url=success_url,
                    cancel_url=cancel_url,
                    allow_promotion_codes=True,
                    subscription_data={
                        "metadata": {
                            "userEmail": customer.email,
                            "tier": plan_type,
                        }
                    },
                )
                return {"url": checkout.url}
            except stripe.error.StripeError as e:
                raise HTTPException(status_code=400, detail=f"Checkout error: {str(e)}")
        else:
            return {"url": f"{default_origin}/pricing"}


# ── Stats ─────────────────────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    total_accounts: int
    total_contracted_bots: int


@app.get("/v1/stats")
async def get_current_stats() -> StatsResponse:
    try:
        resp = await admin_request("GET", "/admin/users?limit=10000")
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Admin API failed: {resp.text}")
        users_data = resp.json()
        accounts_with_bots = [u for u in users_data if u.get("max_concurrent_bots", 0) > 0]
        return StatsResponse(
            total_accounts=len(accounts_with_bots),
            total_contracted_bots=sum(u.get("max_concurrent_bots", 0) for u in accounts_with_bots)
        )
    except Exception as e:
        print(f"[STATS] Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")


# ── Stripe product info ──────────────────────────────────────────────────────

@app.get("/v1/products")
async def list_products():
    """Return configured Stripe product/price IDs for the frontend."""
    return {"products": STRIPE_IDS}


@app.get("/")
async def health():
    return {"status": "ok", "service": "billing"}
