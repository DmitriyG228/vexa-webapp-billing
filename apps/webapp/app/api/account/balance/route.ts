import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import Stripe from 'stripe'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'

export const dynamic = 'force-dynamic'

// TX rate: $0.002/min = 0.2 cents/min
const TX_CENTS_PER_MIN = 0.2

const EMPTY = {
  balance_minutes: 0,
  remaining_minutes: 0,
  total_used_minutes: 0,
  balance_cents: 0,
  balance_usd: '$0.00',
  topup_enabled: false,
  topup_threshold_cents: 100,
  topup_amount_cents: 500,
}

async function getTxMeterUsage(
  stripe: Stripe,
  customerId: string,
  periodStart: number,
  periodEnd: number,
): Promise<number> {
  try {
    const meters = await stripe.billing.meters.list({ limit: 10 })
    const meter = meters.data.find(m => m.event_name === 'vexa_tx_minutes')
    if (!meter) return 0
    const summaries = await stripe.billing.meters.listEventSummaries(meter.id, {
      customer: customerId,
      start_time: periodStart,
      end_time: periodEnd,
    })
    let total = 0
    for (const s of summaries.data) total += s.aggregated_value
    return total
  } catch {
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
    const user = await getUserByEmail(session.user.email)
    const customerId = user?.data?.stripe_customer_id as string | undefined

    if (!customerId) return NextResponse.json(EMPTY)

    // Shared credit pool — same Stripe Billing Credits as bot balance
    let creditBalanceCents = 0
    try {
      const summary = await stripe.billing.creditBalanceSummary.retrieve({
        customer: customerId,
        filter: { type: 'applicability_scope', applicability_scope: { price_type: 'metered' } },
      } as Stripe.Billing.CreditBalanceSummaryRetrieveParams)
      const balances = (summary as unknown as { balances: Array<{ available_balance: { monetary: { value: number } } }> }).balances || []
      for (const bal of balances) {
        creditBalanceCents += bal.available_balance?.monetary?.value || 0
      }
    } catch (err) {
      console.error('[ACCOUNT/BALANCE] CreditBalanceSummary error:', err)
    }

    // Proration credits (negative customer.balance = credit)
    let customerBalanceCents = 0
    let topupEnabled = false
    let topupThresholdCents = 100
    let topupAmountCents = 500

    try {
      const customer = await stripe.customers.retrieve(customerId)
      if (!customer.deleted) {
        const cust = customer as Stripe.Customer
        const meta = cust.metadata || {}
        if (cust.balance < 0) customerBalanceCents = Math.abs(cust.balance)
        topupEnabled = meta.topup_enabled === 'true'
        if (meta.topup_threshold_cents) topupThresholdCents = parseInt(meta.topup_threshold_cents, 10)
        if (meta.topup_amount_cents) topupAmountCents = parseInt(meta.topup_amount_cents, 10)
      }
    } catch (err) {
      console.error('[ACCOUNT/BALANCE] Customer retrieve error:', err)
    }

    // Get subscription period for meter queries
    let periodStart = 0
    let periodEnd = 0
    try {
      const subs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 10 })
      if (subs.data.length > 0) {
        const rawStart = subs.data[0].items.data[0].current_period_start
        // Stripe Meter summaries require timestamps aligned to daily boundaries
        periodStart = rawStart - (rawStart % 86400)
        const rawEnd = subs.data[0].items.data[0].current_period_end
        const endRem = rawEnd % 86400
        periodEnd = endRem === 0 ? rawEnd : rawEnd + (86400 - endRem)
      }
    } catch (err) {
      console.error('[ACCOUNT/BALANCE] Subscription list error:', err)
    }

    // Query TX meter usage for this period
    let txMinutesUsed = 0
    if (periodStart > 0 && periodEnd > 0) {
      txMinutesUsed = await getTxMeterUsage(stripe, customerId, periodStart, periodEnd)
    }

    const totalCreditCents = creditBalanceCents + customerBalanceCents
    const usageCents = Math.round(txMinutesUsed * TX_CENTS_PER_MIN)
    const effectiveCents = Math.max(totalCreditCents - usageCents, 0)
    const balanceMinutes = effectiveCents / TX_CENTS_PER_MIN

    console.log('[ACCOUNT/BALANCE] DEBUG', { creditBalanceCents, customerBalanceCents, periodStart, periodEnd, txMinutesUsed, totalCreditCents, effectiveCents })

    return NextResponse.json({
      balance_minutes: Math.round(balanceMinutes),
      remaining_minutes: Math.round(balanceMinutes),
      total_used_minutes: Math.round(txMinutesUsed * 100) / 100,
      balance_cents: effectiveCents,
      balance_usd: `$${(effectiveCents / 100).toFixed(2)}`,
      topup_enabled: topupEnabled,
      topup_threshold_cents: topupThresholdCents,
      topup_amount_cents: topupAmountCents,
    })
  } catch (error) {
    console.error('[ACCOUNT/BALANCE] Error:', error)
    return NextResponse.json(EMPTY)
  }
}
