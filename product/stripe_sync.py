#!/usr/bin/env python3
"""
Sync pricing_tiers.json products → Stripe Products & Prices.

Handles:
  - Fixed recurring subscriptions (Individual $12/mo)
  - Metered recurring prices (Bot Service $0.30/hr)
  - Sub-cent metered prices via unit_amount_decimal (Transcription API $0.002/min)
  - One-time prices (Consultation $240/hr)

Usage:
  STRIPE_SECRET_KEY=sk_test_... python product/stripe_sync.py
"""

from __future__ import annotations

import json
import os
import sys
from typing import Any, Dict, List, Optional

import stripe

# ── Config ────────────────────────────────────────────────────────────────────

api_key = os.getenv("STRIPE_SECRET_KEY")
if not api_key:
    sys.exit("STRIPE_SECRET_KEY env var is required")

stripe.api_key = api_key
stripe.api_version = "2023-10-16"


def load_config() -> List[Dict[str, Any]]:
    config_path = os.path.join(os.path.dirname(__file__), "pricing_tiers.json")
    with open(config_path) as f:
        data = json.load(f)
    return [p for p in data["products"] if p.get("stripe")]


# ── Helpers ───────────────────────────────────────────────────────────────────

def find_product(name: str) -> Optional[stripe.Product]:
    for product in stripe.Product.list(active=True, limit=100).auto_paging_iter():
        if product.name == name:
            return product
    return None


def find_price(product_id: str, nickname: str) -> Optional[stripe.Price]:
    for price in stripe.Price.list(product=product_id, active=True, limit=100).auto_paging_iter():
        if getattr(price, "nickname", None) == nickname:
            return price
    return None


def build_price_params(spec: Dict[str, Any], product_id: str) -> Dict[str, Any]:
    """Build stripe.Price.create kwargs from our config spec."""
    s = spec["stripe"]
    params: Dict[str, Any] = {
        "product": product_id,
        "currency": spec.get("currency", "usd"),
        "nickname": s["price_nickname"],
    }

    recurring = s.get("recurring")
    if recurring:
        rec: Dict[str, Any] = {"interval": recurring["interval"]}
        if recurring.get("usage_type") == "metered":
            rec["usage_type"] = "metered"
        params["recurring"] = rec

    # Sub-cent amounts use unit_amount_decimal (string), otherwise unit_amount (int)
    if "unit_amount_decimal" in s:
        params["unit_amount_decimal"] = s["unit_amount_decimal"]
    elif "unit_amount" in s:
        params["unit_amount"] = s["unit_amount"]

    return params


def price_matches(price: stripe.Price, spec: Dict[str, Any]) -> bool:
    """Check if an existing Stripe Price matches our config."""
    s = spec["stripe"]

    if price.currency != spec.get("currency", "usd"):
        return False

    # Check amount
    if "unit_amount_decimal" in s:
        if str(getattr(price, "unit_amount_decimal", "")) != s["unit_amount_decimal"]:
            return False
    elif "unit_amount" in s:
        if price.unit_amount != s["unit_amount"]:
            return False

    # Check recurring
    recurring = s.get("recurring")
    if recurring:
        if not price.recurring:
            return False
        if price.recurring["interval"] != recurring["interval"]:
            return False
        expected_usage = recurring.get("usage_type", "licensed")
        actual_usage = price.recurring.get("usage_type", "licensed")
        if actual_usage != expected_usage:
            return False
    else:
        if price.recurring:
            return False

    return True


# ── Sync ──────────────────────────────────────────────────────────────────────

def sync_product(spec: Dict[str, Any]) -> Dict[str, str]:
    """Ensure a Stripe Product + Price exist for one config entry. Returns IDs."""
    s = spec["stripe"]
    product_name = s["product_name"]
    price_nickname = s["price_nickname"]

    # 1. Product
    product = find_product(product_name)
    if product:
        print(f"  Product '{product_name}' exists ({product.id})")
    else:
        product = stripe.Product.create(name=product_name, type="service")
        print(f"  Created product '{product_name}' ({product.id})")

    # 2. Price
    existing_price = find_price(product.id, price_nickname)
    if existing_price and price_matches(existing_price, spec):
        print(f"  Price '{price_nickname}' up-to-date ({existing_price.id})")
        return {"product_id": product.id, "price_id": existing_price.id}

    if existing_price:
        print(f"  Archiving outdated price {existing_price.id}")
        stripe.Price.modify(existing_price.id, active=False)

    params = build_price_params(spec, product.id)
    new_price = stripe.Price.create(**params)
    print(f"  Created price '{price_nickname}' ({new_price.id})")
    return {"product_id": product.id, "price_id": new_price.id}


def sync_portal_config(return_url: str) -> str:
    """Create or update the Stripe Customer Portal configuration."""
    print("\n[billing_portal]")

    # Check for existing default config
    configs = stripe.billing_portal.Configuration.list(limit=10)
    for cfg in configs.data:
        if cfg.is_default:
            print(f"  Default portal config exists ({cfg.id}), updating...")
            updated = stripe.billing_portal.Configuration.modify(
                cfg.id,
                business_profile={"headline": "Vexa — Manage your subscription"},
                features={
                    "subscription_cancel": {
                        "enabled": True,
                        "mode": "at_period_end",
                        "proration_behavior": "none",
                    },
                    "payment_method_update": {"enabled": True},
                    "invoice_history": {"enabled": True},
                    "subscription_update": {
                        "enabled": True,
                        "default_allowed_updates": ["quantity"],
                        "proration_behavior": "always_invoice",
                    },
                },
                default_return_url=return_url,
            )
            print(f"  Updated portal config ({updated.id})")
            return updated.id

    # No default config found — create one
    portal = stripe.billing_portal.Configuration.create(
        business_profile={"headline": "Vexa — Manage your subscription"},
        features={
            "subscription_cancel": {
                "enabled": True,
                "mode": "at_period_end",
                "proration_behavior": "none",
            },
            "payment_method_update": {"enabled": True},
            "invoice_history": {"enabled": True},
            "subscription_update": {
                "enabled": True,
                "default_allowed_updates": ["quantity"],
                "proration_behavior": "always_invoice",
            },
        },
        default_return_url=return_url,
    )
    print(f"  Created portal config ({portal.id})")
    return portal.id


def main():
    portal_return_url = os.getenv("PORTAL_RETURN_URL", "https://webapp.vexa.ai/account")

    products = load_config()
    print(f"Syncing {len(products)} products to Stripe...\n")

    results: Dict[str, Dict[str, str]] = {}
    for spec in products:
        pid = spec["id"]
        print(f"[{pid}]")
        try:
            ids = sync_product(spec)
            results[pid] = ids
        except Exception as e:
            print(f"  FAILED: {e}")
            sys.exit(1)

    # Billing portal
    try:
        portal_id = sync_portal_config(portal_return_url)
        results["_portal_config_id"] = {"id": portal_id}
    except Exception as e:
        print(f"  Portal config FAILED: {e}")
        print("  (non-fatal — products/prices are synced)")

    print("\n--- Stripe Price IDs ---")
    for pid, ids in results.items():
        if pid.startswith("_"):
            continue
        print(f"  {pid}: product={ids['product_id']}  price={ids['price_id']}")

    # Write results for other services to consume (exclude internal keys)
    out_path = os.path.join(os.path.dirname(__file__), "stripe_ids.json")
    output = {k: v for k, v in results.items() if not k.startswith("_")}
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\nSaved to {out_path}")
    print("Stripe catalog synced")


if __name__ == "__main__":
    main()
