import Stripe from 'stripe'
import fs from 'fs'
import path from 'path'

// Stripe client — singleton
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY not set')
    _stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion })
  }
  return _stripe
}

// Plan taxonomy
export const BOT_PLANS = new Set(['individual', 'bot_service'])
export const TX_PLANS = new Set(['transcription_api', 'transcription_addon'])
export const ONETIME_PLANS = new Set(['consultation'])

// Constants
export const INITIAL_BOT_CREDIT_CENTS = 500 // $5 welcome credit
export const TX_WELCOME_CREDIT_CENTS = 2000 // $20 = 10,000 min at $0.002/min

// Stripe IDs from stripe_ids.json
interface StripePlanIds {
  product_id: string
  price_id: string
}

let _stripeIds: Record<string, StripePlanIds> | null = null

export function getStripeIds(): Record<string, StripePlanIds> {
  if (!_stripeIds) {
    const candidates = [
      path.join(process.cwd(), 'product', 'stripe_ids.json'),
      path.join(__dirname, '..', '..', '..', 'product', 'stripe_ids.json'),
    ]
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        _stripeIds = JSON.parse(fs.readFileSync(p, 'utf-8'))
        break
      }
    }
    if (!_stripeIds) {
      _stripeIds = {}
      console.error('[STRIPE] WARNING: stripe_ids.json not found')
    }
  }
  return _stripeIds!
}

export function getPriceId(plan: string): string {
  const ids = getStripeIds()[plan]
  if (!ids?.price_id) throw new Error(`No Stripe price configured for plan '${plan}'`)
  return ids.price_id
}

// Identify plan type from subscription items
export function identifyPlan(sub: Stripe.Subscription): string {
  const ids = getStripeIds()
  for (const item of sub.items.data) {
    const priceId = typeof item.price === 'string' ? item.price : item.price.id
    for (const [planType, planIds] of Object.entries(ids)) {
      if (planIds.price_id === priceId) return planType
    }
  }
  const tier = sub.metadata?.tier
  return tier || 'standard'
}

// Determine field prefix for subscription data in DB
export function subFieldPrefix(planType: string): string {
  return TX_PLANS.has(planType) ? 'tx_subscription' : 'subscription'
}

// Compute entitlements from subscription state
export function computeEntitlements(sub: Stripe.Subscription, planType: string) {
  const isTx = TX_PLANS.has(planType)
  const prefix = subFieldPrefix(planType)
  const statusVal = sub.status
  const scheduledToCancel = !!sub.cancel_at_period_end
  const normalizedStatus = scheduledToCancel && statusVal === 'active'
    ? 'scheduled_to_cancel'
    : statusVal

  let maxBots: number | null = null // null = don't change
  if (!isTx) {
    if (['canceled', 'incomplete_expired', 'unpaid'].includes(normalizedStatus)) {
      maxBots = 0
    } else if (['active', 'trialing', 'scheduled_to_cancel'].includes(normalizedStatus)) {
      maxBots = planType === 'individual' ? 1 : 5
    } else {
      maxBots = 0
    }
  }

  const transcriptionEnabled = isTx
    ? ['active', 'trialing', 'scheduled_to_cancel'].includes(normalizedStatus)
    : null // null = don't change

  return {
    [`${prefix}_status`]: normalizedStatus,
    [`${prefix}_tier`]: planType,
    [`${prefix}_cancel_at_period_end`]: scheduledToCancel,
    [`${prefix}_cancellation_date`]: scheduledToCancel
      ? (sub.cancel_at || sub.current_period_end)
      : sub.canceled_at,
    [`${prefix}_current_period_end`]: sub.current_period_end,
    [`${prefix}_current_period_start`]: sub.current_period_start,
    [`${prefix}_trial_end`]: sub.trial_end,
    [`${prefix}_trial_start`]: sub.trial_start,
    maxBots,
    transcriptionEnabled,
    planType,
    isTx,
  }
}

// Extract email from subscription metadata or Stripe Customer
export async function extractEmail(sub: Stripe.Subscription): Promise<string | null> {
  const meta = sub.metadata || {}
  const email = meta.userEmail || meta.email
  if (email) return email

  const custId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  try {
    const customer = await getStripe().customers.retrieve(custId)
    if (customer.deleted) return null
    return (customer as Stripe.Customer).email || null
  } catch {
    return null
  }
}

// Admin API helper
export async function adminRequest(
  method: string,
  endpoint: string,
  body?: Record<string, unknown>
): Promise<Response> {
  const baseUrl = process.env.ADMIN_API_URL || 'http://localhost:8000'
  const token = process.env.ADMIN_API_TOKEN || ''

  const resp = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-API-Key': token,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return resp
}

// Upsert user via Admin API and return user data
export async function upsertUser(email: string): Promise<{ id: number; data: Record<string, unknown>; max_concurrent_bots: number }> {
  const resp = await adminRequest('POST', '/admin/users', { email })
  if (!resp.ok) {
    throw new Error(`Admin API user upsert failed: ${await resp.text()}`)
  }
  return resp.json()
}

// Patch user via Admin API
export async function patchUser(
  userId: number,
  patch: Record<string, unknown>
): Promise<void> {
  const resp = await adminRequest('PATCH', `/admin/users/${userId}`, patch)
  if (!resp.ok) {
    throw new Error(`Admin API patch failed: ${await resp.text()}`)
  }
}

// Look up user by email via Admin API
export async function getUserByEmail(email: string): Promise<{ id: number; data: Record<string, unknown>; max_concurrent_bots: number } | null> {
  const resp = await adminRequest('POST', '/admin/users', { email })
  if (!resp.ok) return null
  return resp.json()
}
