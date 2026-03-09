import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

import {
  getStripe,
  getPriceId,
  getUserByEmail,
} from '@/lib/stripe-billing'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const stripe = getStripe()
    const email = session.user.email
    const origin = request.headers.get('origin') || request.nextUrl.origin

    const body = await request.json().catch(() => ({})) as {
      context?: string
      plan_type?: string
      quantity?: number
    }

    const context = body.context || 'pricing'
    const planType = body.plan_type
    const returnUrl = `${origin}/account`

    // Look up user to get Stripe customer ID
    const user = await getUserByEmail(email)
    let customerId = (user?.data?.stripe_customer_id as string) || null

    // "dashboard" context = open Stripe Billing Portal (for cancel/manage)
    if (context === 'dashboard') {
      if (!customerId) {
        return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
      }
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })
      return NextResponse.json({ url: portalSession.url })
    }

    // "pricing" context = checkout for new sub or plan switch
    if (!planType) {
      return NextResponse.json({ error: 'Missing plan_type' }, { status: 400 })
    }

    // Find or create Stripe customer
    if (!customerId) {
      // Check Stripe for existing customer with this email before creating a new one
      const existing = await stripe.customers.list({ email, limit: 1 })
      if (existing.data.length > 0 && !existing.data[0].deleted) {
        customerId = existing.data[0].id
      } else {
        const customer = await stripe.customers.create({
          email,
          name: session.user.name || undefined,
        })
        customerId = customer.id
      }
    }

    // Check for existing active subscription to detect plan switch
    let currentSubId: string | undefined
    if (customerId) {
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 5,
      })
      if (subs.data.length > 0) {
        currentSubId = subs.data[0].id
      }
    }

    const priceId = getPriceId(planType)
    const subMetadata: Record<string, string> = {
      userEmail: email,
      tier: planType,
    }

    if (currentSubId) {
      subMetadata.replaces_sub = currentSubId
    }

    // One-time prices (consultation) use 'payment' mode; metered omit quantity; flat-rate needs quantity
    const isOneTime = planType === 'consultation'
    const isMetered = planType === 'bot_service'
    const lineItems: { price: string; quantity?: number }[] = [
      isMetered ? { price: priceId } : { price: priceId, quantity: 1 },
    ]

    const checkout = isOneTime
      ? await stripe.checkout.sessions.create({
          mode: 'payment',
          customer: customerId,
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: `${returnUrl}?consultation=success`,
          cancel_url: returnUrl,
          payment_method_collection: 'if_required',
          payment_intent_data: { setup_future_usage: 'off_session' },
          metadata: subMetadata,
        })
      : await stripe.checkout.sessions.create({
          mode: 'subscription',
          customer: customerId,
          line_items: lineItems,
          success_url: currentSubId
            ? `${returnUrl}?switched=${planType}`
            : returnUrl,
          cancel_url: returnUrl,
          allow_promotion_codes: true,
          subscription_data: { metadata: subMetadata },
        })

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    console.error('[RESOLVE-URL] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to resolve billing URL'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
