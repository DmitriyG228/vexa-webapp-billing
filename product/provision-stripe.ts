#!/usr/bin/env npx tsx
/**
 * Stripe Product Provisioner
 *
 * Creates all Stripe products, prices, and meters from products.ts.
 * Idempotent — skips anything that already exists (matched by metadata.vexa_product_id).
 * Outputs stripe_ids.json for the target environment.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_xxx npx tsx product/provision-stripe.ts
 *   STRIPE_SECRET_KEY=sk_live_xxx npx tsx product/provision-stripe.ts --confirm-live
 */

import Stripe from "stripe"
import fs from "fs"
import path from "path"
import { PRODUCTS, METERS } from "./products"

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_KEY) {
  console.error("STRIPE_SECRET_KEY not set")
  process.exit(1)
}

const isLive = STRIPE_KEY.startsWith("sk_live_")
if (isLive && !process.argv.includes("--confirm-live")) {
  console.error("LIVE MODE detected. Pass --confirm-live to proceed.")
  process.exit(1)
}

const stripe = new Stripe(STRIPE_KEY)
const mode = isLive ? "live" : "test"
console.log(`\n=== Stripe Provisioner (${mode} mode) ===\n`)

// ─── Provision Meters (must run first — prices reference meter IDs) ─────────

const meterIds: Record<string, string> = {}

async function provisionMeters() {
  console.log("--- Meters ---")
  const existing = await stripe.billing.meters.list({ limit: 100 })

  for (const [name, meter] of Object.entries(METERS)) {
    const found = existing.data.find((m) => m.event_name === meter.event_name)
    if (found) {
      meterIds[meter.event_name] = found.id
      console.log(`  ✓ ${meter.event_name} (exists: ${found.id})`)
    } else {
      const created = await stripe.billing.meters.create({
        display_name: `${meter.product} (${meter.unit})`,
        event_name: meter.event_name,
        default_aggregation: { formula: "sum" as const },
        customer_mapping: {
          type: "by_id" as const,
          event_payload_key: "stripe_customer_id",
        },
      })
      meterIds[meter.event_name] = created.id
      console.log(`  + ${meter.event_name} (created: ${created.id})`)
    }
  }
}

// ─── Provision Products + Prices ────────────────────────────────────────────

interface StripeIds {
  product_id: string
  price_id: string
}

async function provisionProducts(): Promise<Record<string, StripeIds>> {
  console.log("\n--- Products + Prices ---")
  const result: Record<string, StripeIds> = {}

  const existingProducts = await stripe.products.list({ limit: 100, active: true })
  const existingPrices = await stripe.prices.list({ limit: 100, active: true })

  for (const [key, product] of Object.entries(PRODUCTS)) {
    if (product.type === "custom") {
      console.log(`  - ${key}: skip (custom)`)
      continue
    }

    // Find or create product
    let productId = existingProducts.data.find(
      (p) => p.metadata?.vexa_product_id === key,
    )?.id
    if (!productId) {
      const created = await stripe.products.create({
        name: `Vexa ${product.name}`,
        metadata: { vexa_product_id: key },
      })
      productId = created.id
      console.log(`  + product ${key} (created: ${productId})`)
    } else {
      console.log(`  ✓ product ${key} (exists: ${productId})`)
    }

    // Find or create price
    let priceId = existingPrices.data.find(
      (p) => p.metadata?.vexa_product_id === key,
    )?.id
    if (!priceId) {
      const priceParams: Stripe.PriceCreateParams = {
        product: productId,
        currency: "usd",
        metadata: { vexa_product_id: key },
      }

      if (product.type === "subscription") {
        priceParams.unit_amount = 1200
        priceParams.recurring = { interval: "month" }
        priceParams.nickname = `${product.name} Monthly`
      } else if (product.type === "metered" || product.type === "metered_addon") {
        // Stripe 2025+ API: metered prices must reference a meter
        const meterName = (product as any).meter as string
        const meterId = meterIds[meterName]
        if (!meterId) {
          throw new Error(`Meter ${meterName} not found for product ${key}`)
        }
        const rateCentsPerMin = (product as any).rate_cents_per_min as number
        priceParams.unit_amount_decimal = String(rateCentsPerMin)
        priceParams.recurring = { interval: "month", usage_type: "metered", meter: meterId }
        priceParams.nickname = `${product.name} Per Minute`
        priceParams.billing_scheme = "per_unit"
      } else if (product.type === "one_time") {
        priceParams.unit_amount = 24000
        priceParams.nickname = `${product.name} Hourly`
      }

      const created = await stripe.prices.create(priceParams)
      priceId = created.id
      console.log(`  + price ${key} (created: ${priceId})`)
    } else {
      console.log(`  ✓ price ${key} (exists: ${priceId})`)
    }

    result[key] = { product_id: productId, price_id: priceId }
  }

  return result
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  await provisionMeters()
  const ids = await provisionProducts()

  const outPath = path.join(__dirname, `stripe_ids.${mode}.json`)
  fs.writeFileSync(outPath, JSON.stringify(ids, null, 2) + "\n")
  console.log(`\n✓ Wrote ${outPath}`)

  if (!isLive) {
    const defaultPath = path.join(__dirname, "stripe_ids.json")
    fs.writeFileSync(defaultPath, JSON.stringify(ids, null, 2) + "\n")
    console.log(`✓ Wrote ${defaultPath}`)
  }

  console.log("\nDone.\n")
}

main().catch((err) => {
  console.error("FATAL:", err)
  process.exit(1)
})
