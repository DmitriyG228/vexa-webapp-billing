from __future__ import annotations

import os
import json
from datetime import datetime
import time
from typing import Any, Dict, Optional

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

app = FastAPI(title="Billing Service", version="0.1.0")



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
        print(f"🔍 [WEBHOOK] Extracted quantity {quantity} from subscription items")
    else:
        print(f"🔍 [WEBHOOK] No items found in subscription, quantity=0")
    
    # Cancellation tracking fields
    scheduled_to_cancel = bool(sub.get("cancel_at_period_end"))
    cancel_at = sub.get("cancel_at")  # Unix timestamp when cancellation will take effect (Stripe)
    canceled_at = sub.get("canceled_at")  # Unix timestamp when subscription was actually canceled
    current_period_end = sub.get("current_period_end")
    current_period_start = sub.get("current_period_start")
    trial_end = sub.get("trial_end")
    trial_start = sub.get("trial_start")
    
    # Normalize status: reflect scheduled cancellation explicitly
    normalized_status = (
        "scheduled_to_cancel" if scheduled_to_cancel and status_val == "active" else status_val
    )

    # Bot count logic: 
    # - 0 for actually canceled/deleted/unpaid subscriptions
    # - quantity for active/trialing subscriptions (even if scheduled to cancel)
    # - User keeps access until subscription actually ends
    if normalized_status in ("canceled", "incomplete_expired", "unpaid"):
        print(f"🚫 [WEBHOOK] Subscription canceled/expired - setting max_bots to 0")
        max_bots = 0
    elif normalized_status in ("active", "trialing", "scheduled_to_cancel"):
        if normalized_status == "scheduled_to_cancel":
            print(f"⚠️ [WEBHOOK] Subscription scheduled for cancellation - keeping max_bots at {quantity} until {cancel_at or sub.get('current_period_end')}")
        max_bots = quantity
    else:
        print(f"⚠️ [WEBHOOK] Unknown subscription status '{normalized_status}' - setting max_bots to 0")
        max_bots = 0
    
    # Determine the displayed cancellation date:
    # - If scheduled to cancel, show the effective end date (cancel_at or current_period_end)
    # - If already canceled, show canceled_at
    cancellation_date = (
        (cancel_at or sub.get("current_period_end")) if scheduled_to_cancel else canceled_at
    )

    return {
        "subscription_status": normalized_status,
        "max_concurrent_bots": max_bots,
        "subscription_scheduled_to_cancel": scheduled_to_cancel,
        "subscription_cancel_at_period_end": scheduled_to_cancel,
        "subscription_cancellation_date": cancellation_date,
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
    
    # Log the full webhook body for debugging
    try:
        body_str = body.decode('utf-8')
        print(f"🔍 [WEBHOOK] Full body: {body_str}")
    except Exception as e:
        print(f"❌ [WEBHOOK] Failed to decode body: {e}")
    
    signature = request.headers.get("stripe-signature")
    if not STRIPE_WEBHOOK_SECRET or not signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing webhook secret or signature")
    
    # Use Stripe's construct_event for proper signature verification
    try:
        event = stripe.Webhook.construct_event(body, signature, STRIPE_WEBHOOK_SECRET)
        print(f"✅ [WEBHOOK] Signature verified successfully using Stripe library")
    except stripe.error.SignatureVerificationError as e:
        print(f"❌ [WEBHOOK] Stripe signature verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")
    except Exception as e:
        print(f"❌ [WEBHOOK] Error parsing webhook: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Webhook parsing error")
    
    event_type = event.get("type")
    data_object = (event.get("data") or {}).get("object") or {}
    print(f"🔔 [WEBHOOK] Event type: {event_type}")
    print(f"🔍 [WEBHOOK] Event ID: {event.get('id')}")
    print(f"🔍 [WEBHOOK] Data object keys: {list(data_object.keys())}")
    print(f"🔍 [WEBHOOK] Data object: {json.dumps(data_object, indent=2, default=str)}")

    # Handle subscription-related events with reconciliation
    if event_type in {"customer.subscription.updated", "customer.subscription.created", "customer.subscription.deleted"}:
        sub = data_object
        print(f"🔍 [WEBHOOK] Processing subscription event: {event_type}")
        print(f"🔍 [WEBHOOK] Subscription ID: {sub.get('id')} (status: {sub.get('status')})")

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

        print(f"🔔 [WEBHOOK] Reconciling entitlements for {email} due to {event_type}")
        
        # Use reconciliation instead of processing the event directly
        # This prevents race conditions where trial cancellation overwrites active subscription
        entitlements = _reconcile_customer_entitlements(email)

        # Find or create user by email to obtain user_id
        resp = await admin_request("POST", "/admin/users", {"email": email})
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=f"Admin API user upsert failed: {resp.text}")
        user_data = resp.json()
        user_id = user_data.get("id")
        if not user_id:
            # Some admin responses may wrap the user
            user_id = (user_data.get("data") or {}).get("id")

        # Separate root-level fields from data fields
        root_fields = {
            "max_concurrent_bots": entitlements["max_concurrent_bots"]
        }
        
        # For reconciled entitlements, we use the best subscription data
        # Get the customer's best subscription for metadata
        try:
            customers = stripe.Customer.list(email=email, limit=1)
            if customers.data:
                best_sub_entitlements = _get_customer_best_subscription(customers.data[0].id)
                # Find the actual subscription object for metadata
                subs = stripe.Subscription.list(customer=customers.data[0].id, status="all", limit=50)
                best_sub = None
                if subs.data:
                    # Get the subscription that was used for entitlement calculation
                    priority_order = ["active", "trialing", "scheduled", "past_due", "unpaid", "canceled", "incomplete"]
                    best_priority = float('inf')
                    for s in subs.data:
                        try:
                            priority = priority_order.index(s.status)
                            if priority < best_priority:
                                best_priority = priority
                                best_sub = s
                        except ValueError:
                            continue
        except Exception as e:
            print(f"❌ [WEBHOOK] Error getting best subscription for metadata: {e}")
            best_sub = sub  # fallback to event subscription
        
        data_fields = {
            # Use UNIX seconds for all timestamps for consistency
            "updated_by_webhook": int(time.time()),
            "stripe_customer_id": (best_sub or sub).get("customer"),
            "stripe_subscription_id": (best_sub or sub).get("id"),
            "subscription_tier": ((best_sub or sub).get("metadata") or {}).get("tier") or "standard",
            **{k: v for k, v in entitlements.items() if k != "max_concurrent_bots"}
        }
        
        # Patch user with both root fields and data
        patch_payload = {
            **root_fields,
            "data": data_fields
        }
        resp2 = await admin_request("PATCH", f"/admin/users/{user_id}", patch_payload)
        if resp2.status_code not in (200, 201):
            raise HTTPException(status_code=resp2.status_code, detail=f"Admin API patch failed: {resp2.text}")

        return {"received": True}

    # Handle checkout completion events with reconciliation
    elif event_type == "checkout.session.completed":
        checkout_session = data_object
        subscription_id = checkout_session.get("subscription")
        print(f"🔍 [WEBHOOK] Checkout completed, subscription_id: {subscription_id}")
        
        if subscription_id:
            # Get customer email and use reconciliation
            try:
                subscription = stripe.Subscription.retrieve(subscription_id)
                customer_id = subscription.get("customer")
                customer = stripe.Customer.retrieve(customer_id)
                email = customer.get("email")
                
                if email:
                    print(f"🔔 [WEBHOOK] Reconciling entitlements for {email} due to checkout completion")
                    
                    # Use reconciliation to prevent race conditions
                    entitlements = _reconcile_customer_entitlements(email)
                    
                    # Process the subscription entitlements
                    resp = await admin_request("POST", "/admin/users", {"email": email})
                    if resp.status_code not in (200, 201):
                        print(f"❌ [WEBHOOK] Admin API user upsert failed: {resp.text}")
                        return {"received": True, "error": "Admin API user upsert failed"}
                    
                    user_data = resp.json()
                    user_id = user_data.get("id") or (user_data.get("data") or {}).get("id")
                    
                    if user_id:
                        # Get the best subscription for metadata
                        best_sub_entitlements = _get_customer_best_subscription(customer_id)
                        subs = stripe.Subscription.list(customer=customer_id, status="all", limit=50)
                        best_sub = subscription  # default to checkout subscription
                        if subs.data:
                            priority_order = ["active", "trialing", "scheduled", "past_due", "unpaid", "canceled", "incomplete"]
                            best_priority = float('inf')
                            for s in subs.data:
                                try:
                                    priority = priority_order.index(s.status)
                                    if priority < best_priority:
                                        best_priority = priority
                                        best_sub = s
                                except ValueError:
                                    continue
                        
                        root_fields = {"max_concurrent_bots": entitlements["max_concurrent_bots"]}
                        data_fields = {
                            "updated_by_webhook": int(time.time()),
                            "stripe_customer_id": customer_id,
                            "stripe_subscription_id": best_sub.get("id"),
                            "subscription_tier": (best_sub.get("metadata") or {}).get("tier") or "standard",
                            **{k: v for k, v in entitlements.items() if k != "max_concurrent_bots"}
                        }
                        
                        patch_payload = {**root_fields, "data": data_fields}
                        resp2 = await admin_request("PATCH", f"/admin/users/{user_id}", patch_payload)
                        if resp2.status_code not in (200, 201):
                            print(f"❌ [WEBHOOK] Admin API patch failed: {resp2.text}")
                            return {"received": True, "error": "Admin API patch failed"}
                        
                        print(f"✅ [WEBHOOK] Successfully processed checkout completion with reconciliation for {email}")
                
            except stripe.error.StripeError as e:
                print(f"❌ [WEBHOOK] Error retrieving subscription {subscription_id}: {e}")
                return {"received": True, "error": f"Stripe error: {e}"}
        
        return {"received": True}

    # Log other events but don't process them
    else:
        print(f"🔍 [WEBHOOK] Ignoring event type: {event_type}")
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

        # Trial duration: 1 hour
        trial_end = int(__import__("time").time()) + 3600
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
    
    print(f"🔧 [PORTAL] Creating portal for customer {customer.id} ({req.email})")
    
    # Get the Bot subscription product and Startup price
    products = stripe.Product.list(active=True, limit=100)
    bot_product = next((p for p in products.data if p.name == "Bot subscription"), None)
    if not bot_product:
        raise HTTPException(status_code=400, detail="Product 'Bot subscription' not found. Run stripe_sync script.")
    
    prices = stripe.Price.list(product=bot_product.id, active=True, limit=100)
    startup_price = next((p for p in prices.data if getattr(p, "nickname", None) == "Startup"), None)
    if not startup_price:
        raise HTTPException(status_code=400, detail="Price 'Startup' not found. Run stripe_sync script.")
    
    print(f"✅ [PORTAL] Found product {bot_product.id} and price {startup_price.id}")
    
    # Try to reuse existing portal configuration or create new one
    try:
        # Check for existing configurations
        existing_configs = stripe.billing_portal.Configuration.list(limit=10)
        portal_config = None
        
        # for config in existing_configs.data:
        #     if (config.features.subscription_update.enabled and 
        #         config.features.subscription_cancel.enabled):
        #         portal_config = config
        #         print(f"♻️ [PORTAL] Reusing existing configuration {config.id}")
        #         break
        
        if not portal_config:
            print(f"➕ [PORTAL] Creating new portal configuration")
            # Create portal configuration with full subscription management
            portal_config = stripe.billing_portal.Configuration.create(
                features={
                    "subscription_update": {
                        "enabled": True,
                        "default_allowed_updates": ["price", "quantity"],
                        "products": [{"product": bot_product.id, "prices": [startup_price.id]}],
                        "proration_behavior": "always_invoice",
                    },
                    "subscription_cancel": {"enabled": True},
                    "payment_method_update": {"enabled": True},
                    "invoice_history": {"enabled": True},
                    # "customer_update": {
                    #     "enabled": True,
                    #     "allowed_updates": ["email", "address", "phone", "tax_id"]
                    # },
                },
                default_return_url=PORTAL_RETURN_URL,
            )
            print(f"✅ [PORTAL] Created configuration {portal_config.id}")
        
        # Determine customer's payment method and subscription state
        payment_methods = stripe.PaymentMethod.list(customer=customer.id, type="card", limit=1)
        has_payment_method = bool(payment_methods.data)
        subs = stripe.Subscription.list(customer=customer.id, status="all", limit=50)
        active_subscription = next((s for s in subs.data if s.status == "active"), None)
        has_active_subscription = active_subscription is not None

        print(
            f"🔎 [PORTAL] has_payment_method={has_payment_method}, "
            f"has_active_subscription={has_active_subscription} (ignoring trials)"
        )

        # Branch flows based on state:
        # 1) If no payment method, send them directly to add one, then back to portal homepage
        if not has_payment_method:
            print("➡️  [PORTAL] Starting payment_method_update flow (no default PM found)")
            session = stripe.billing_portal.Session.create(
                customer=customer.id,
                return_url=req.returnUrl or PORTAL_RETURN_URL,
                configuration=portal_config.id,
                flow={
                    "type": "payment_method_update",
                    "after_completion": {"type": "portal_homepage"},
                },
            )
        # 2) If no active subscription, open portal homepage where Subscribe button will appear
        elif not has_active_subscription:
            print("➡️  [PORTAL] Opening portal homepage (no active subscription)")
            session = stripe.billing_portal.Session.create(
                customer=customer.id,
                return_url=req.returnUrl or PORTAL_RETURN_URL,
                configuration=portal_config.id,
            )
        # 3) If there is an active subscription, open portal homepage for manage/cancel
        else:
            print(
                f"➡️  [PORTAL] Opening portal homepage (active subscription {active_subscription.id})"
            )
            session = stripe.billing_portal.Session.create(
                customer=customer.id,
                return_url=req.returnUrl or PORTAL_RETURN_URL,
                configuration=portal_config.id,
            )

        print(f"✅ [PORTAL] Created session {session.id} with config {portal_config.id}")
        return {"url": session.url}
        
    except stripe.error.StripeError as e:
        print(f"❌ [PORTAL] Stripe error creating portal: {e}")
        # Fallback to default portal if configuration creation fails
        session = stripe.billing_portal.Session.create(
            customer=customer.id,
            return_url=req.returnUrl or PORTAL_RETURN_URL,
        )
        print(f"⚠️ [PORTAL] Fallback to default portal: {session.id}")
        return {"url": session.url}
    except Exception as e:
        print(f"❌ [PORTAL] Unexpected error creating portal: {e}")
        # Fallback to default portal if anything fails
        session = stripe.billing_portal.Session.create(
            customer=customer.id,
            return_url=req.returnUrl or PORTAL_RETURN_URL,
        )
        print(f"⚠️ [PORTAL] Fallback to default portal: {session.id}")
        return {"url": session.url}


