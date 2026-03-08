/**
 * Shared mock helpers for Stripe billing tests.
 * Provides mock Stripe client, Admin API, and test data factories.
 */
import { vi } from 'vitest'

// --- Mock Stripe ---

export function createMockStripe() {
  return {
    webhooks: {
      constructEvent: vi.fn(),
    },
    subscriptions: {
      list: vi.fn().mockResolvedValue({ data: [] }),
      cancel: vi.fn().mockResolvedValue({}),
    },
    customers: {
      create: vi.fn().mockResolvedValue({ id: 'cus_test123', email: 'test@vexa.ai' }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'cus_test123',
        email: 'test@vexa.ai',
        deleted: false,
        metadata: {},
        invoice_settings: { default_payment_method: 'pm_test123' },
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    paymentMethods: {
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    paymentIntents: {
      create: vi.fn().mockResolvedValue({ id: 'pi_test', status: 'succeeded' }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ id: 'cs_test', url: 'https://checkout.stripe.com/test' }),
      },
    },
    billing: {
      creditGrants: {
        create: vi.fn().mockResolvedValue({ id: 'cg_test' }),
        list: vi.fn().mockResolvedValue({ data: [] }),
      },
      creditBalanceSummary: {
        retrieve: vi.fn().mockResolvedValue({
          balances: [{
            monetary: { available: { amount: 500 } },
          }],
        }),
      },
      meterEvents: {
        create: vi.fn().mockResolvedValue({}),
      },
    },
  }
}

// --- Mock Admin API ---

export function createMockAdminAPI() {
  const defaultUser = {
    id: 1,
    email: 'test@vexa.ai',
    max_concurrent_bots: 0,
    data: {},
  }

  const upsertUser = vi.fn().mockResolvedValue(defaultUser)
  const patchUser = vi.fn().mockResolvedValue(undefined)
  const getUserByEmail = vi.fn().mockResolvedValue(defaultUser)

  return { upsertUser, patchUser, getUserByEmail, defaultUser }
}

// --- Test data factories ---

export function makeSubscription(overrides: Record<string, any> = {}) {
  return {
    id: 'sub_test123',
    customer: 'cus_test123',
    status: 'active',
    cancel_at_period_end: false,
    cancel_at: null,
    canceled_at: null,
    current_period_start: 1709251200,
    current_period_end: 1711929600,
    trial_start: null,
    trial_end: null,
    metadata: {
      userEmail: 'test@vexa.ai',
      tier: 'individual',
    },
    items: {
      data: [{
        price: { id: 'price_individual' },
      }],
    },
    latest_invoice: null,
    ...overrides,
  }
}

let _eventCounter = 0
export function makeWebhookEvent(type: string, dataObject: any, overrides: Record<string, any> = {}) {
  return {
    id: `evt_${type.replace(/\./g, '_')}_${++_eventCounter}`,
    type,
    data: { object: dataObject },
    ...overrides,
  }
}

export function makeCheckoutSession(overrides: Record<string, any> = {}) {
  return {
    id: 'cs_test123',
    customer: 'cus_test123',
    metadata: {},
    ...overrides,
  }
}

export function makeMeeting(overrides: Record<string, any> = {}) {
  return {
    id: 'mtg_test123',
    user_email: 'test@vexa.ai',
    duration_seconds: 3600,
    transcription_enabled: false,
    ...overrides,
  }
}

// --- Stripe IDs for tests ---

export const TEST_STRIPE_IDS: Record<string, { product_id: string; price_id: string }> = {
  individual: { product_id: 'prod_individual', price_id: 'price_individual' },
  bot_service: { product_id: 'prod_bot', price_id: 'price_bot_payg' },
  transcription_api: { product_id: 'prod_tx', price_id: 'price_tx_standalone' },
  transcription_addon: { product_id: 'prod_tx', price_id: 'price_tx_addon' },
  consultation: { product_id: 'prod_consult', price_id: 'price_consult' },
}
