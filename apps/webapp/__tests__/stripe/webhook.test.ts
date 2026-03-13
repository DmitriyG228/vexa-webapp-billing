import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockSubscription,
  mockCheckoutSession,
  mockStripeEvent,
  createMockStripe,
  MOCK_STRIPE_IDS,
} from './helpers'

// Set env vars before importing route
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
process.env.ADMIN_API_URL = 'http://localhost:8000'
process.env.ADMIN_API_TOKEN = 'test_token'

const mockStripe = createMockStripe()
let patchCalls: Array<{ userId: number; patch: Record<string, unknown> }> = []
let upsertCalls: Array<string> = []
let currentUserData: Record<string, unknown> = {}

const mockUpsertUser = vi.fn(async (email: string) => {
  upsertCalls.push(email)
  return { id: 1, data: currentUserData, max_concurrent_bots: 0 }
})

const mockPatchUser = vi.fn(async (userId: number, patch: Record<string, unknown>) => {
  patchCalls.push({ userId, patch })
})

const mockExtractEmail = vi.fn(async (sub: any) => {
  return sub.metadata?.userEmail || null
})

const mockCheckAutoTopup = vi.fn()

vi.mock('@/lib/auto-topup', () => ({
  checkAutoTopup: (...args: any[]) => mockCheckAutoTopup(...args),
}))

vi.mock('@/lib/stripe-billing', () => ({
  getStripe: () => mockStripe,
  getStripeIds: () => MOCK_STRIPE_IDS,
  getPriceId: (plan: string) => MOCK_STRIPE_IDS[plan as keyof typeof MOCK_STRIPE_IDS]?.price_id,
  identifyPlan: (sub: any) => {
    const items = sub.items?.data || []
    for (const item of items) {
      const priceId = typeof item.price === 'string' ? item.price : item.price?.id
      for (const [planType, ids] of Object.entries(MOCK_STRIPE_IDS)) {
        if (ids.price_id === priceId) return planType
      }
    }
    return sub.metadata?.tier || 'standard'
  },
  computeEntitlements: (_sub: any, planType: string) => {
    const isTx = ['transcription_api', 'transcription_addon'].includes(planType)
    const prefix = isTx ? 'tx_subscription' : 'subscription'
    const scheduledToCancel = !!_sub.cancel_at_period_end
    const status = _sub.status || 'active'
    const normalizedStatus = scheduledToCancel && status === 'active' ? 'scheduled_to_cancel' : status

    let maxBots: number | null = null
    if (!isTx) {
      if (['canceled', 'incomplete_expired', 'unpaid'].includes(normalizedStatus)) maxBots = 0
      else if (['active', 'trialing', 'scheduled_to_cancel'].includes(normalizedStatus)) maxBots = planType === 'individual' ? 1 : 5
      else maxBots = 0
    }

    return {
      [`${prefix}_status`]: normalizedStatus,
      [`${prefix}_tier`]: planType,
      [`${prefix}_cancel_at_period_end`]: scheduledToCancel,
      [`${prefix}_cancellation_date`]: null,
      [`${prefix}_current_period_end`]: _sub.current_period_end,
      [`${prefix}_current_period_start`]: _sub.current_period_start,
      maxBots,
      transcriptionEnabled: isTx ? ['active', 'trialing', 'scheduled_to_cancel'].includes(normalizedStatus) : null,
      planType,
      isTx,
    }
  },
  extractEmail: (...args: any[]) => mockExtractEmail(...args),
  subFieldPrefix: (pt: string) => ['transcription_api', 'transcription_addon'].includes(pt) ? 'tx_subscription' : 'subscription',
  upsertUser: (...args: any[]) => mockUpsertUser(...args),
  patchUser: (...args: any[]) => mockPatchUser(...args),
  getUserByEmail: vi.fn(),
  adminRequest: vi.fn(),
  BOT_PLANS: new Set(['individual', 'bot_service']),
  TX_PLANS: new Set(['transcription_api', 'transcription_addon']),
  INITIAL_BOT_CREDIT_CENTS: 500,
  TX_WELCOME_CREDIT_CENTS: 2000,
}))