# ---------- New: Resolve URL for pricing/dashboard flows ----------
class ResolveUrlRequest(BaseModel):
    email: EmailStr
    context: str  # "pricing" | "dashboard"
    quantity: Optional[int] = None  # for pricing checkout
    # webapp URLs
    origin: Optional[str] = None
    successUrl: Optional[str] = None
    cancelUrl: Optional[str] = None
    returnUrl: Optional[str] = None


class StatsResponse(BaseModel):
    total_accounts: int  # Only accounts with more than 0 contracted bots
    total_contracted_bots: int


def _get_bot_product_and_price():
    products = stripe.Product.list(active=True, limit=100)
    bot_product = next((p for p in products.data if p.name == "Bot subscription"), None)
    if not bot_product:
        raise HTTPException(status_code=400, detail="Product 'Bot subscription' not found. Run stripe_sync script.")
    prices = stripe.Price.list(product=bot_product.id, active=True, limit=100)
    startup_price = next((p for p in prices.data if getattr(p, "nickname", None) == "Startup"), None)
    if not startup_price:
        raise HTTPException(status_code=400, detail="Price 'Startup' not found. Run stripe_sync script.")
    return bot_product, startup_price


def _ensure_customer(email: str) -> Any:
    customers = stripe.Customer.list(email=email, limit=1)
    if customers.data:
        return customers.data[0]
    return stripe.Customer.create(email=email, metadata={"userEmail": email})


