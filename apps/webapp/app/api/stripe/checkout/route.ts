import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

import {
  getStripe,
  getPriceId,
  getUserByEmail,
  BOT_PLANS,
  TX_PLANS,
  ONETIME_PLANS,
} from '@/lib/stripe-billing'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const stripe = getStripe()
    const email = session.user.email
    const body = await request.json() as {
      plan: string
      current_sub?: string // existing sub ID for plan switch
      quantity?: number
    }

    const { plan, current_sub, quantity } = body
    if (!plan) {
      return NextResponse.json({ error: 'Missing plan parameter' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || request.nextUrl.origin
    const successUrl = `${origin}/account`
    const cancelUrl = `${origin}/pricing`

    // Look up or create user + Stripe customer
    const user = await getUserByEmail(email)
    let customerId = (user?.data?.stripe_customer_id as string) || null

    if (!customerId) {
      const customer = await stripe.customers.create({ email, name: session.user.name || undefined })
      customerId = customer.id
    }

    const priceId = getPriceId(plan)

    // One-time payment (consultation)
    if (ONETIME_PLANS.has(plan)) {
      const checkout = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: customerId,
        line_items: [{ price: priceId, quantity: quantity || 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        metadata: { userEmail: email, tier: plan },
      })
      return NextResponse.json({ url: checkout.url })
    }

    // Subscription checkout (new or plan switch)
    const subMetadata: Record<string, string> = {
      userEmail: email,
      tier: plan,
    }

    // Plan switch: mark new sub to replace old one
    if (current_sub) {
      subMetadata.replaces_sub = current_sub
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{ price: priceId }]
    // Flat-rate plans need quantity
    if (plan === 'individual') {
      lineItems[0].quantity = 1
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: lineItems,
      success_url: current_sub
        ? `${successUrl}?switched=${plan}`
        : successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      payment_method_collection: 'if_required',
      subscription_data: { metadata: subMetadata },
    })

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    console.error('[CHECKOUT] Error:', error)
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
