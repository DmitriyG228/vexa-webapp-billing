#!/bin/bash
#
# Full clean state smoke test for Stripe migration
#
# Reproduces exact prod state in test Stripe + local DB, runs migration,
# syncs everything, ready for manual UI verification.
#
# Fully reproducible — run this from scratch at any time.
#
# Prerequisites:
#   - Postgres running (docker)
#   - Prod DB dump at: ../0/platform/migration/dumps/vexa_prod.sql
#   - Node modules installed in apps/webapp/
#
# Usage:
#   cd vexa-webapp-billing
#   LIVE_KEY=sk_live_xxx bash product/smoke-test.sh
#

set -euo pipefail

LIVE_KEY="${LIVE_KEY:?Set LIVE_KEY=sk_live_xxx}"
TEST_KEY="${TEST_KEY:?Set TEST_KEY=sk_test_xxx}"
NODE_PATH="$(pwd)/apps/webapp/node_modules"
export NODE_PATH
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROD_DUMP="$(pwd)/../0/platform/migration/dumps/vexa_prod.sql"
PG_CONTAINER=$(docker ps --format '{{.Names}}' | grep -i postgres | head -1)

echo "=== SMOKE TEST: Full clean state ==="
echo "Live key: ${LIVE_KEY:0:20}..."
echo "Test key: ${TEST_KEY:0:20}..."
echo "Postgres: $PG_CONTAINER"
echo ""

###############################################################################
# Step 1: Fresh prod DB
###############################################################################
echo "=== Step 1: Reimport fresh prod DB ==="
if [ ! -f "$PROD_DUMP" ]; then
  echo "ERROR: Prod dump not found at $PROD_DUMP"
  exit 1
fi
docker exec "$PG_CONTAINER" psql -U postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'vexa' AND pid <> pg_backend_pid();" \
  > /dev/null 2>&1 || true
docker exec "$PG_CONTAINER" psql -U postgres -c "DROP DATABASE IF EXISTS vexa;" > /dev/null
docker exec "$PG_CONTAINER" psql -U postgres -c "CREATE DATABASE vexa;" > /dev/null
docker exec -i "$PG_CONTAINER" psql -U postgres -d vexa < "$PROD_DUMP" > /dev/null 2>&1
echo "  Done. $(docker exec "$PG_CONTAINER" psql -U postgres -d vexa -t -c "SELECT count(*) FROM users;" | tr -d ' ') users"

###############################################################################
# Step 2: Clean test Stripe
###############################################################################
echo ""
echo "=== Step 2: Clean test Stripe ==="
node -e "
const Stripe = require('stripe');
const s = new Stripe('$TEST_KEY');
async function main() {
  // Cancel all subs
  let subCount = 0;
  for await (const sub of s.subscriptions.list({ limit: 100 })) {
    try { await s.subscriptions.cancel(sub.id); subCount++; } catch(e) {}
  }
  // Delete all customers (two passes for stragglers)
  let custCount = 0;
  for (let pass = 0; pass < 2; pass++) {
    for await (const c of s.customers.list({ limit: 100 })) {
      try { await s.customers.del(c.id); custCount++; } catch(e) {}
    }
  }
  // Archive all prices and products
  let priceCount = 0, prodCount = 0;
  for await (const p of s.prices.list({ limit: 100, active: true })) {
    try { await s.prices.update(p.id, { active: false }); priceCount++; } catch(e) {}
  }
  for await (const p of s.products.list({ limit: 100, active: true })) {
    try { await s.products.update(p.id, { active: false }); prodCount++; } catch(e) {}
  }
  console.log('  Canceled ' + subCount + ' subs, deleted ' + custCount + ' customers, archived ' + priceCount + ' prices + ' + prodCount + ' products');
}
main().catch(e => { console.error(e); process.exit(1); });
"

###############################################################################
# Step 3: Clone live → test (exact replica)
###############################################################################
echo ""
echo "=== Step 3: Clone live → test ==="
node -e "
const Stripe = require('stripe');
const live = new Stripe('$LIVE_KEY');
const test = new Stripe('$TEST_KEY');