def _has_any_subscription(customer_id: str) -> bool:
    subs = stripe.Subscription.list(customer=customer_id, status="all", limit=50)
    # Only count active and scheduled_to_cancel as having a subscription
    # Trials are treated as "no subscription" for routing purposes
    has = next((s for s in subs.data if s.status in ("active", "scheduled")), None) is not None
    return has


def _get_customer_best_subscription(customer_id: str) -> Dict[str, Any]:
    """
    Get the customer's best current subscription state to avoid race conditions.
    Returns the subscription with the highest priority: active > trialing > scheduled > others
    """
    try:
        subs = stripe.Subscription.list(customer=customer_id, status="all", limit=50)
        if not subs.data:
            print(f"🔍 [RECONCILE] No subscriptions found for customer {customer_id}")
            return {"status": "none", "max_concurrent_bots": 0}
        
        # Priority order: active -> trialing -> scheduled -> others
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
                # Unknown status, give it low priority
                if best_priority > 100:
                    best_subscription = sub
                    best_priority = 100
        
        if best_subscription:
            print(f"🔍 [RECONCILE] Best subscription for customer {customer_id}: {best_subscription.id} (status: {best_subscription.status})")
            return compute_entitlements_from_subscription(best_subscription)
        else:
            print(f"🔍 [RECONCILE] No valid subscription found for customer {customer_id}")
            return {"status": "none", "max_concurrent_bots": 0}
            
    except Exception as e:
        print(f"❌ [RECONCILE] Error getting customer subscriptions: {e}")
        return {"status": "error", "max_concurrent_bots": 0}


