import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import Stripe from 'stripe'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

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

    // Check subscription cancel_at_period_end from Stripe
    let cancelAtPeriodEnd = false
    try {
      const subs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 10 })
      cancelAtPeriodEnd = subs.data.some(s => s.cancel_at_period_end)
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
      for (const bal of (summary as unknown as { balances: Array<{ monetary: { available: { amount: number } } }> }).balances || []) {
        balanceCents += bal.monetary?.available?.amount || 0
      }
    } catch (err) {
      console.error('[BOT-BALANCE] CreditBalanceSummary error:', err)
    }

    // Read topup preferences + initial credit info from Customer.metadata
    let topupEnabled = false
    let topupThresholdCents = 100
    let topupAmountCents = 500
    let initialCreditCents = 0

    try {
      const customer = await stripe.customers.retrieve(customerId)
      if (!customer.deleted) {
        const meta = (customer as Stripe.Customer).metadata || {}
        topupEnabled = meta.topup_enabled === 'true'
        if (meta.topup_threshold_cents) topupThresholdCents = parseInt(meta.topup_threshold_cents, 10)
        if (meta.topup_amount_cents) topupAmountCents = parseInt(meta.topup_amount_cents, 10)
        if (meta.welcome_credit_cents) initialCreditCents = parseInt(meta.welcome_credit_cents, 10)
      }
    } catch (err) {
      console.error('[BOT-BALANCE] Customer retrieve error:', err)
    }

    // If no welcome_credit_cents in metadata but user has an active sub, assume $5 was granted
    if (initialCreditCents === 0 && hasSub) {
      initialCreditCents = 500
    }

    const usageCents = Math.max(initialCreditCents - balanceCents, 0)

    return NextResponse.json({
      balance_cents: balanceCents,
      initial_credit_cents: initialCreditCents,
      usage_cents: usageCents,
      balance_usd: formatUsd(balanceCents),
      usage_usd: formatUsd(usageCents),
      initial_credit_usd: formatUsd(initialCreditCents),
      has_subscription: hasSub,
      cancel_at_period_end: cancelAtPeriodEnd,
      topup_enabled: topupEnabled,
      topup_threshold_cents: topupThresholdCents,
      topup_amount_cents: topupAmountCents,
    })
  } catch (error) {
    console.error('[BOT-BALANCE] Error:', error)
    return NextResponse.json(EMPTY)
  }
}
