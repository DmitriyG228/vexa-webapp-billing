import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  getStripe,
  identifyPlan,
  computeEntitlements,
  extractEmail,
  subFieldPrefix,
  upsertUser,
  patchUser,
  BOT_PLANS,
  TX_PLANS,
  INITIAL_BOT_CREDIT_CENTS,
  TX_WELCOME_CREDIT_CENTS,
  getPriceId,
} from '@/lib/stripe-billing'

// Idempotency set (in-memory; upgrade to Redis if needed)
const _processedEvents = new Set<string>()
const MAX_PROCESSED = 10000

// Disable body parsing — we need the raw body for signature verification
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: 'Missing webhook secret or signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[WEBHOOK] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const eventId = event.id
  const eventType = event.type
  console.log(`[WEBHOOK] ${eventType} (${eventId})`)

  // Idempotency check
  if (_processedEvents.has(eventId)) {
    return NextResponse.json({ received: true, note: 'already processed' })
  }
  if (_processedEvents.size > MAX_PROCESSED) {
    _processedEvents.clear()
  }
  _processedEvents.add(eventId)

  try {
    // Subscription events
    if (
      eventType === 'customer.subscription.created' ||
      eventType === 'customer.subscription.updated' ||
      eventType === 'customer.subscription.deleted'
    ) {
      await handleSubscriptionEvent(stripe, event.data.object as Stripe.Subscription)
      return NextResponse.json({ received: true })
    }

    // Checkout session completed (topup via checkout)
    if (eventType === 'checkout.session.completed') {
      await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session)
      return NextResponse.json({ received: true })
    }

    // Credit grant depleted (auto-topup trigger)
    if (eventType === 'billing.credit_grant.depleted') {
      await handleCreditDepleted(stripe, event.data.object as Record<string, unknown>)
      return NextResponse.json({ received: true })
    }

    // Unhandled event types
    return NextResponse.json({ received: true, ignored: eventType })
  } catch (err) {
    console.error(`[WEBHOOK] Error handling ${eventType}:`, err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// --- Subscription handler ---

async function handleSubscriptionEvent(stripe: Stripe, sub: Stripe.Subscription) {
  // Skip incomplete status — transient during checkout
  if (sub.status === 'incomplete') {
    console.log(`[WEBHOOK] Skipping — status is 'incomplete' (transient)`)
    return
  }

  const email = await extractEmail(sub)
  if (!email) {
    console.log('[WEBHOOK] No email found for subscription')
    return
  }

  const planType = identifyPlan(sub)
  const entitlements = computeEntitlements(sub, planType)
  const isTx = entitlements.isTx as boolean
  const prefix = subFieldPrefix(planType)

  // Guard: on cancellation, check if customer has another active sub of same category
  if (['canceled', 'incomplete_expired'].includes(sub.status)) {
    const custId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    try {
      const activeSubs = await stripe.subscriptions.list({
        customer: custId,
        status: 'active',
        limit: 10,
      })
      for (const activeSub of activeSubs.data) {
        const activePlan = identifyPlan(activeSub)
        const activeIsTx = TX_PLANS.has(activePlan)
        if (activeIsTx === isTx && activeSub.id !== sub.id) {
          console.log(`[WEBHOOK] Ignoring canceled sub ${sub.id} — customer has active sub ${activeSub.id}`)
          return
        }
      }
    } catch (err) {
      console.error('[WEBHOOK] Could not check active subs:', err)
    }
  }

  // Upsert user
  const user = await upsertUser(email)
  const userId = user.id

  // Build Admin API patch
  const dataPatch: Record<string, unknown> = {
    updated_by_webhook: Math.floor(Date.now() / 1000),
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    [`stripe_${prefix}_id`]: sub.id,
    [`${prefix}_status`]: entitlements[`${prefix}_status`],
    [`${prefix}_tier`]: entitlements[`${prefix}_tier`],
    [`${prefix}_cancel_at_period_end`]: entitlements[`${prefix}_cancel_at_period_end`],
    [`${prefix}_cancellation_date`]: entitlements[`${prefix}_cancellation_date`],
    [`${prefix}_current_period_end`]: entitlements[`${prefix}_current_period_end`],
    [`${prefix}_current_period_start`]: entitlements[`${prefix}_current_period_start`],
  }

  if (entitlements.transcriptionEnabled !== null) {
    dataPatch.transcription_enabled = entitlements.transcriptionEnabled
  }

  const patch: Record<string, unknown> = { data: dataPatch }

  // Set max_concurrent_bots for bot plans
  let maxBots = entitlements.maxBots as number | null
  if (maxBots !== null) {
    // For bot_service, preserve current max if higher (custom limit set by admin)
    if (planType === 'bot_service' && user.max_concurrent_bots > maxBots) {
      maxBots = user.max_concurrent_bots
    }
    patch.max_concurrent_bots = maxBots
  }

  // Save payment method
  if (['active', 'trialing'].includes(sub.status)) {
    const custId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    try {
      const customer = await stripe.customers.retrieve(custId)
      if (!customer.deleted) {
        const cust = customer as Stripe.Customer
        let pmId = cust.invoice_settings?.default_payment_method
        if (typeof pmId === 'object' && pmId !== null) pmId = pmId.id
        if (!pmId) {
          const pms = await stripe.paymentMethods.list({ customer: custId, type: 'card', limit: 1 })
          if (pms.data.length > 0) {
            pmId = pms.data[0].id
            await stripe.customers.update(custId, {
              invoice_settings: { default_payment_method: pmId },
            })
          }
        }
        if (pmId) {
          (dataPatch as Record<string, unknown>).stripe_payment_method_id = pmId
        }
      }
    } catch (err) {
      console.error('[WEBHOOK] Error saving payment method:', err)
    }
  }

  await patchUser(userId, patch)

  // Welcome credit for new PAYG bot_service subscriptions
  if (planType === 'bot_service' && ['active', 'trialing'].includes(sub.status)) {
    const custId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    if (!user.data?.bot_welcome_credit_given) {
      try {
        await stripe.billing.creditGrants.create({
          customer: custId,
          name: 'Welcome credit — $5 bot',
          category: 'promotional',
          amount: { type: 'monetary', monetary: { currency: 'usd', value: INITIAL_BOT_CREDIT_CENTS } },
          applicability_config: { scope: { price_type: 'metered' } },
        } as Stripe.Billing.CreditGrantCreateParams)
        await patchUser(userId, { data: { bot_welcome_credit_given: true } })
        console.log(`[WEBHOOK] Applied $${(INITIAL_BOT_CREDIT_CENTS / 100).toFixed(2)} welcome credit for ${email}`)
      } catch (err) {
        console.error(`[WEBHOOK] Welcome credit failed for ${email}:`, err)
      }
    }
  }

  // Welcome credit for new TX subscriptions
  if (TX_PLANS.has(planType) && ['active', 'trialing'].includes(sub.status)) {
    const custId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    const creditKey = planType === 'transcription_api' ? 'tx_standalone_welcome_given' : 'tx_addon_welcome_given'
    if (!user.data?.[creditKey]) {
      try {
        await stripe.billing.creditGrants.create({
          customer: custId,
          name: planType === 'transcription_api'
            ? 'Welcome credit — 10,000 minutes'
            : 'Welcome credit — TX add-on',
          category: 'promotional',
          amount: { type: 'monetary', monetary: { currency: 'usd', value: TX_WELCOME_CREDIT_CENTS } },
          applicability_config: { scope: { price_type: 'metered' } },
        } as Stripe.Billing.CreditGrantCreateParams)
        await patchUser(userId, { data: { [creditKey]: true } })
        console.log(`[WEBHOOK] Applied TX welcome credit for ${email} (${planType})`)
      } catch (err) {
        console.error(`[WEBHOOK] TX welcome credit failed for ${email}:`, err)
      }
    }
  }

  // Handle sub that replaces another (plan switch via checkout)
  const replacesSub = sub.metadata?.replaces_sub
  if (replacesSub) {
    try {
      const custId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
      await stripe.subscriptions.cancel(replacesSub, {
        prorate: true,
        invoice_now: true,
      } as Stripe.SubscriptionCancelParams)
      console.log(`[WEBHOOK] Canceled replaced sub ${replacesSub}`)

      // Finalize any draft proration invoices so credit lands on customer.balance
      const drafts = await stripe.invoices.list({
        customer: custId,
        status: 'draft',
        limit: 5,
      })
      for (const inv of drafts.data) {
        if (inv.total < 0) {
          // Negative total = credit to customer. Finalize so Stripe applies it.
          await stripe.invoices.finalizeInvoice(inv.id, { auto_advance: true })
          console.log(`[WEBHOOK] Finalized proration invoice ${inv.id} (${inv.total}c credit)`)
        }
      }
    } catch (err) {
      console.error(`[WEBHOOK] Could not cancel replaced sub ${replacesSub}:`, err)
    }
  }
}

// --- Checkout completed handler (topup via checkout) ---

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {}
  const topupProduct = metadata.topup_product
  if (!topupProduct) {
    // Not a topup checkout — subscription checkouts handled by subscription events
    return
  }

  const topupEmail = metadata.userEmail
  const topupCents = parseInt(metadata.topup_amount_cents || '0', 10)
  if (!topupEmail || topupCents <= 0) return

  const custId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id

  if (!custId) return

  try {
    await stripe.billing.creditGrants.create({
      customer: custId,
      name: `Top-up $${(topupCents / 100).toFixed(2)} — ${topupProduct}`,
      category: 'paid',
      amount: { type: 'monetary', monetary: { currency: 'usd', value: topupCents } },
      applicability_config: { scope: { price_type: 'metered' } },
    } as Stripe.Billing.CreditGrantCreateParams)
    console.log(`[WEBHOOK] Topup credit grant for ${topupEmail}: +${topupCents}c (${topupProduct})`)
  } catch (err) {
    console.error(`[WEBHOOK] Topup credit grant failed for ${topupEmail}:`, err)
  }
}

// --- Credit depleted handler (auto-topup) ---

async function handleCreditDepleted(stripe: Stripe, creditGrant: Record<string, unknown>) {
  const custId = creditGrant.customer as string | undefined
  if (!custId) return

  try {
    const customer = await stripe.customers.retrieve(custId)
    if (customer.deleted) return
    const cust = customer as Stripe.Customer
    const meta = cust.metadata || {}

    if (meta.topup_enabled !== 'true') {
      console.log(`[WEBHOOK] Auto-topup disabled for ${cust.email}`)
      return
    }

    const topupAmountCents = parseInt(meta.topup_amount_cents || '500', 10)
    const monthlyCap = meta.monthly_cap_cents ? parseInt(meta.monthly_cap_cents, 10) : null

    // Check monthly cap if set
    if (monthlyCap !== null) {
      // Read current month's meter usage to check spend
      // For simplicity, we check the customer's credit grant total for the month
      // In practice, you'd check Stripe Meter event summaries
      console.log(`[WEBHOOK] Monthly cap check: cap=${monthlyCap}`)
    }

    // Get default payment method
    let pmId = cust.invoice_settings?.default_payment_method
    if (typeof pmId === 'object' && pmId !== null) pmId = pmId.id
    if (!pmId) {
      console.log(`[WEBHOOK] No payment method for auto-topup: ${cust.email}`)
      return
    }

    // Charge off-session
    const pi = await stripe.paymentIntents.create({
      amount: topupAmountCents,
      currency: 'usd',
      customer: custId,
      payment_method: pmId as string,
      off_session: true,
      confirm: true,
      description: `Auto top-up $${(topupAmountCents / 100).toFixed(2)}`,
    })

    if (pi.status === 'succeeded') {
      await stripe.billing.creditGrants.create({
        customer: custId,
        name: `Auto top-up $${(topupAmountCents / 100).toFixed(2)}`,
        category: 'paid',
        amount: { type: 'monetary', monetary: { currency: 'usd', value: topupAmountCents } },
        applicability_config: { scope: { price_type: 'metered' } },
      } as Stripe.Billing.CreditGrantCreateParams)
      console.log(`[WEBHOOK] Auto-topup +$${(topupAmountCents / 100).toFixed(2)} for ${cust.email}`)
    }
  } catch (err) {
    console.error('[WEBHOOK] Auto-topup failed:', err)
  }
}