def _reconcile_customer_entitlements(customer_email: str) -> Dict[str, Any]:
    """
    Reconcile customer entitlements by fetching their current subscription state.
    This prevents race conditions from webhook event ordering.
    """
    try:
        # Find customer
        customers = stripe.Customer.list(email=customer_email, limit=1)
        if not customers.data:
            print(f"🔍 [RECONCILE] Customer not found: {customer_email}")
            return {"status": "no_customer", "max_concurrent_bots": 0}
        
        customer = customers.data[0]
        print(f"🔍 [RECONCILE] Reconciling entitlements for customer: {customer.id} ({customer_email})")
        
        # Get best subscription and compute entitlements
        entitlements = _get_customer_best_subscription(customer.id)
        
        # Update the customer's entitlements in our system
        print(f"🔍 [RECONCILE] Final entitlements: {entitlements}")
        
        # Here you would typically save to database
        # For now, just log the reconciled state
        print(f"✅ [RECONCILE] Customer {customer_email} entitlements reconciled: {entitlements['max_concurrent_bots']} bots")
        
        return entitlements
        
    except Exception as e:
        print(f"❌ [RECONCILE] Error reconciling customer entitlements: {e}")
        return {"status": "error", "max_concurrent_bots": 0}


def create_portal_session(customer, bot_product, startup_price, return_url):
    """Create a portal session for existing customers with subscriptions"""
    portal_config = stripe.billing_portal.Configuration.create(
        features={
            "subscription_update": {
                "enabled": True,
                "default_allowed_updates": ["price", "quantity"],
                "products": [{"product": bot_product.id, "prices": [startup_price.id]}],
                "proration_behavior": "always_invoice",
            },
            "subscription_cancel": {"enabled": True},
            "payment_method_update": {"enabled": True},
            "invoice_history": {"enabled": True},
        },
        default_return_url=return_url,
    )
    session = stripe.billing_portal.Session.create(
        customer=customer.id,
        return_url=return_url,
        configuration=portal_config.id,
    )
    return session.url


