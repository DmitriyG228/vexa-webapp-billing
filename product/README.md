# Billing Product Catalog

## Architecture

```
products.ts                        Stripe API
(definition source of truth)       (billing source of truth)
         │                              ▲         │
         │ reads                        │ creates │ runtime queries
         ▼                              │         ▼
provision-stripe.ts ────────────────────┘   webapp runtime code
         │                                   │  billing-rates.ts
         │ writes                            │  auto-topup.ts
         ▼                                   │  meeting-completed hook
stripe_ids.{env}.json ──────────────────────►│  bot-balance route
(maps vexa IDs → Stripe IDs)                │  account/balance route
                                             │  resolve-url route
```

### Two sources of truth

| Source | What it owns | Files |
|--------|-------------|-------|
| `products.ts` | Product definitions, rates, meters, welcome credits | Single file, checked into git |
| Stripe | Billing state: subscriptions, balances, invoices, usage | Queried at runtime via API |

`stripe_ids.{env}.json` is the bridge — maps our product IDs to Stripe object IDs per environment.

## Products

| ID | Name | Type | Price | Meter |
|----|------|------|-------|-------|
| `individual` | Individual | subscription | $12/mo | — |
| `bot_service` | Pay-as-you-go | metered | $0.30/hr | `vexa_bot_minutes` |
| `transcription_addon` | Real-time transcription | metered_addon | +$0.20/hr | `vexa_tx_addon_minutes` |
| `transcription_api` | Transcription API | metered | $0.002/min | `vexa_tx_api_minutes` |
| `consultation` | Consultation | one_time | $240/hr | — |
| `enterprise` | Enterprise | custom | Custom | — |

### Product relationships

- `transcription_addon` requires `bot_service` — it's an add-on to bot meetings
- `transcription_api` is standalone — no bot needed, separate meter and balance

## Meters

| Meter event name | Product | Unit | Aggregation |
|-----------------|---------|------|-------------|
| `vexa_bot_minutes` | bot_service | minutes | sum |
| `vexa_tx_addon_minutes` | transcription_addon | minutes | sum |
| `vexa_tx_api_minutes` | transcription_api | minutes | sum |

## Provisioning

`provision-stripe.ts` creates all Stripe products, prices, and meters from `products.ts`. Idempotent — safe to re-run.

```bash
# Test mode (BBB dev, K8s staging)
STRIPE_SECRET_KEY=sk_test_xxx npx tsx product/provision-stripe.ts

# Live mode (production) — requires explicit flag
STRIPE_SECRET_KEY=sk_live_xxx npx tsx product/provision-stripe.ts --confirm-live
```

Output: `stripe_ids.test.json` or `stripe_ids.live.json`

### How idempotency works

1. Lists all existing Stripe products, searches for `metadata.vexa_product_id`
2. If a product with matching metadata exists → skip (log "already exists")
3. If not → create product + price, tag with `metadata.vexa_product_id`
4. Same logic for meters: match by `event_name`

## Environment flow

```
TEST:  sk_test_xxx → provision-stripe.ts → stripe_ids.test.json → BBB dev + K8s staging
LIVE:  sk_live_xxx → provision-stripe.ts --confirm-live → stripe_ids.live.json → K8s production
```

## Legacy files

These predate the current architecture and are kept for reference:
- `pricing_tiers.json` — old tiered per-seat pricing (replaced by products.ts)
- `pricing_utils.py` — old Python pricing calculator
- `stripe_sync.py` — old Stripe sync script (replaced by provision-stripe.ts)
- `setup-stripe.sh` — old shell-based setup
- `seed_test_data.py` — test data seeder
