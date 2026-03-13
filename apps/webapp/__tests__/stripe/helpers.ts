import { vi } from 'vitest'

// Mock Stripe objects

export function mockSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub_test123',
    object: 'subscription',
    customer: 'cus_test123',
    status: 'active',
    cancel_at_period_end: false,
    cancel_at: null,
    canceled_at: null,
    current_period_start: 1700000000,
    current_period_end: 1702592000,
    trial_start: null,
    trial_end: null,
    latest_invoice: null,
    items: {
      data: [
        {
          price: {
            id: 'price_individual',
          },
        },
      ],
    },
    metadata: {
      userEmail: 'test@vexa.ai',
      tier: 'individual',
    },
    ...overrides,
  }
}

export function mockCheckoutSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cs_test123',
    object: 'checkout.session',
    customer: 'cus_test123',
    metadata: {},
    ...overrides,
  }
}

export function mockStripeEvent(type: string, dataObject: Record<string, unknown>, overrides: Record<string, unknown> = {}) {
  return {
    id: `evt_${Date.now()}`,
    type,
    data: { object: dataObject },
    ...overrides,
  }
}

// Mock Stripe IDs
export const MOCK_STRIPE_IDS = {
  individual: { product_id: 'prod_individual', price_id: 'price_individual' },
  bot_service: { product_id: 'prod_bot_service', price_id: 'price_bot_service' },
  transcription_api: { product_id: 'prod_tx_api', price_id: 'price_tx_api' },
  transcription_addon: { product_id: 'prod_tx_addon', price_id: 'price_tx_addon' },
  consultation: { product_id: 'prod_consultation', price_id: 'price_consultation' },
}

// Mock Admin API responses
export function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    email: 'test@vexa.ai',
    max_concurrent_bots: 0,
    data: {},
    ...overrides,
  }
}

// Create mock Stripe instance
export function createMockStripe() {
  return {
    webhooks: {
      constructEvent: vi.fn(),
    },
    customers: {
      create: vi.fn().mockResolvedValue({ id: 'cus_new123', email: 'test@vexa.ai' }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'cus_test123',
        email: 'test@vexa.ai',
        deleted: false,
        metadata: {},
        invoice_settings: { default_payment_method: 'pm_test123' },
      }),
      update: vi.fn().mockResolvedValue({ id: 'cus_test123' }),
    },
    subscriptions: {
      list: vi.fn().mockResolvedValue({ data: [] }),
      cancel: vi.fn().mockResolvedValue({ id: 'sub_test123', latest_invoice: null }),
      create: vi.fn().mockResolvedValue({ id: 'sub_new123' }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }),
      },
    },
    paymentMethods: {
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    paymentIntents: {
      create: vi.fn().mockResolvedValue({ id: 'pi_test123', status: 'succeeded' }),
    },
    billing: {
      creditGrants: {
        create: vi.fn().mockResolvedValue({ id: 'cg_test123' }),
      },
      creditBalanceSummary: {
        retrieve: vi.fn().mockResolvedValue({
          balances: [{ available_balance: { monetary: { value: 350 } } }],
        }),
      },
      meterEvents: {
        create: vi.fn().mockResolvedValue({ identifier: 'me_test123' }),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }),
      },
    },
  }
}

// Mock admin API fetch
export function createMockAdminFetch(user = mockUser()) {
  return vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
    const method = options?.method || 'GET'

    // POST /admin/users — upsert
    if (method === 'POST' && url.includes('/admin/users')) {
      return new Response(JSON.stringify(user), { status: 200 })
    }

    // PATCH /admin/users/:id
    if (method === 'PATCH' && url.includes('/admin/users/')) {
      return new Response(JSON.stringify({ ...user, ...JSON.parse(options?.body as string || '{}') }), { status: 200 })
    }

    return new Response('Not found', { status: 404 })
  })
}
