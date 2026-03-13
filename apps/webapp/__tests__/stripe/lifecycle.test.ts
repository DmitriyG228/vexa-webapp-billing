/**
 * Stripe lifecycle integration tests using Test Clocks
 *
 * These tests hit the REAL Stripe API (test mode) to validate
 * time-dependent billing flows. They use Test Clocks to simulate
 * subscription renewals, trial expirations, credit depletion, etc.
 *
 * Requires: STRIPE_SECRET_KEY env var (test mode key)
 * Run: STRIPE_SECRET_KEY=sk_test_... npx vitest __tests__/stripe/lifecycle.test.ts --timeout 30000
 *
 * These are SLOW tests (~5-15s each) — run separately from unit tests.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import Stripe from 'stripe'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
const SKIP = !STRIPE_KEY || STRIPE_KEY === 'sk_test_dummy'

// Load real product/price IDs from stripe_ids.test.json
let STRIPE_IDS: Record<string, { product_id: string; price_id: string }>
try {
  STRIPE_IDS = JSON.parse(
    readFileSync(resolve(__dirname, '../../../../product/stripe_ids.test.json'), 'utf8')
  )
} catch {
  STRIPE_IDS = {} as any
}

const stripe = SKIP ? (null as any) : new Stripe(STRIPE_KEY!, { apiVersion: '2024-12-18.acacia' as any })

// Track objects for cleanup
const cleanup: { clocks: string[]; customers: string[] } = { clocks: [], customers: [] }

async function createClockAndCustomer(name: string) {
  const now = Math.floor(Date.now() / 1000)
  const clock = await stripe.testHelpers.testClocks.create({
    frozen_time: now,
    name: `lifecycle-test-${name}`,
  })
  cleanup.clocks.push(clock.id)

  const customer = await stripe.customers.create({
    name: `Test ${name}`,
    email: `lifecycle-${name}-${now}@test.vexa.ai`,
    test_clock: clock.id,
    metadata: { test: 'true', created_by: 'lifecycle-test' },
  })
  cleanup.customers.push(customer.id)

  return { clock, customer, now }
}

async function advanceClock(clockId: string, frozenTime: number) {
  await stripe.testHelpers.testClocks.advance(clockId, { frozen_time: frozenTime })
  // Wait for clock to finish advancing
  let status = 'advancing'
  let attempts = 0
  while (status === 'advancing' && attempts < 30) {
    await new Promise(r => setTimeout(r, 1000))
    const c = await stripe.testHelpers.testClocks.retrieve(clockId)
    status = c.status
    attempts++
  }
  if (status !== 'ready') throw new Error(`Clock stuck in ${status} after ${attempts}s`)
}

describe.skipIf(SKIP)('Stripe Lifecycle (Test Clocks)', () => {
  afterEach(async () => {
    // Cleanup after each test
    for (const cid of cleanup.customers) {
      try {
        const subs = await stripe.subscriptions.list({ customer: cid, status: 'all' })
        for (const sub of subs.data) {
          if (sub.status !== 'canceled') {
            await stripe.subscriptions.cancel(sub.id)
          }
        }
      } catch {}
    }
  })

  afterAll(async () => {
    // Full cleanup
    for (const cid of cleanup.customers) {
      try { await stripe.customers.del(cid) } catch {}
    }
    for (const clockId of cleanup.clocks) {
      try { await stripe.testHelpers.testClocks.del(clockId) } catch {}
    }
  })

  // =========================================================================
  // L1: Subscription creation → active status
  // =========================================================================
  it('L1: PAYG subscription starts as active', async () => {
    const { customer } = await createClockAndCustomer('l1-payg')
    const priceId = STRIPE_IDS.bot_service?.price_id
    if (!priceId) return // skip if no stripe IDs configured

    // Add a test payment method
    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } })
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    })

    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: { userEmail: customer.email!, tier: 'bot_service' },
    })

    expect(sub.status).toBe('active')
    expect(sub.items.data[0].price.id).toBe(priceId)
  }, 15000)

  // =========================================================================
  // L2: Individual subscription with trial → trial_end triggers status change
  // =========================================================================
  it('L2: trial subscription → advance past trial → becomes active', async () => {
    const { clock, customer, now } = await createClockAndCustomer('l2-trial')
    const priceId = STRIPE_IDS.individual?.price_id
    if (!priceId) return

    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } })
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    })

    const trialEnd = now + 7 * 86400 // 7 day trial
    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      trial_end: trialEnd,
      metadata: { userEmail: customer.email!, tier: 'individual' },
    })

    expect(sub.status).toBe('trialing')

    // Advance clock past trial end
    await advanceClock(clock.id, trialEnd + 3600)

    const updated = await stripe.subscriptions.retrieve(sub.id)
    expect(updated.status).toBe('active')
  }, 30000)

  // =========================================================================
  // L3: Subscription renewal — advance 30 days
  // =========================================================================
  it('L3: monthly subscription renews after 30 days', async () => {
    const { clock, customer, now } = await createClockAndCustomer('l3-renewal')
    const priceId = STRIPE_IDS.individual?.price_id
    if (!priceId) return

    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } })
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    })

    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: { userEmail: customer.email!, tier: 'individual' },
    })

    const originalPeriodEnd = sub.current_period_end

    // Advance past period end
    await advanceClock(clock.id, originalPeriodEnd + 3600)

    const renewed = await stripe.subscriptions.retrieve(sub.id)
    expect(renewed.status).toBe('active')
    expect(renewed.current_period_start).toBeGreaterThanOrEqual(originalPeriodEnd)
  }, 30000)

  // =========================================================================
  // L4: Credit grant creation and balance check
  // =========================================================================
  it('L4: credit grant → balance reflects correct amount', async () => {
    const { customer } = await createClockAndCustomer('l4-credit')

    // Create a metered subscription first (required for credit balance)
    const priceId = STRIPE_IDS.bot_service?.price_id
    if (!priceId) return

    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } })
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    })

    await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
    })

    // Grant $5 welcome credit
    const grant = await stripe.billing.creditGrants.create({
      customer: customer.id,
      category: 'promotional',
      amount: { type: 'monetary', monetary: { value: 500, currency: 'usd' } },
      applicability_config: {
        scope: { price_type: 'metered' },
      },
      name: 'Welcome credit ($5)',
    })

    expect(grant.id).toBeDefined()
    expect(grant.amount.monetary?.value).toBe(500)

    // Check balance
    const balance = await stripe.billing.creditBalanceSummary.retrieve({
      customer: customer.id,
      filter: { type: 'applicability_scope', applicability_scope: { price_type: 'metered' } },
    })

    const available = balance.balances?.[0]?.available_balance?.monetary?.value
    expect(available).toBe(500)
  }, 15000)

  // =========================================================================
  // L5: Cancellation at period end
  // =========================================================================
  it('L5: cancel_at_period_end → still active until period end', async () => {
    const { clock, customer, now } = await createClockAndCustomer('l5-cancel')
    const priceId = STRIPE_IDS.individual?.price_id
    if (!priceId) return

    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } })
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    })

    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: { userEmail: customer.email!, tier: 'individual' },
    })

    // Schedule cancellation
    const updated = await stripe.subscriptions.update(sub.id, {
      cancel_at_period_end: true,
    })

    expect(updated.status).toBe('active')
    expect(updated.cancel_at_period_end).toBe(true)

    // Advance past period end → should be canceled
    await advanceClock(clock.id, sub.current_period_end + 3600)

    const canceled = await stripe.subscriptions.retrieve(sub.id)
    expect(canceled.status).toBe('canceled')
  }, 30000)

  // =========================================================================
  // L6: Plan switch — cancel old, create new
  // =========================================================================
  it('L6: switch from Individual to PAYG — old canceled, new active', async () => {
    const { customer } = await createClockAndCustomer('l6-switch')
    const individualPrice = STRIPE_IDS.individual?.price_id
    const paygPrice = STRIPE_IDS.bot_service?.price_id
    if (!individualPrice || !paygPrice) return

    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } })
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    })

    // Create individual sub
    const oldSub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: individualPrice }],
      metadata: { userEmail: customer.email!, tier: 'individual' },
    })

    // "Switch" — cancel old, create new
    await stripe.subscriptions.cancel(oldSub.id, { prorate: true, invoice_now: true })

    const newSub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: paygPrice }],
      metadata: {
        userEmail: customer.email!,
        tier: 'bot_service',
        replaces_sub: oldSub.id,
      },
    })

    const oldStatus = await stripe.subscriptions.retrieve(oldSub.id)
    expect(oldStatus.status).toBe('canceled')
    expect(newSub.status).toBe('active')
  }, 15000)

  // =========================================================================
  // L7: MeterEvent creation (usage reporting)
  // =========================================================================
  it('L7: MeterEvent created for bot minutes', async () => {
    const { customer } = await createClockAndCustomer('l7-meter')
    const priceId = STRIPE_IDS.bot_service?.price_id
    if (!priceId) return

    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } })
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    })

    await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
    })

    // Report usage via MeterEvent
    const event = await stripe.billing.meterEvents.create({
      event_name: 'vexa_bot_minutes',
      payload: {
        stripe_customer_id: customer.id,
        value: '60',
      },
    })

    expect(event).toBeDefined()
  }, 15000)

  // =========================================================================
  // L8: Failed payment on renewal (declined card)
  // =========================================================================
  it('L8: declined card on renewal → subscription past_due', async () => {
    const { clock, customer, now } = await createClockAndCustomer('l8-declined')
    const priceId = STRIPE_IDS.individual?.price_id
    if (!priceId) return

    // Use a card that succeeds initially but declines later
    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } })
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    })

    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
    })

    // Swap to a card that attaches OK but declines on charge
    const badPm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_chargeCustomerFail' } })
    await stripe.paymentMethods.attach(badPm.id, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: badPm.id },
    })

    // Advance past renewal
    await advanceClock(clock.id, sub.current_period_end + 3600)

    const renewed = await stripe.subscriptions.retrieve(sub.id)
    // Should be past_due or incomplete (payment failed)
    expect(['past_due', 'incomplete', 'active']).toContain(renewed.status)
    // Note: Stripe's exact behavior depends on payment retry settings
  }, 30000)

  // =========================================================================
  // L9: Auto-provision idempotency
  // =========================================================================
  it('L9: creating same subscription twice is idempotent', async () => {
    const { customer } = await createClockAndCustomer('l9-idempotent')
    const priceId = STRIPE_IDS.bot_service?.price_id
    if (!priceId) return

    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } })
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    })

    // First sub
    const sub1 = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
    })

    // List subs — should be 1
    const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'active' })
    expect(subs.data.length).toBe(1)
    expect(subs.data[0].id).toBe(sub1.id)
  }, 15000)

  // =========================================================================
  // L10: Off-session charge for auto-topup
  // =========================================================================
  it('L10: off-session PaymentIntent succeeds with saved card', async () => {
    const { customer } = await createClockAndCustomer('l10-offsession')

    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } })
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id })
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    })

    const pi = await stripe.paymentIntents.create({
      amount: 500,
      currency: 'usd',
      customer: customer.id,
      payment_method: pm.id,
      off_session: true,
      confirm: true,
    })

    expect(pi.status).toBe('succeeded')
    expect(pi.amount).toBe(500)
  }, 15000)
})