def create_checkout_session(customer, startup_price, quantity, success_url, cancel_url):
    """Create a checkout session for new subscriptions"""
    checkout = stripe.checkout.Session.create(
        mode="subscription",
        customer=customer.id,
        line_items=[{"price": startup_price.id, "quantity": quantity}],
        success_url=success_url,
        cancel_url=cancel_url,
        allow_promotion_codes=True,
        metadata={"userEmail": customer.email},
    )
    return {"url": checkout.url}


@app.post("/v1/stripe/resolve-url")
async def resolve_billing_url(req: ResolveUrlRequest):
    if req.context not in ("pricing", "dashboard"):
        raise HTTPException(status_code=400, detail="context must be 'pricing' or 'dashboard'")

    # Get product and price
    bot_product, startup_price = _get_bot_product_and_price()

    # Find or create customer
    customer = _ensure_customer(req.email)
    has_subscription = _has_any_subscription(customer.id)
    print(f"🔎 [RESOLVE] customer {customer.email} has_subscription={has_subscription}")

    # Compute default URLs
    default_origin = req.origin or PORTAL_RETURN_URL.rsplit("/", 1)[0]
    success_url = req.successUrl or f"{default_origin}/dashboard"
    cancel_url = req.cancelUrl or f"{default_origin}/pricing"
    
    # Context-aware return URLs:
    # - If subscribed: always return to dashboard 
    # - If not subscribed: return to initiating page
    if has_subscription:
        portal_return_url = f"{default_origin}/dashboard"
    else:
        portal_return_url = f"{default_origin}/pricing" if req.context == "pricing" else f"{default_origin}/dashboard"

    # Use the resolve_url logic from notebook
    if has_subscription:
        try:
            portal_url = create_portal_session(customer, bot_product, startup_price, portal_return_url)
            return {"url": portal_url}
        except stripe.error.StripeError as e:
            print(f"❌ [RESOLVE] Stripe error creating portal: {e}")
            # Fallback to simple portal
            session = stripe.billing_portal.Session.create(
                customer=customer.id,
                return_url=portal_return_url,
            )
            return {"url": session.url}
    else:
        if req.context == "pricing":
            # Create checkout with quantity from slider
            quantity = max(int(req.quantity or 1), 1)
            try:
                return create_checkout_session(customer, startup_price, quantity, success_url, cancel_url)
            except stripe.error.StripeError as e:
                print(f"❌ [RESOLVE] Stripe error creating checkout: {e}")
                raise HTTPException(status_code=400, detail=f"Failed to create checkout: {str(e)}")
        else:
            # dashboard context, no subscription → redirect to pricing page
            pricing_url = f"{default_origin}/pricing"
            return {"url": pricing_url}

