import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import Stripe from 'stripe'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'

export const dynamic = 'force-dynamic'

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// Meter event names — must match what meeting-completed hook reports
const BOT_METER = 'vexa_bot_minutes'
const TX_METER = 'vexa_tx_minutes'

// Pricing per minute (in cents) — must match Stripe price configuration
const BOT_RATE_PER_MIN = 0.5   // $0.30/hr = $0.005/min = 0.5 cents/min
const TX_RATE_PER_MIN = 0.1667 // $0.10/hr = $0.001667/min ≈ 0.1667 cents/min

const EMPTY = {
  balance_cents: 0,
  initial_credit_cents: 0,
  usage_cents: 0,
  balance_usd: '$0.00',
  usage_usd: '$0.00',
  initial_credit_usd: '$0.00',
  has_subscription: false,
  cancel_at_period_end: false,
  topup_enabled: false,
  topup_threshold_cents: 100,
  topup_amount_cents: 500,
  bot_minutes: 0,
  tx_minutes: 0,
}

// Query Stripe Meter event summaries for a customer in the current billing period
async function getMeterUsage(
  stripe: Stripe,
  customerId: string,
  meterEventName: string,
  periodStart: number,
  periodEnd: number,
): Promise<number> {
  try {
    // List meters to find the meter ID for this event name
    const meters = await stripe.billing.meters.list({ limit: 10 })
    const meter = meters.data.find(m => m.event_name === meterEventName)
    if (!meter) return 0

    const summaries = await stripe.billing.meters.listEventSummaries(
      meter.id,
      {
        customer: customerId,
        start_time: periodStart,
        end_time: periodEnd,
      },
    )
    let total = 0
    for (const s of summaries.data) {
      total += s.aggregated_value
    }
    return total
  } catch (err) {
    console.error(`[BOT-BALANCE] Meter summary error for ${meterEventName}:`, err)
    return 0
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const stripe = getStripe()
    const email = session.user.email

    const user = await getUserByEmail(email)
    if (!user) return NextResponse.json(EMPTY)

    const customerId = user.data?.stripe_customer_id as string | undefined
    const subStatus = user.data?.subscription_status as string | undefined
    const hasSub = subStatus === 'active' || subStatus === 'trialing'

    if (!customerId) {
      return NextResponse.json({ ...EMPTY, has_subscription: hasSub })
    }

    // Check subscription cancel_at_period_end and get current period from Stripe
    let cancelAtPeriodEnd = false
    let periodStart = 0
    let periodEnd = 0
    try {
      const subs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 10 })
      cancelAtPeriodEnd = subs.data.some(s => s.cancel_at_period_end)
      // Use the first active subscription's billing period
      if (subs.data.length > 0) {
        periodStart = subs.data[0].current_period_start
        periodEnd = subs.data[0].current_period_end
      }
    } catch (err) {
      console.error('[BOT-BALANCE] Subscription list error:', err)
    }

    // Read credit balance from Stripe
    let balanceCents = 0
    try {
      const summary = await stripe.billing.creditBalanceSummary.retrieve({
        customer: customerId,
        filter: { type: 'applicability_scope', applicability_scope: { price_type: 'metered' } },
      } as Stripe.Billing.CreditBalanceSummaryRetrieveParams)
      const balances = (summary as unknown as { balances: Array<{ available_balance: { monetary: { value: number } } }> }).balances || []
      for (const bal of balances) {
        balanceCents += bal.available_balance?.monetary?.value || 0
      }
    } catch (err) {
      console.error('[BOT-BALANCE] CreditBalanceSummary error:', err)
    }

    // Read customer data: topup preferences, initial credit info, proration credits
    let topupEnabled = false
    let topupThresholdCents = 100
    let topupAmountCents = 500
    let initialCreditCents = 0
    let customerBalanceCents = 0 // Stripe customer.balance (negative = credit from prorations)

    try {
      const customer = await stripe.customers.retrieve(customerId)
      if (!customer.deleted) {
        const cust = customer as Stripe.Customer
        const meta = cust.metadata || {}
        topupEnabled = meta.topup_enabled === 'true'
        if (meta.topup_threshold_cents) topupThresholdCents = parseInt(meta.topup_threshold_cents, 10)
        if (meta.topup_amount_cents) topupAmountCents = parseInt(meta.topup_amount_cents, 10)
        if (meta.welcome_credit_cents) initialCreditCents = parseInt(meta.welcome_credit_cents, 10)
        // Negative balance = customer has credit (e.g. from plan switch proration)
        if (cust.balance < 0) customerBalanceCents = Math.abs(cust.balance)
      }
    } catch (err) {
      console.error('[BOT-BALANCE] Customer retrieve error:', err)
    }

    // If no welcome_credit_cents in metadata but user has an active sub, assume $5 was granted
    if (initialCreditCents === 0 && hasSub) {
      initialCreditCents = 500
    }

    // Query actual metered usage from Stripe Meters for the current billing period
    let botMinutes = 0
    let txMinutes = 0
    if (periodStart > 0 && periodEnd > 0) {
      ;[botMinutes, txMinutes] = await Promise.all([
        getMeterUsage(stripe, customerId, BOT_METER, periodStart, periodEnd),
        getMeterUsage(stripe, customerId, TX_METER, periodStart, periodEnd),
      ])
    }

    // Calculate accrued usage cost from meter data
    const meteredUsageCents = Math.round(botMinutes * BOT_RATE_PER_MIN + txMinutes * TX_RATE_PER_MIN)

    // Total balance = credit grants + proration credits
    // initial_credit stays as welcome credit only (not inflated by prorations)
    balanceCents += customerBalanceCents

    // Effective balance = total credits minus accrued metered usage
    // (Stripe deducts at invoice time, but we show the projected balance)
    const effectiveBalanceCents = Math.max(balanceCents - meteredUsageCents, 0)

    return NextResponse.json({
      balance_cents: effectiveBalanceCents,
      initial_credit_cents: initialCreditCents,
      usage_cents: meteredUsageCents,
      balance_usd: formatUsd(effectiveBalanceCents),
      usage_usd: formatUsd(meteredUsageCents),
      initial_credit_usd: formatUsd(initialCreditCents),
      has_subscription: hasSub,
      cancel_at_period_end: cancelAtPeriodEnd,
      topup_enabled: topupEnabled,
      topup_threshold_cents: topupThresholdCents,
      topup_amount_cents: topupAmountCents,
      bot_minutes: botMinutes,
      tx_minutes: txMinutes,
    })
  } catch (error) {
    console.error('[BOT-BALANCE] Error:', error)
    return NextResponse.json(EMPTY)
  }
}