async function main() {
  // 3a. Create 'Bot subscription' product with exact tiered price
  const prod = await test.products.create({
    name: 'Bot subscription',
    metadata: { cloned_from_live: 'prod_SvwsK9cOz0WmwR' },
  });
  const price = await test.prices.create({
    product: prod.id,
    currency: 'usd',
    billing_scheme: 'tiered',
    tiers_mode: 'graduated',
    recurring: { interval: 'month', usage_type: 'licensed' },
    tiers: [
      { up_to: 1, unit_amount: 1200 },
      { up_to: 2, unit_amount: 3600 },
      { up_to: 5, unit_amount: 2400 },
      { up_to: 50, unit_amount: 2000 },
      { up_to: 200, unit_amount: 1500 },
      { up_to: 'inf', unit_amount: 1000 },
    ],
    nickname: 'Startup',
    metadata: { cloned_from_live: 'price_1S04ycFKEqzvZq6xnIBH4NCI' },
  });
  console.log('  Product: ' + prod.id + ' | Price: ' + price.id);

  // 3b. Create TX product
  const txProd = await test.products.create({
    name: 'Transcription Minutes (Pay-as-you-go)',
    metadata: { cloned_from_live: 'prod_TuZJiYxx78I0gK' },
  });
  await test.prices.create({
    product: txProd.id,
    currency: 'usd',
    unit_amount: 500,
    metadata: { minimum_purchase: 'true', minutes: '3333', price_per_minute: '0.0015' },
  });

  // 3c. Clone each live customer + subscription
  const seen = {};
  let created = 0, skipped = 0, errors = 0;
  for await (const liveSub of live.subscriptions.list({ limit: 100, expand: ['data.customer'] })) {
    if (['incomplete_expired', 'canceled'].includes(liveSub.status)) continue;
    const email = liveSub.customer.email;
    if (!email || seen[email]) { skipped++; continue; }
    seen[email] = true;

    try {
      const cust = await test.customers.create({
        email,
        name: liveSub.customer.name || undefined,
        metadata: { cloned_from_live: liveSub.customer.id },
      });

      // Attach test card so subs are active
      const pm = await test.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } });
      await test.paymentMethods.attach(pm.id, { customer: cust.id });
      await test.customers.update(cust.id, {
        invoice_settings: { default_payment_method: pm.id },
      });

      const qty = liveSub.items.data[0]?.quantity || 1;
      const subParams = {
        customer: cust.id,
        items: [{ price: price.id, quantity: qty }],
        metadata: { cloned_from_live: liveSub.id },
      };
      if (liveSub.status === 'trialing') subParams.trial_period_days = 30;

      const sub = await test.subscriptions.create(subParams);

      if (liveSub.cancel_at_period_end) {
        await test.subscriptions.update(sub.id, { cancel_at_period_end: true });
      }
      if (liveSub.customer.balance < 0) {
        await test.customers.update(cust.id, { balance: liveSub.customer.balance });
      }
      created++;
    } catch(e) {
      console.log('  ERROR ' + email + ': ' + e.message);
      errors++;
    }
  }
  console.log('  Created: ' + created + ', Skipped: ' + skipped + ', Errors: ' + errors);
}
main().catch(e => { console.error(e); process.exit(1); });
"

###############################################################################
# Step 4: Re-activate new product catalog
###############################################################################
echo ""
echo "=== Step 4: Re-activate new product catalog ==="
node -e "
const Stripe = require('stripe');
const s = new Stripe('$TEST_KEY');
const fs = require('fs');
const ids = JSON.parse(fs.readFileSync('product/stripe_ids.test.json'));
async function main() {
  let count = 0;
  for (const plan in ids) {
    const e = ids[plan];
    if (e.product_id) { try { await s.products.update(e.product_id, { active: true }); count++; } catch(err) {} }
    if (e.price_id) { try { await s.prices.update(e.price_id, { active: true }); count++; } catch(err) {} }
  }
  console.log('  Reactivated ' + count + ' products/prices');
}
main().catch(e => { console.error(e); process.exit(1); });
"

