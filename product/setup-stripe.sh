#!/usr/bin/env bash
#
# Reproducible Stripe setup for Vexa.
#
# Creates all products, prices, and billing portal configuration.
# Idempotent — safe to run multiple times (finds existing resources by name).
#
# Prerequisites:
#   - Python 3 with `stripe` package: pip install stripe
#   - STRIPE_SECRET_KEY env var (sk_test_... or sk_live_...)
#
# Optional env vars:
#   - PORTAL_RETURN_URL  (default: https://webapp.vexa.ai/account)
#
# Usage:
#   # Test mode
#   STRIPE_SECRET_KEY=sk_test_... bash product/setup-stripe.sh
#
#   # Production
#   STRIPE_SECRET_KEY=sk_live_... PORTAL_RETURN_URL=https://webapp.vexa.ai/account bash product/setup-stripe.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "ERROR: STRIPE_SECRET_KEY env var is required"
  echo ""
  echo "Usage:"
  echo "  STRIPE_SECRET_KEY=sk_test_... bash $0"
  exit 1
fi

echo "=== Vexa Stripe Setup ==="
echo ""
echo "Mode: $(echo "$STRIPE_SECRET_KEY" | grep -q 'sk_live' && echo 'PRODUCTION' || echo 'TEST')"
echo "Portal return URL: ${PORTAL_RETURN_URL:-https://webapp.vexa.ai/account}"
echo ""

# Check Python + stripe package
if ! python3 -c "import stripe" 2>/dev/null; then
  echo "Installing stripe Python package..."
  pip3 install stripe
fi

# Run the sync
python3 "$SCRIPT_DIR/stripe_sync.py"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Output: $SCRIPT_DIR/stripe_ids.json"
echo ""
echo "Next steps:"
echo "  1. Copy stripe_ids.json to the billing service"
echo "  2. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in your .env"
echo "  3. Configure webhook endpoint in Stripe Dashboard:"
echo "     URL: https://your-domain/v1/stripe/webhook"
echo "     Events: checkout.session.completed, customer.subscription.updated,"
echo "             customer.subscription.deleted, invoice.payment_succeeded,"
echo "             invoice.payment_failed"
