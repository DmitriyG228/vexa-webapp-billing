/**
 * Billing rates for usage computation.
 *
 * SOURCE OF TRUTH: product/products.ts
 * These values MUST match product/products.ts RATES.
 * If you change a rate, change it in products.ts FIRST, then here.
 */

// Bot service: $0.30/hr = 0.5 cents/min
export const BOT_RATE_CENTS_PER_MIN = 0.5

// Transcription add-on: $0.10/hr = 0.1667 cents/min (add-on to bot)
export const TX_ADDON_RATE_CENTS_PER_MIN = 0.1667

// Transcription API: $0.002/min = 0.2 cents/min (standalone)
export const TX_API_RATE_CENTS_PER_MIN = 0.2

// Legacy alias — same as TX_ADDON
export const TX_RATE_CENTS_PER_MIN = TX_ADDON_RATE_CENTS_PER_MIN

/** Compute bot + transcription add-on usage in cents */
export function computeUsageCents(botMinutes: number, txAddonMinutes: number): number {
  return Math.round(botMinutes * BOT_RATE_CENTS_PER_MIN + txAddonMinutes * TX_ADDON_RATE_CENTS_PER_MIN)
}

/** Compute standalone TX API usage in cents */
export function computeTxApiUsageCents(txApiMinutes: number): number {
  return Math.round(txApiMinutes * TX_API_RATE_CENTS_PER_MIN)
}
