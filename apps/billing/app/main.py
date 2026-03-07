from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from .config import DATABASE_URL  # noqa: F401 — validates env on import
from .router import router as resolve_router
from .webhook import router as webhook_router
from .usage import router as usage_router
from .admin import router as admin_router
from .balance import router as balance_router
from .tasks import router as tasks_router, start_background_tasks
from .hooks import router as hooks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_background_tasks()
    yield


app = FastAPI(title="Billing Service", version="0.4.0", lifespan=lifespan)

# Mount all routers
app.include_router(resolve_router)
app.include_router(webhook_router)
app.include_router(usage_router)
app.include_router(admin_router)
app.include_router(balance_router)
app.include_router(tasks_router)
app.include_router(hooks_router)

# Bot balance — kept for backward compat until frontend migrates to /v1/balance/
from .models import BotBalanceRequest
import stripe


@app.post("/v1/stripe/bot-balance")
async def get_bot_balance(req: BotBalanceRequest):
    """Legacy bot balance endpoint — kept for backward compat."""
    customers = stripe.Customer.list(email=req.email, limit=1)
    if not customers.data:
        return {"balance_cents": 0, "initial_credit_cents": 0, "usage_cents": 0, "has_subscription": False}

    customer = customers.data[0]
    subs = stripe.Subscription.list(customer=customer.id, status="all", limit=50)
    active_sub = next(
        (s for s in subs.data if s.status in ("active", "past_due") and s.metadata.get("tier") == "bot_service"),
        None,
    )
    if not active_sub:
        return {"balance_cents": 0, "initial_credit_cents": 0, "usage_cents": 0, "has_subscription": False}

    initial_credit = int(active_sub.metadata.get("initial_credit_cents", "500"))
    usage_cents = 0
    for item in active_sub["items"]["data"]:
        try:
            summaries = stripe.SubscriptionItem.list_usage_record_summaries(item.id, limit=1)
            if summaries.data:
                total_usage = summaries.data[0].total_usage
                usage_cents = int(total_usage * 30)  # $0.30/hr
        except Exception as e:
            print(f"[BOT-BALANCE] Error getting usage for {item.id}: {e}")

    balance_cents = initial_credit - usage_cents
    return {
        "balance_cents": balance_cents,
        "initial_credit_cents": initial_credit,
        "usage_cents": usage_cents,
        "has_subscription": True,
        "balance_usd": f"-${abs(balance_cents) / 100:.2f}" if balance_cents < 0 else f"${balance_cents / 100:.2f}",
        "usage_usd": f"${usage_cents / 100:.2f}",
        "initial_credit_usd": f"${initial_credit / 100:.2f}",
    }


@app.get("/")
async def health():
    return {"status": "ok", "service": "billing", "version": "0.4.0"}
