from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from .config import BOT_PLANS, ADDON, ONETIME, PORTAL_RETURN_URL
from .models import ResolveUrlRequest, PortalRequest
from .context import load
from .checkout import (
    new_checkout, switch, switch_via_checkout,
    addon_checkout, one_time_checkout, portal,
)

router = APIRouter()


@router.post("/v1/stripe/resolve-url")
async def resolve_billing_url(req: ResolveUrlRequest) -> Dict[str, Any]:
    if req.context not in ("pricing", "dashboard"):
        raise HTTPException(status_code=400, detail="context must be 'pricing' or 'dashboard'")

    ctx = await load(
        req.email,
        origin=req.origin,
        success_url=req.successUrl,
        cancel_url=req.cancelUrl,
        return_url=req.returnUrl,
    )
    plan = req.plan_type
    origin = req.origin or PORTAL_RETURN_URL.rsplit("/", 1)[0]

    # 1. One-time products — checked first (bug fix #3: consultation never hits addon path)
    if plan in ONETIME:
        return one_time_checkout(ctx, plan, req.quantity or 1)

    # 2. Add-on products — always create checkout
    if plan in ADDON:
        return addon_checkout(ctx, plan)

    # 3. Bot plans — new, switch, or portal
    if plan in BOT_PLANS:
        if not ctx.bot_sub:
            return await new_checkout(ctx, plan)
        if ctx.bot_tier == plan:
            return portal(ctx)
        if ctx.has_payment_method:
            return await switch(ctx, plan)
        return switch_via_checkout(ctx, plan)

    # 4. No plan specified — portal if subscribed, else pricing
    if ctx.bot_sub:
        return portal(ctx)
    return {"url": f"{origin}/pricing"}


@router.post("/v1/portal/session")
async def create_portal_session(req: PortalRequest) -> Dict[str, Any]:
    ctx = await load(req.email, return_url=req.returnUrl)
    return portal(ctx)
