import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import Stripe from 'stripe'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'

const EMPTY_BALANCE = {
  balance_cents: 0,
  balance_usd: '$0.00',
  max_concurrent_bots: 0,
  subscription_tier: null,
  subscription_status: null,
  transcription_enabled: false,
  topup_enabled: false,
  topup_threshold_cents: 100,
  topup_amount_cents: 500,
  monthly_cap_cents: null,
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const stripe = getStripe()
    const email = session.user.email

    // Look up user from Admin API
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(EMPTY_BALANCE)
    }

    const customerId = user.data?.stripe_customer_id as string | undefined
    if (!customerId) {
      return NextResponse.json({
        ...EMPTY_BALANCE,
        max_concurrent_bots: user.max_concurrent_bots || 0,
        subscription_tier: user.data?.subscription_tier || null,
        subscription_status: user.data?.subscription_status || null,
      })
    }

    // Read credit balance from Stripe
    let balanceCents = 0
    try {
      const summary = await stripe.billing.creditBalanceSummary.retrieve({
        customer: customerId,
        filter: { type: 'applicability_scope', applicability_scope: { price_type: 'metered' } },
      } as Stripe.Billing.CreditBalanceSummaryRetrieveParams)
      // Balance is in the balances array
      for (const bal of (summary as unknown as { balances: Array<{ monetary: { available: { amount: number } } }> }).balances || []) {
        balanceCents += bal.monetary?.available?.amount || 0
      }
    } catch (err) {
      console.error('[BALANCE] CreditBalanceSummary error:', err)
      // Fall through with 0 balance
    }

    // Read topup preferences from Customer.metadata
    let topupEnabled = false
    let topupThresholdCents = 100
    let topupAmountCents = 500
    let monthlyCapCents: number | null = null

    try {
      const customer = await stripe.customers.retrieve(customerId)
      if (!customer.deleted) {
        const meta = (customer as Stripe.Customer).metadata || {}
        topupEnabled = meta.topup_enabled === 'true'
        if (meta.topup_threshold_cents) topupThresholdCents = parseInt(meta.topup_threshold_cents, 10)
        if (meta.topup_amount_cents) topupAmountCents = parseInt(meta.topup_amount_cents, 10)
        if (meta.monthly_cap_cents) monthlyCapCents = parseInt(meta.monthly_cap_cents, 10)
      }
    } catch (err) {
      console.error('[BALANCE] Customer retrieve error:', err)
    }

    return NextResponse.json({
      balance_cents: balanceCents,
      balance_usd: `$${(balanceCents / 100).toFixed(2)}`,
      max_concurrent_bots: user.max_concurrent_bots || 0,
      subscription_tier: user.data?.subscription_tier || null,
      subscription_status: user.data?.subscription_status || null,
      transcription_enabled: !!user.data?.transcription_enabled,
      topup_enabled: topupEnabled,
      topup_threshold_cents: topupThresholdCents,
      topup_amount_cents: topupAmountCents,
      monthly_cap_cents: monthlyCapCents,
    })
  } catch (error) {
    console.error('[BALANCE] Error:', error)
    return NextResponse.json(EMPTY_BALANCE)
  }
}
