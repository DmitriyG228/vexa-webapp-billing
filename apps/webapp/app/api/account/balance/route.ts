import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'

const EMPTY = {
  balance_minutes: 0,
  remaining_minutes: 0,
  total_purchased_minutes: 0,
  total_used_minutes: 0,
  topup_enabled: false,
  topup_threshold_min: 100,
  topup_amount_cents: 500,
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

    // Read topup preferences from Customer metadata
    let topupEnabled = false
    let topupThresholdMin = 100
    let topupAmountCents = 500

    try {
      const customer = await stripe.customers.retrieve(customerId)
      if (!customer.deleted) {
        const meta = customer.metadata || {}
        topupEnabled = meta.tx_topup_enabled === 'true'
        if (meta.tx_topup_threshold_min) topupThresholdMin = parseInt(meta.tx_topup_threshold_min, 10)
        if (meta.tx_topup_amount_cents) topupAmountCents = parseInt(meta.tx_topup_amount_cents, 10)
      }
    } catch (err) {
      console.error('[ACCOUNT/BALANCE] Customer retrieve error:', err)
    }

    // TX balance comes from usage endpoint / transcription gateway
    // This route provides the topup config; actual minutes come from /api/account/usage
    return NextResponse.json({
      balance_minutes: 0,
      remaining_minutes: 0,
      total_purchased_minutes: 0,
      total_used_minutes: 0,
      topup_enabled: topupEnabled,
      topup_threshold_min: topupThresholdMin,
      topup_amount_cents: topupAmountCents,
    })
  } catch (error) {
    console.error('[ACCOUNT/BALANCE] Error:', error)
    return NextResponse.json(EMPTY)
  }
}