###############################################################################
# Step 5: Run migration
###############################################################################
echo ""
echo "=== Step 5: Run migration ==="

# 5a. Metadata: tag all active non-cancelling subs as 'individual'
echo "  5a. Metadata updates..."
node -e "
const Stripe = require('stripe');
const s = new Stripe('$TEST_KEY');
async function main() {
  let count = 0;
  for await (const sub of s.subscriptions.list({ limit: 100 })) {
    if (sub.status !== 'active' && sub.status !== 'trialing') continue;
    if (sub.metadata.subscription_tier) continue;
    if (sub.cancel_at_period_end) continue;
    await s.subscriptions.update(sub.id, { metadata: { subscription_tier: 'individual' } });
    count++;
  }
  console.log('    Tagged ' + count + ' subs as individual');
}
main().catch(e => { console.error(e); process.exit(1); });
"

# 5b. Alex → enterprise
echo "  5b. Alex → enterprise..."
node product/create-custom.js --email alex@topline.com --plan enterprise --bots 9 --metadata-only true --dry-run false 2>&1 | grep -E "Updated|DONE" || true

# 5c. Cancel→PAYG for cancelling users
echo "  5c. Cancel→PAYG for cancelling users..."
node -e "
const Stripe = require('stripe');
const s = new Stripe('$TEST_KEY');
const fs = require('fs');
const ids = JSON.parse(fs.readFileSync('product/stripe_ids.test.json'));
const PAYG = ids.bot_service.price_id;
async function main() {
  let count = 0;
  for await (const sub of s.subscriptions.list({ limit: 100 })) {
    if (!sub.cancel_at_period_end) continue;
    const cust = await s.customers.retrieve(sub.customer);
    await s.subscriptions.cancel(sub.id, { prorate: true });
    await s.subscriptions.create({
      customer: sub.customer,
      items: [{ price: PAYG }],
      payment_behavior: 'default_incomplete',
      metadata: { subscription_tier: 'bot_service', migration_note: 'cancel_to_payg' },
    });
    if (!cust.metadata.welcome_credit_cents) {
      await s.billing.creditGrants.create({
        customer: sub.customer,
        name: 'Welcome credit',
        amount: { type: 'monetary', monetary: { value: 500, currency: 'usd' } },
        applicability_config: { scope: { price_type: 'metered' } },
        category: 'promotional',
      });
      await s.customers.update(sub.customer, { metadata: { welcome_credit_cents: '500' } });
    }
    console.log('    ' + cust.email + ' → PAYG + \$5');
    count++;
  }
  console.log('    Total: ' + count);
}
main().catch(e => { console.error(e); process.exit(1); });
"

# 5d. Welcome credit for all Individual users
echo "  5d. \$5 welcome credit for Individual users..."
node -e "
const Stripe = require('stripe');
const s = new Stripe('$TEST_KEY');
async function main() {
  let count = 0;
  for await (const sub of s.subscriptions.list({ limit: 100 })) {
    if (sub.metadata.subscription_tier !== 'individual') continue;
    const cust = await s.customers.retrieve(sub.customer);
    if (cust.metadata && cust.metadata.welcome_credit_cents) continue;
    await s.billing.creditGrants.create({
      customer: sub.customer,
      name: 'Welcome credit',
      amount: { type: 'monetary', monetary: { value: 500, currency: 'usd' } },
      applicability_config: { scope: { price_type: 'metered' } },
      category: 'promotional',
    });
    await s.customers.update(sub.customer, { metadata: { welcome_credit_cents: '500' } });
    count++;
  }
  console.log('    Granted: ' + count);
}
main().catch(e => { console.error(e); process.exit(1); });
"

###############################################################################
# Step 6: Sync DB with test Stripe
###############################################################################
echo ""
echo "=== Step 6: Sync DB ==="

