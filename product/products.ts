/**
 * PRODUCT CATALOG — Single Source of Truth
 *
 * Every product, price, meter, and rate is defined HERE.
 * All other files import from this module. No duplicates.
 *
 * To change a price or add a product, edit THIS file only.
 */

// ─── Products ───────────────────────────────────────────────────────────────

export const PRODUCTS = {
  individual: {
    id: "individual",
    name: "Individual",
    type: "subscription" as const,
    price_display: "$12/mo",
    detail: "1 bot, transcription included",
    max_concurrent_bots: 1,
    includes_transcription: true,
  },
  bot_service: {
    id: "bot_service",
    name: "Pay-as-you-go",
    type: "metered" as const,
    price_display: "$0.30/hr",
    detail: "Usage-based, unlimited bots",
    meter: "vexa_bot_minutes",
    rate_cents_per_min: 0.5,       // $0.30/hr = $0.005/min = 0.5c/min
    rate_dollars_per_hr: 0.30,
  },
  transcription_addon: {
    id: "transcription_addon",
    name: "Real-time transcription",
    type: "metered_addon" as const,
    price_display: "+$0.20/hr",
    detail: "Add-on to bot — enabled per meeting via API",
    meter: "vexa_tx_addon_minutes",
    rate_cents_per_min: 0.3333,    // $0.20/hr = $0.003333/min ≈ 0.3333c/min
    rate_dollars_per_hr: 0.20,
    requires: "bot_service",       // only meaningful alongside a bot
  },
  transcription_api: {
    id: "transcription_api",
    name: "Transcription API",
    type: "metered" as const,
    price_display: "$0.002/min",
    detail: "Standalone cloud transcription — no bot needed",
    meter: "vexa_tx_api_minutes",
    rate_cents_per_min: 0.2,       // $0.002/min = 0.2c/min
    rate_dollars_per_min: 0.002,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    type: "custom" as const,
    price_display: "Custom",
    detail: "On-premises, SLA, dedicated support",
  },
} as const

export type ProductId = keyof typeof PRODUCTS

// ─── Product Groups ─────────────────────────────────────────────────────────

/** Bot plans — mutually exclusive (user picks one) */
export const BOT_PLAN_IDS = ["individual", "bot_service"] as const

/** Add-on products — layered on top of bot plans */
export const ADDON_IDS = ["transcription_addon"] as const

/** Standalone products — independent of bot plans */
export const STANDALONE_IDS = ["transcription_api"] as const

/** All metered products that consume from the shared credit pool */
export const METERED_IDS = ["bot_service", "transcription_addon", "transcription_api"] as const

// ─── Meters ─────────────────────────────────────────────────────────────────

export const METERS = {
  vexa_bot_minutes: {
    event_name: "vexa_bot_minutes",
    product: "bot_service",
    aggregation: "sum",
    unit: "minutes",
  },
  vexa_tx_addon_minutes: {
    event_name: "vexa_tx_addon_minutes",
    product: "transcription_addon",
    aggregation: "sum",
    unit: "minutes",
  },
  vexa_tx_api_minutes: {
    event_name: "vexa_tx_api_minutes",
    product: "transcription_api",
    aggregation: "sum",
    unit: "minutes",
  },
} as const

export type MeterName = keyof typeof METERS

// ─── Rates (derived from products, for computation) ─────────────────────────

export const RATES = {
  bot_cents_per_min: PRODUCTS.bot_service.rate_cents_per_min,           // 0.5
  tx_addon_cents_per_min: PRODUCTS.transcription_addon.rate_cents_per_min, // 0.3333
  tx_api_cents_per_min: PRODUCTS.transcription_api.rate_cents_per_min,    // 0.2
} as const

// ─── Welcome Credits ────────────────────────────────────────────────────────

export const WELCOME_CREDITS = {
  bot_service: { amount_cents: 500, description: "$5 free credit" },
  transcription_api: { amount_cents: 2000, description: "$20 free credit" },
} as const

// ─── Computation Helpers ────────────────────────────────────────────────────

/** Compute bot + transcription addon usage in cents */
export function computeBotUsageCents(botMinutes: number, txAddonMinutes: number): number {
  return Math.round(
    botMinutes * RATES.bot_cents_per_min +
    txAddonMinutes * RATES.tx_addon_cents_per_min
  )
}

/** Compute standalone TX API usage in cents */
export function computeTxApiUsageCents(txApiMinutes: number): number {
  return Math.round(txApiMinutes * RATES.tx_api_cents_per_min)
}
