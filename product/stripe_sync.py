#!/usr/bin/env python3
"""
Moved from docs/scripts/stripe_sync.py – single source of truth for Product & Prices
"""

from __future__ import annotations
import os
import sys
import json
import stripe
from typing import Any, Dict

def load_config() -> Dict[str, Any]:
    """Load configuration from pricing_tiers.json"""
    config_path = os.path.join(os.path.dirname(__file__), "pricing_tiers.json")
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        sys.exit(f"❌  Configuration file not found: {config_path}")
    except json.JSONDecodeError as e:
        sys.exit(f"❌  Invalid JSON in configuration file: {e}")

CONFIG = load_config()

api_key = os.getenv("STRIPE_SECRET_KEY")
if not api_key:
    sys.exit("❌  STRIPE_SECRET_KEY env var is required")

stripe.api_key = api_key
stripe.api_version = "2023-10-16"


def find_product_by_name(name: str):
    resp = stripe.Product.list(active=True, limit=100)
    for product in resp.data:
        if product.name == name:
            return product
    return None


def find_price_by_nickname(product_id: str, nickname: str):
    resp = stripe.Price.list(product=product_id, active=True, limit=100)
    for price in resp.data:
        if getattr(price, "nickname", None) == nickname:
            return price
    return None


def product_matches_config(product: stripe.Product, spec: Dict[str, Any]) -> bool:
    return product.name == spec["name"] and product.type == spec.get("type", "service")


def price_matches_spec(price: stripe.Price, spec: Dict[str, Any]) -> bool:
    if price.currency != spec["currency"]:
        return False
    if price.recurring and spec.get("recurring"):
        if price.recurring["interval"] != spec["recurring"]["interval"]:
            return False
        trial_spec = spec["recurring"].get("trial_period_days")
        if (price.recurring.get("trial_period_days") or 0) != (trial_spec or 0):
            return False
    if price.billing_scheme != spec.get("billing_scheme", "per_unit"):
        return False
    if price.billing_scheme == "tiered":
        if getattr(price, "nickname", None) != spec.get("nickname"):
            return False
        # Check metadata for proration settings
        if spec.get("metadata"):
            for key, value in spec["metadata"].items():
                if getattr(price, "metadata", {}).get(key) != value:
                    return False
        return True
    else:
        return price.unit_amount == spec["unit_amount"]


import asyncio


async def ensure_product() -> stripe.Product:
    prod_spec = CONFIG["product"]
    existing = find_product_by_name(prod_spec["name"])
    if existing and product_matches_config(existing, prod_spec):
        print(f"✔  Product '{prod_spec['name']}' already up‑to‑date ({existing.id})")
        return existing
    if existing:
        print(f"↺  Archiving outdated product {existing.id}")
        stripe.Product.modify(existing.id, active=False)
    print("➕  Creating product")
    return stripe.Product.create(**prod_spec)


async def ensure_price(product_id: str, spec: Dict[str, Any]):
    price = find_price_by_nickname(product_id, spec["nickname"])
    if price and price_matches_spec(price, spec):
        print(f"✔  Price '{spec['nickname']}' up‑to‑date ({price.id})")
        return price
    if price:
        print(f"↺  Archiving outdated price {price.id}")
        stripe.Price.modify(price.id, active=False)
    print(f"➕  Creating price '{spec['nickname']}'")
    return stripe.Price.create(product=product_id, **spec)


async def main():
    try:
        product = await ensure_product()
        for price_spec in CONFIG["prices"]:
            await ensure_price(product.id, price_spec)
        print("\n✅  Stripe catalog is synced")
    except Exception as exc:
        print("❌  Sync failed:", exc)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())


 