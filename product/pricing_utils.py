#!/usr/bin/env python3
"""
Pricing utilities for the new usage-based pricing model.
Replaces old graduated per-bot tier calculations.
"""

import json
import os
from typing import Dict, Any, List, Optional


def load_pricing_config() -> Dict[str, Any]:
    """Load pricing configuration from pricing_tiers.json"""
    config_path = os.path.join(os.path.dirname(__file__), "pricing_tiers.json")
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in configuration file: {e}")


def get_products() -> List[Dict[str, Any]]:
    """Get all products from configuration"""
    config = load_pricing_config()
    return config["products"]


def get_product(product_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific product by ID"""
    for product in get_products():
        if product["id"] == product_id:
            return product
    return None


def get_main_products() -> List[Dict[str, Any]]:
    """Get main display products (not add-ons)"""
    return [
        p for p in get_products()
        if p["type"] in ("free", "subscription", "custom")
        or (p["type"] == "metered" and p["id"] == "bot_service")
    ]


def get_addons() -> List[Dict[str, Any]]:
    """Get add-on products"""
    return [
        p for p in get_products()
        if p["type"] == "metered_addon"
        or p["id"] in ("transcription_api", "consultation")
    ]


def format_price(price_cents: int, currency: str = "USD") -> str:
    """Format price from cents to human-readable format"""
    dollars = price_cents / 100
    return f"${dollars:.2f}"


# Example usage and testing
if __name__ == "__main__":
    try:
        products = get_products()
        print("Products:")
        for p in products:
            price = p.get("price_display", "N/A")
            unit = p.get("price_unit", "")
            print(f"  {p['name']}: {price}{unit} ({p['type']})")
            if p.get("features"):
                for f in p["features"]:
                    print(f"    - {f}")

        print("\nMain products:")
        for p in get_main_products():
            print(f"  {p['name']}: {p['price_display']}")

        print("\nAdd-ons:")
        for p in get_addons():
            print(f"  {p['name']}: {p['price_display']}{p.get('price_unit', '')}")

    except Exception as e:
        print(f"Error: {e}")
