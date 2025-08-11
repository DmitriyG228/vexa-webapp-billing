# Product Pricing Configuration

This directory contains the pricing configuration and utilities for the Vexa webapp billing system.

## Files

### `pricing_tiers.json`
The single source of truth for all pricing configuration including:
- Product details
- Stripe price configuration with tiered pricing
- Pricing slider configuration for the frontend

### `stripe_sync.py`
Updated Stripe synchronization script that now loads configuration from `pricing_tiers.json` instead of hardcoded values.

### `pricing_utils.py`
Utility module providing functions to:
- Calculate pricing for any number of users based on tiered pricing
- Get detailed pricing breakdowns
- Format prices for display
- Access slider configuration

## Pricing Tiers Structure

The current pricing structure uses graduated tiered pricing:

| Users | Price per User | Notes |
|-------|----------------|-------|
| 1     | $12.00        | First user |
| 2-5   | $24.00        | Small team |
| 6-50  | $20.00        | Growing team |
| 51-200| $15.00        | Medium team |
| 201+  | $10.00        | Large team |

## Usage Examples

### Backend (Python)
```python
from pricing_utils import calculate_price_for_users, get_tiers

tiers = get_tiers()
price = calculate_price_for_users(25, tiers)  # Returns price in cents
```

### Frontend (JavaScript)
```javascript
// Load pricing_tiers.json and use the pricing_slider config
const sliderConfig = config.pricing_slider;
// Use min_users, max_users, step, default_value for slider behavior
```

## Configuration Updates

To modify pricing:
1. Edit `pricing_tiers.json`
2. Run `stripe_sync.py` to sync changes to Stripe
3. Frontend will automatically use the new configuration

## Testing

Test the pricing calculations:
```bash
python pricing_utils.py
```

This will show example calculations for various user counts and verify the tiered pricing logic works correctly.