# Add alias route for Stripe webhook (matches the public URL)
@app.post("/webhook/stripe")
async def stripe_webhook_alias(request: Request):
    """Alias route for Stripe webhook to match public URL path."""
    return await stripe_webhook(request)


@app.get("/v1/stats")
async def get_current_stats() -> StatsResponse:
    """
    Get current statistics about contracted bots and number of accounts.
    Returns aggregated data about user accounts that have more than 0 contracted bots.
    
    Returns:
        StatsResponse: Contains total_accounts (only accounts with >0 bots) and total_contracted_bots
    """
    try:
        # Query admin API to get all users
        resp = await admin_request("GET", "/admin/users?limit=10000")  # Use high limit to get all users
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Admin API failed: {resp.text}")
        
        users_data = resp.json()
        
        # Filter accounts with more than 0 contracted bots
        accounts_with_bots = [user for user in users_data if user.get("max_concurrent_bots", 0) > 0]
        
        # Calculate statistics
        total_accounts = len(accounts_with_bots)
        total_contracted_bots = sum(user.get("max_concurrent_bots", 0) for user in accounts_with_bots)
        
        return StatsResponse(
            total_accounts=total_accounts,
            total_contracted_bots=total_contracted_bots
        )
        
    except Exception as e:
        print(f"❌ [STATS] Error getting current stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve current statistics")


@app.get("/")
async def health():
    return {"status": "ok", "service": "billing"}

