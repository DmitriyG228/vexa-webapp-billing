import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import Stripe from 'stripe'
import {
  getStripe,
  getUserByEmail,
  patchUser,
  getPriceId,
  INITIAL_BOT_CREDIT_CENTS,
} from '@/lib/stripe-billing'

/**
 * Auto-provision: ensure every authenticated user has a Stripe customer,
 * a PAYG (bot_service) subscription, and $5 welcome credit.
 * Called by the account page on load. Idempotent — safe to call repeatedly.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const stripe = getStripe()
    const email = session.user.email

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user.id
    let customerId = user.data?.stripe_customer_id as string | undefined
    const subStatus = user.data?.subscription_status as string | undefined

    // Already has an active subscription — nothing to do
    if (subStatus && ['active', 'trialing'].includes(subStatus)) {
      return NextResponse.json({ provisioned: false, reason: 'already_active' })
    }

    // Step 1: Ensure Stripe customer exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: session.user.name || undefined,
        metadata: { admin_user_id: String(userId) },
      })
      customerId = customer.id
      await patchUser(userId, {
        data: { stripe_customer_id: customerId },
      })
      console.log(`[AUTO-PROVISION] Created Stripe customer ${customerId} for ${email}`)
    }

    // Step 2: Check if customer already has an active bot subscription in Stripe
    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10,
    })
    const hasActiveBotSub = existingSubs.data.length > 0
    if (hasActiveBotSub) {
      // Stripe has a sub but Admin API doesn't know — sync it
      // The webhook will handle this eventually, but let's update now
      const sub = existingSubs.data[0]
      await patchUser(userId, {
        data: {
          subscription_status: 'active',
          subscription_tier: 'bot_service',
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          subscription_current_period_end: sub.current_period_end,
          subscription_current_period_start: sub.current_period_start,
        },
      })
      return NextResponse.json({ provisioned: true, reason: 'synced_existing' })
    }

    // Step 3: Create PAYG subscription (metered — $0 upfront, usage-based)
    let priceId: string
    try {
      priceId = getPriceId('bot_service')
    } catch {
      return NextResponse.json({ error: 'Bot service price not configured' }, { status: 500 })
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      metadata: { auto_provisioned: 'true', admin_user_id: String(userId) },
    })

    // Step 4: Grant $5 welcome credit (if not already given)
    let creditGranted = !!user.data?.bot_welcome_credit_given
    if (!creditGranted) {
      try {
        await stripe.billing.creditGrants.create({
          customer: customerId,
          name: 'Welcome credit — $5 bot',
          category: 'promotional',
          amount: { type: 'monetary', monetary: { currency: 'usd', value: INITIAL_BOT_CREDIT_CENTS } },
          applicability_config: { scope: { price_type: 'metered' } },
        } as Stripe.Billing.CreditGrantCreateParams)

        await stripe.customers.update(customerId, {
          metadata: { welcome_credit_cents: String(INITIAL_BOT_CREDIT_CENTS) },
        })

        creditGranted = true
        console.log(`[AUTO-PROVISION] Granted $${(INITIAL_BOT_CREDIT_CENTS / 100).toFixed(2)} welcome credit for ${email}`)
      } catch (err) {
        console.error(`[AUTO-PROVISION] Welcome credit failed for ${email}:`, err)
      }
    }

    // Step 5: Update Admin API — single patch to avoid data replacement race
    await patchUser(userId, {
      max_concurrent_bots: 100,
      data: {
        subscription_status: subscription.status === 'incomplete' ? 'active' : subscription.status,
        subscription_tier: 'bot_service',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        subscription_current_period_end: subscription.current_period_end,
        subscription_current_period_start: subscription.current_period_start,
        ...(creditGranted ? { bot_welcome_credit_given: true } : {}),
      },
    })

    console.log(`[AUTO-PROVISION] Created PAYG subscription ${subscription.id} for ${email}`)

    return NextResponse.json({
      provisioned: true,
      reason: 'created',
      subscription_id: subscription.id,
      customer_id: customerId,
    })
  } catch (error) {
    console.error('[AUTO-PROVISION] Error:', error)
    const message = error instanceof Error ? error.message : 'Auto-provision failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
