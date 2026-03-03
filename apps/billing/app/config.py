from __future__ import annotations

import os
import json
from typing import Dict

import stripe

# ── Environment ──────────────────────────────────────────────────────────────

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
ADMIN_API_URL = os.getenv("ADMIN_API_URL")
ADMIN_API_TOKEN = os.getenv("ADMIN_API_TOKEN")
PORTAL_RETURN_URL = os.getenv("PORTAL_RETURN_URL")
DATABASE_URL = os.getenv("DATABASE_URL")

if not STRIPE_SECRET_KEY:
    raise RuntimeError("STRIPE_SECRET_KEY env var is required")
if not ADMIN_API_URL or not ADMIN_API_TOKEN:
    raise RuntimeError("ADMIN_API_URL and ADMIN_API_TOKEN env vars are required")
if not PORTAL_RETURN_URL:
    raise RuntimeError("PORTAL_RETURN_URL env var is required")

stripe.api_key = STRIPE_SECRET_KEY
stripe.api_version = "2023-10-16"

# ── Plan taxonomy ────────────────────────────────────────────────────────────

BOT_PLANS = {"individual", "bot_service"}
ADDON = {"transcription_api"}
ONETIME = {"consultation"}

INITIAL_BOT_CREDIT_CENTS = 500       # $5 welcome credit for bot_service
TX_FREE_CREDIT_MINUTES = 13333.0     # $20 at $0.0015/min

# ── Stripe product/price IDs ────────────────────────────────────────────────

def _load_stripe_ids() -> Dict[str, Dict[str, str]]:
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


def get_price_id(plan_type: str) -> str:
    ids = STRIPE_IDS.get(plan_type)
    if ids:
        return ids["price_id"]
    raise ValueError(f"No Stripe price configured for plan '{plan_type}'. Run stripe_sync.py.")


def get_product_id(plan_type: str) -> str:
    ids = STRIPE_IDS.get(plan_type)
    if ids:
        return ids["product_id"]
    raise ValueError(f"No Stripe product configured for plan '{plan_type}'. Run stripe_sync.py.")