# 6a. Update stripe_customer_id and stripe_subscription_id for all cloned customers
node -e "
const Stripe = require('stripe');
const s = new Stripe('$TEST_KEY');
async function main() {
  const sql = [];
  for await (const cust of s.customers.list({ limit: 100 })) {
    const email = cust.email.replace(/'/g, \"''\");
    sql.push(\"UPDATE users SET data = jsonb_set(data, '{stripe_customer_id}', '\\\\\"\" + cust.id + \"\\\\\"') WHERE email = '\" + email + \"';\");

    // Also get their active sub to sync stripe_subscription_id
    for await (const sub of s.subscriptions.list({ customer: cust.id, limit: 1 })) {
      if (sub.status === 'canceled') continue;
      sql.push(\"UPDATE users SET data = jsonb_set(data, '{stripe_subscription_id}', '\\\\\"\" + sub.id + \"\\\\\"') WHERE email = '\" + email + \"';\");

      // Sync subscription_tier from Stripe metadata
      const tier = sub.metadata.subscription_tier;
      if (tier) {
        sql.push(\"UPDATE users SET data = jsonb_set(data, '{subscription_tier}', '\\\\\"\" + tier + \"\\\\\"') WHERE email = '\" + email + \"';\");
      }

      // Sync subscription_status
      const status = sub.cancel_at_period_end ? 'scheduled_to_cancel' : sub.status;
      sql.push(\"UPDATE users SET data = jsonb_set(data, '{subscription_status}', '\\\\\"\" + status + \"\\\\\"') WHERE email = '\" + email + \"';\");
    }
  }
  console.log(sql.join('\n'));
}
main().catch(e => { console.error(e); process.exit(1); });
" | docker exec -i "$PG_CONTAINER" psql -U postgres -d vexa > /dev/null

# 6b. Set max_concurrent_bots based on tier
docker exec "$PG_CONTAINER" psql -U postgres -d vexa -c "
-- Individual → 1 bot
UPDATE users SET max_concurrent_bots = 1
  WHERE data->>'subscription_tier' = 'individual';
-- Enterprise (alex) → 9 bots
UPDATE users SET max_concurrent_bots = 9
  WHERE email = 'alex@topline.com';
-- PAYG (migrated cancelling users) → 5 bots
UPDATE users SET max_concurrent_bots = 5
  WHERE data->>'subscription_tier' = 'bot_service';
" > /dev/null

echo "  DB synced"

###############################################################################
# Step 7: Verify
###############################################################################
echo ""
echo "=== Step 7: Verify ==="
docker exec "$PG_CONTAINER" psql -U postgres -d vexa -c "
SELECT
  data->>'subscription_tier' as tier,
  data->>'subscription_status' as status,
  max_concurrent_bots as bots,
  count(*)
FROM users
WHERE data->>'subscription_tier' IS NOT NULL
  AND data->>'subscription_status' IN ('active', 'trialing', 'scheduled_to_cancel', 'bot_service')
GROUP BY 1, 2, 3
ORDER BY 1, 2;
"

echo ""
echo "=== SMOKE TEST COMPLETE ==="
echo ""
echo "Test in browser (MOCK_AUTH) at app.dev.vexa.ai/account:"
echo ""
echo "  Individual (\$12/mo, 1 bot, \$5 credit):"
echo "    martinbiskit@gmail.com"
echo "    mygdanis@etherlogic.gr"
echo ""
echo "  Enterprise (alex, \$200/mo, 9 bots):"
echo "    alex@topline.com"
echo ""
echo "  PAYG (was cancelling, proration + \$5):"
echo "    info@calldone.io"
echo "    ingmar@captain.ai"
echo ""
echo "  Custom qty (need manual handling):"
echo "    spadjv@gmail.com (qty=3, \$72/mo)"
echo "    dmitrygrankin0@gmail.com (qty=2, \$48/mo)"
echo ""
echo "  Flows to test:"
echo "    1. Individual user → Cancel → Switch to PAYG → verify proration"
echo "    2. Canceled api_key_trial user → Login → Auto-provision → PAYG + \$5"
echo "    3. Enterprise user → Page renders correctly"
echo "    4. PAYG user → Top up → Balance updates"
