import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'
import { checkAutoTopup } from '@/lib/auto-topup'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const stripe = getStripe()
    const email = session.user.email
    const body = await request.json() as {
      product?: string
      enabled?: boolean
      threshold?: number
      amount_cents?: number
    }

    const user = await getUserByEmail(email)
    const customerId = user?.data?.stripe_customer_id as string | undefined
    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 })
    }

    // Save topup preferences to Stripe Customer metadata
    await stripe.customers.update(customerId, {
      metadata: {
        topup_enabled: String(body.enabled ?? false),
        ...(body.threshold !== undefined && {
          topup_threshold_cents: String(body.threshold),
        }),
        ...(body.amount_cents !== undefined && {
          topup_amount_cents: String(body.amount_cents),
        }),
      },
    })

    // If enabled, immediately check if balance is already below threshold
    let topped_up = false
    if (body.enabled) {
      const result = await checkAutoTopup(stripe, customerId, email)
      topped_up = !!result?.topped_up
    }

    return NextResponse.json({ success: true, topped_up })
  } catch (error) {
    console.error('[TOPUP-SETTINGS] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update settings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
