#!/usr/bin/env python3
"""
Pricing utilities for calculating costs based on tiered pricing configuration
"""

import json
import os
from typing import Dict, Any, List, Tuple


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


def calculate_price_for_users(user_count: int, tiers: List[Dict[str, Any]]) -> int:
    """
    Calculate the total price for a given number of users using tiered pricing
    
    Args:
        user_count: Number of users
        tiers: List of pricing tiers from configuration
        
    Returns:
        Total price in cents
    """
    if user_count <= 0:
        return 0
    
    total_price = 0
    remaining_users = user_count
    
    for i, tier in enumerate(tiers):
        up_to = tier["up_to"]
        unit_amount = tier["unit_amount"]
        
        if up_to == "inf":
            # Last tier - charge for all remaining users
            total_price += remaining_users * unit_amount
            break
        else:
            # Calculate how many users fall into this tier
            tier_users = min(remaining_users, up_to - (tiers[i-1]["up_to"] if i > 0 else 0))
            if tier_users > 0:
                total_price += tier_users * unit_amount
                remaining_users -= tier_users
            
            if remaining_users <= 0:
                break
    
    return total_price


def get_pricing_breakdown(user_count: int, tiers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Get detailed breakdown of pricing for a given number of users
    
    Args:
        user_count: Number of users
        tiers: List of pricing tiers from configuration
        
    Returns:
        List of pricing breakdowns per tier
    """
    if user_count <= 0:
        return []
    
    breakdown = []
    remaining_users = user_count
    
    for i, tier in enumerate(tiers):
        up_to = tier["up_to"]
        unit_amount = tier["unit_amount"]
        
        if up_to == "inf":
            # Last tier
            if remaining_users > 0:
                breakdown.append({
                    "tier_range": f"{tiers[i-1]['up_to'] + 1 if i > 0 else 1}+ users",
                    "users_in_tier": remaining_users,
                    "price_per_user": unit_amount / 100,  # Convert cents to dollars
                    "total_for_tier": (remaining_users * unit_amount) / 100
                })
            break
        else:
            # Calculate users in this tier
            tier_start = tiers[i-1]["up_to"] + 1 if i > 0 else 1
            tier_users = min(remaining_users, up_to - tier_start + 1)
            
            if tier_users > 0:
                breakdown.append({
                    "tier_range": f"{tier_start}-{up_to} users",
                    "users_in_tier": tier_users,
                    "price_per_user": unit_amount / 100,
                    "total_for_tier": (tier_users * unit_amount) / 100
                })
                remaining_users -= tier_users
            
            if remaining_users <= 0:
                break
    
    return breakdown


def format_price(price_cents: int, currency: str = "USD") -> str:
    """Format price from cents to human-readable format"""
    dollars = price_cents / 100
    return f"${dollars:.2f}"


def get_slider_config() -> Dict[str, Any]:
    """Get pricing slider configuration"""
    config = load_pricing_config()
    return config.get("pricing_slider", {})


def get_tiers() -> List[Dict[str, Any]]:
    """Get pricing tiers from configuration"""
    config = load_pricing_config()
    return config["prices"][0]["tiers"]


# Example usage and testing
if __name__ == "__main__":
    try:
        config = load_pricing_config()
        tiers = get_tiers()
        
        # Test pricing calculations
        test_users = [1, 5, 10, 25, 100, 250]
        
        print("Pricing Configuration:")
        print(f"Product: {config['product']['name']}")
        print(f"Currency: {config['prices'][0]['currency']}")
        print(f"Billing: {config['prices'][0]['billing_scheme']} - {config['prices'][0]['tiers_mode']}")
        print("\nTiers:")
        for tier in tiers:
            print(f"  {tier['up_to']} users: {format_price(tier['unit_amount'])}/user")
        
        print("\nPrice Examples:")
        for users in test_users:
            price = calculate_price_for_users(users, tiers)
            breakdown = get_pricing_breakdown(users, tiers)
            print(f"\n{users} users: {format_price(price)}/month")
            for item in breakdown:
                print(f"  {item['tier_range']}: {item['users_in_tier']} users × ${item['price_per_user']:.2f} = ${item['total_for_tier']:.2f}")
                
    except Exception as e:
        print(f"Error: {e}")
