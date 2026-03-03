from __future__ import annotations

from typing import Any, Dict, Optional

import httpx
from fastapi import APIRouter, HTTPException

from .config import ADMIN_API_URL, ADMIN_API_TOKEN, STRIPE_IDS
from .models import StatsResponse

router = APIRouter()


# ── Admin API helper ─────────────────────────────────────────────────────────

async def admin_request(method: str, path: str, json_body: Optional[Dict[str, Any]] = None) -> httpx.Response:
    url = f"{ADMIN_API_URL}{path}"
    headers = {"X-Admin-API-Key": ADMIN_API_TOKEN}
    async with httpx.AsyncClient() as client:
        return await client.request(method, url, json=json_body, headers=headers, timeout=30)


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/v1/stats")
async def get_current_stats() -> StatsResponse:
    try:
        resp = await admin_request("GET", "/admin/users?limit=10000")
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Admin API failed: {resp.text}")
        users_data = resp.json()
        accounts_with_bots = [u for u in users_data if u.get("max_concurrent_bots", 0) > 0]
        return StatsResponse(
            total_accounts=len(accounts_with_bots),
            total_contracted_bots=sum(u.get("max_concurrent_bots", 0) for u in accounts_with_bots),
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[STATS] Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")


@router.get("/v1/products")
async def list_products():
    return {"products": STRIPE_IDS}