import { POST } from '@/app/api/stripe/webhook/route'

let eventCounter = 0

function sendWebhook(eventType: string, dataObject: Record<string, unknown>, eventId?: string) {
  const eid = eventId || `evt_${++eventCounter}_${Date.now()}`
  const event = mockStripeEvent(eventType, dataObject, { id: eid })
  mockStripe.webhooks.constructEvent.mockReturnValueOnce(event)

  return POST(new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_test', 'content-type': 'text/plain' },
    body: JSON.stringify(event),
  }) as any)
}

describe('Webhook Handler', () => {
  beforeEach(() => {
    patchCalls = []
    upsertCalls = []
    currentUserData = {}
    mockUpsertUser.mockClear()
    mockPatchUser.mockClear()
    mockExtractEmail.mockClear()
    mockExtractEmail.mockImplementation(async (sub: any) => sub.metadata?.userEmail || null)
    mockStripe.subscriptions.list.mockResolvedValue({ data: [] })
    mockStripe.subscriptions.cancel.mockResolvedValue({ id: 'sub_x', latest_invoice: null })
    mockStripe.customers.retrieve.mockResolvedValue({
      id: 'cus_test123', email: 'test@vexa.ai', deleted: false,
      metadata: {}, invoice_settings: { default_payment_method: 'pm_test123' },
    })
    mockStripe.billing.creditGrants.create.mockClear()
    mockStripe.billing.creditGrants.create.mockResolvedValue({ id: 'cg_test' })
    mockStripe.paymentIntents.create.mockClear()
    mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test', status: 'succeeded' })
    mockStripe.paymentMethods.list.mockResolvedValue({ data: [] })
    mockStripe.customers.update.mockResolvedValue({ id: 'cus_test123' })
    mockCheckAutoTopup.mockClear()
    mockCheckAutoTopup.mockResolvedValue(undefined)
  })

  // W1
  it('W1: sets max_concurrent_bots=1 for individual subscription', async () => {
    const sub = mockSubscription({ metadata: { userEmail: 'test@vexa.ai', tier: 'individual' } })
    const res = await sendWebhook('customer.subscription.created', sub)
    expect(res.status).toBe(200)
    expect(patchCalls.some(c => c.patch.max_concurrent_bots === 1)).toBe(true)
  })

  // W2
  it('W2: sets max_concurrent_bots=5 for bot_service subscription', async () => {
    const sub = mockSubscription({
      metadata: { userEmail: 'test@vexa.ai', tier: 'bot_service' },
      items: { data: [{ price: { id: 'price_bot_service' } }] },
    })
    const res = await sendWebhook('customer.subscription.created', sub)
    expect(res.status).toBe(200)
    expect(patchCalls.some(c => c.patch.max_concurrent_bots === 5)).toBe(true)
  })

  // W3
  it('W3: creates welcome credit grant for new bot_service subscriber', async () => {
    const sub = mockSubscription({
      metadata: { userEmail: 'test@vexa.ai', tier: 'bot_service' },
      items: { data: [{ price: { id: 'price_bot_service' } }] },
    })
    await sendWebhook('customer.subscription.created', sub)
    expect(mockStripe.billing.creditGrants.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_test123', category: 'promotional' })
    )
  })

  // W4
  it('W4: does not create duplicate welcome credit', async () => {
    // First retrieve: payment method check
    mockStripe.customers.retrieve.mockResolvedValueOnce({
      id: 'cus_test123', email: 'test@vexa.ai', deleted: false,
      metadata: { welcome_credit_cents: '500' },
      invoice_settings: { default_payment_method: 'pm_test123' },
    })
    // Second retrieve: bot welcome credit idempotency check
    mockStripe.customers.retrieve.mockResolvedValueOnce({
      id: 'cus_test123', email: 'test@vexa.ai', deleted: false,
      metadata: { welcome_credit_cents: '500' },
      invoice_settings: { default_payment_method: 'pm_test123' },
    })
    const sub = mockSubscription({
      metadata: { userEmail: 'test@vexa.ai', tier: 'bot_service' },
      items: { data: [{ price: { id: 'price_bot_service' } }] },
    })
    await sendWebhook('customer.subscription.created', sub)
    expect(mockStripe.billing.creditGrants.create).not.toHaveBeenCalled()
  })

  // W5
  it('W5: sets max_concurrent_bots=0 on individual cancellation', async () => {
    const sub = mockSubscription({
      status: 'canceled',
      metadata: { userEmail: 'test@vexa.ai', tier: 'individual' },
    })
    const res = await sendWebhook('customer.subscription.deleted', sub)
    expect(res.status).toBe(200)
    expect(patchCalls.some(c => c.patch.max_concurrent_bots === 0)).toBe(true)
  })

  // W6
  it('W6: sets max_concurrent_bots=0 on bot_service cancellation', async () => {
    const sub = mockSubscription({
      status: 'canceled',
      metadata: { userEmail: 'test@vexa.ai', tier: 'bot_service' },
      items: { data: [{ price: { id: 'price_bot_service' } }] },
    })
    await sendWebhook('customer.subscription.deleted', sub)
    expect(patchCalls.some(c => c.patch.max_concurrent_bots === 0)).toBe(true)
  })

  // W7
  it('W7: ignores cancellation when customer has another active sub', async () => {
    mockStripe.subscriptions.list.mockResolvedValueOnce({
      data: [{ id: 'sub_replacement', items: { data: [{ price: { id: 'price_bot_service' } }] }, metadata: {} }],
    })
    const sub = mockSubscription({
      id: 'sub_old',
      status: 'canceled',
      metadata: { userEmail: 'test@vexa.ai', tier: 'individual' },
    })
    await sendWebhook('customer.subscription.deleted', sub)
    expect(patchCalls).toHaveLength(0)
  })

  // W8
  it('W8: sets scheduled_to_cancel status', async () => {
    const sub = mockSubscription({
      cancel_at_period_end: true,
      metadata: { userEmail: 'test@vexa.ai', tier: 'individual' },
    })
    await sendWebhook('customer.subscription.updated', sub)
    expect(patchCalls.some(c => (c.patch.data as any)?.subscription_status === 'scheduled_to_cancel')).toBe(true)
  })

  // W9
  it('W9: skips subscription with incomplete status', async () => {
    const sub = mockSubscription({ status: 'incomplete', metadata: { userEmail: 'test@vexa.ai' } })
    const res = await sendWebhook('customer.subscription.created', sub)
    expect(res.status).toBe(200)
    expect(upsertCalls).toHaveLength(0)
  })

  // W10
  it('W10: falls back to Customer.email when no metadata email', async () => {
    mockExtractEmail.mockResolvedValueOnce('fallback@vexa.ai')
    const sub = mockSubscription({ metadata: {} })
    await sendWebhook('customer.subscription.created', sub)
    expect(upsertCalls).toContain('fallback@vexa.ai')
  })

  // W11
  it('W11: sets transcription_enabled for transcription_api subscription', async () => {
    const sub = mockSubscription({
      metadata: { userEmail: 'test@vexa.ai', tier: 'transcription_api' },
      items: { data: [{ price: { id: 'price_tx_api' } }] },
    })
    await sendWebhook('customer.subscription.created', sub)
    expect(patchCalls.some(c => (c.patch.data as any)?.transcription_enabled === true)).toBe(true)
  })

  // W12
  it('W12: sets transcription_enabled for transcription_addon subscription', async () => {
    const sub = mockSubscription({
      metadata: { userEmail: 'test@vexa.ai', tier: 'transcription_addon' },
      items: { data: [{ price: { id: 'price_tx_addon' } }] },
    })
    await sendWebhook('customer.subscription.created', sub)
    expect(patchCalls.some(c => (c.patch.data as any)?.transcription_enabled === true)).toBe(true)
  })

  // W13
  it('W13: creates welcome credit for transcription_api subscriber', async () => {
    const sub = mockSubscription({
      metadata: { userEmail: 'test@vexa.ai', tier: 'transcription_api' },
      items: { data: [{ price: { id: 'price_tx_api' } }] },
    })
    await sendWebhook('customer.subscription.created', sub)
    expect(mockStripe.billing.creditGrants.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringContaining('10,000 minutes') })
    )
  })

  // W14
  it('W14: creates welcome credit for transcription_addon subscriber', async () => {
    const sub = mockSubscription({
      metadata: { userEmail: 'test@vexa.ai', tier: 'transcription_addon' },
      items: { data: [{ price: { id: 'price_tx_addon' } }] },
    })
    await sendWebhook('customer.subscription.created', sub)
    expect(mockStripe.billing.creditGrants.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringContaining('TX add-on') })
    )
  })

  // W15
  it('W15: sets transcription_enabled=false on TX cancellation', async () => {
    const sub = mockSubscription({
      status: 'canceled',
      metadata: { userEmail: 'test@vexa.ai', tier: 'transcription_api' },
      items: { data: [{ price: { id: 'price_tx_api' } }] },
    })
    await sendWebhook('customer.subscription.deleted', sub)
    expect(patchCalls.some(c => (c.patch.data as any)?.transcription_enabled === false)).toBe(true)
  })

  // W16
  it('W16: TX cancellation does not change max_concurrent_bots', async () => {
    const sub = mockSubscription({
      status: 'canceled',
      metadata: { userEmail: 'test@vexa.ai', tier: 'transcription_api' },
      items: { data: [{ price: { id: 'price_tx_api' } }] },
    })
    await sendWebhook('customer.subscription.deleted', sub)
    expect(patchCalls.every(c => c.patch.max_concurrent_bots === undefined)).toBe(true)
  })

  // W17
  it('W17: bot cancellation does not change transcription_enabled', async () => {
    const sub = mockSubscription({
      status: 'canceled',
      metadata: { userEmail: 'test@vexa.ai', tier: 'bot_service' },
      items: { data: [{ price: { id: 'price_bot_service' } }] },
    })
    await sendWebhook('customer.subscription.deleted', sub)
    // transcription_enabled should be null → not included in patch
    const allDataPatches = patchCalls.map(c => c.patch.data as any).filter(Boolean)
    expect(allDataPatches.every(d => d.transcription_enabled === undefined)).toBe(true)
  })

  // W18
  it('W18: plan switch updates max_concurrent_bots to 5 for PAYG', async () => {
    const newSub = mockSubscription({
      metadata: { userEmail: 'test@vexa.ai', tier: 'bot_service' },
      items: { data: [{ price: { id: 'price_bot_service' } }] },
    })
    await sendWebhook('customer.subscription.created', newSub)
    expect(patchCalls.some(c => c.patch.max_concurrent_bots === 5)).toBe(true)
  })

  // W19
  it('W19: PAYG to Individual changes max_concurrent_bots to 1', async () => {
    const newSub = mockSubscription({ metadata: { userEmail: 'test@vexa.ai', tier: 'individual' } })
    await sendWebhook('customer.subscription.created', newSub)
    expect(patchCalls.some(c => c.patch.max_concurrent_bots === 1)).toBe(true)
  })

  // W20
  it('W20: cancels replaced subscription on switch', async () => {
    const newSub = mockSubscription({
      metadata: { userEmail: 'test@vexa.ai', tier: 'bot_service', replaces_sub: 'sub_old123' },
      items: { data: [{ price: { id: 'price_bot_service' } }] },
    })
    await sendWebhook('customer.subscription.created', newSub)
    expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith(
      'sub_old123',
      expect.objectContaining({ prorate: true, invoice_now: true })
    )
  })

  // W21
  it('W21: creates bot credit grant from topup checkout', async () => {
    const session = mockCheckoutSession({
      metadata: { topup_product: 'bot', userEmail: 'test@vexa.ai', topup_amount_cents: '500' },
    })
    await sendWebhook('checkout.session.completed', session)
    expect(mockStripe.billing.creditGrants.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_test123', category: 'paid' })
    )
  })

  // W22
  it('W22: creates TX credit grant from topup checkout', async () => {
    const session = mockCheckoutSession({
      metadata: { topup_product: 'tx', userEmail: 'test@vexa.ai', topup_amount_cents: '1000' },
    })
    await sendWebhook('checkout.session.completed', session)
    expect(mockStripe.billing.creditGrants.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_test123', category: 'paid' })
    )
  })

  // W23
  it('W23: auto-topup is invoked when credit depleted', async () => {
    mockStripe.customers.retrieve.mockResolvedValueOnce({
      id: 'cus_test123', email: 'test@vexa.ai', deleted: false,
      metadata: { topup_enabled: 'true', topup_amount_cents: '500' },
      invoice_settings: { default_payment_method: 'pm_test123' },
    })
    mockCheckAutoTopup.mockResolvedValue({ topped_up: true, amount_cents: 500 })
    await sendWebhook('billing.credit_grant.depleted', { customer: 'cus_test123' })
    // Webhook delegates to checkAutoTopup module
    expect(mockCheckAutoTopup).toHaveBeenCalled()
  })

  // W24
  it('W24: no action when auto-topup disabled', async () => {
    mockStripe.customers.retrieve.mockResolvedValueOnce({
      id: 'cus_test123', email: 'test@vexa.ai', deleted: false,
      metadata: { topup_enabled: 'false' },
      invoice_settings: {},
    })
    await sendWebhook('billing.credit_grant.depleted', { customer: 'cus_test123' })
    expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled()
  })

  // W26
  it('W26: returns 400 for invalid signature', async () => {
    mockStripe.webhooks.constructEvent.mockImplementationOnce(() => { throw new Error('bad sig') })
    const res = await POST(new Request('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'invalid', 'content-type': 'text/plain' },
      body: '{}',
    }) as any)
    expect(res.status).toBe(400)
  })

  // W27
  it('W27: returns 400 for missing signature', async () => {
    const res = await POST(new Request('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: '{}',
    }) as any)
    expect(res.status).toBe(400)
  })

  // W28
  it('W28: returns already processed for duplicate event', async () => {
    const sub = mockSubscription({ metadata: { userEmail: 'test@vexa.ai', tier: 'individual' } })
    const eid = 'evt_dup_test_unique'
    await sendWebhook('customer.subscription.created', sub, eid)
    const res = await sendWebhook('customer.subscription.created', sub, eid)
    const data = await res.json()
    expect(data.note).toBe('already processed')
  })

  // W29
  it('W29: returns 200 OK for unhandled event types', async () => {
    const res = await sendWebhook('invoice.paid', { id: 'inv_test123' })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ignored).toBe('invoice.paid')
  })

  // W30
  it('W30: saves payment method on active subscription', async () => {
    mockStripe.customers.retrieve.mockResolvedValueOnce({
      id: 'cus_test123', email: 'test@vexa.ai', deleted: false,
      metadata: {},
      invoice_settings: { default_payment_method: 'pm_saved123' },
    })
    const sub = mockSubscription({ metadata: { userEmail: 'test@vexa.ai', tier: 'individual' } })
    await sendWebhook('customer.subscription.created', sub)
    expect(patchCalls.some(c => (c.patch.data as any)?.stripe_payment_method_id === 'pm_saved123')).toBe(true)
  })
})
