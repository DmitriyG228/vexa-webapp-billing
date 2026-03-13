import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockStripe, MOCK_STRIPE_IDS, mockUser } from './helpers'

const mockStripe = createMockStripe()
const mockGetServerSession = vi.fn()
const mockGetUserByEmail = vi.fn()

vi.mock('next-auth', () => ({
  getServerSession: (...args: any[]) => mockGetServerSession(...args),
}))

vi.mock('../../app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}))

vi.mock('@/lib/stripe-billing', () => ({
  getStripe: () => mockStripe,
  getUserByEmail: (...args: any[]) => mockGetUserByEmail(...args),
}))

import { GET } from '@/app/api/stripe/balance/route'

function makeRequest() {
  return new Request('http://localhost:3000/api/stripe/balance', { method: 'GET' })
}

describe('Balance Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { email: 'test@vexa.ai' } })
    mockStripe.billing.creditBalanceSummary.retrieve.mockResolvedValue({
      balances: [{ available_balance: { monetary: { value: 350 } } }],
    })
    mockStripe.customers.retrieve.mockResolvedValue({
      id: 'cus_test123', email: 'test@vexa.ai', deleted: false,
      metadata: { topup_enabled: 'true', topup_threshold_cents: '100', topup_amount_cents: '500' },
    })
  })

  // B1: PAYG user with credit
  it('B1: returns correct balance for PAYG user', async () => {
    mockGetUserByEmail.mockResolvedValue(mockUser({
      max_concurrent_bots: 5,
      data: { stripe_customer_id: 'cus_test123', subscription_tier: 'bot_service', subscription_status: 'active' },
    }))
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.balance_cents).toBe(350)
    expect(data.max_concurrent_bots).toBe(5)
    expect(data.subscription_tier).toBe('bot_service')
    expect(data.topup_enabled).toBe(true)
  })

  // B2: Individual user
  it('B2: returns zero balance for Individual user', async () => {
    mockStripe.billing.creditBalanceSummary.retrieve.mockResolvedValue({ balances: [] })
    mockGetUserByEmail.mockResolvedValue(mockUser({
      max_concurrent_bots: 1,
      data: { stripe_customer_id: 'cus_test123', subscription_tier: 'individual', subscription_status: 'active' },
    }))
    const res = await GET()
    const data = await res.json()
    expect(data.balance_cents).toBe(0)
    expect(data.max_concurrent_bots).toBe(1)
    expect(data.subscription_tier).toBe('individual')
  })

  // B3: TX user balance
  it('B3: returns TX balance in cents', async () => {
    mockStripe.billing.creditBalanceSummary.retrieve.mockResolvedValue({
      balances: [{ available_balance: { monetary: { value: 1500 } } }],
    })
    mockGetUserByEmail.mockResolvedValue(mockUser({
      data: { stripe_customer_id: 'cus_test123', transcription_enabled: true },
    }))
    const res = await GET()
    const data = await res.json()
    expect(data.balance_cents).toBe(1500)
    expect(data.transcription_enabled).toBe(true)
  })

  // B4: User with topup prefs
  it('B4: returns topup preferences from Customer.metadata', async () => {
    mockGetUserByEmail.mockResolvedValue(mockUser({
      data: { stripe_customer_id: 'cus_test123' },
    }))
    mockStripe.customers.retrieve.mockResolvedValueOnce({
      id: 'cus_test123', deleted: false,
      metadata: { topup_enabled: 'true', topup_threshold_cents: '200', topup_amount_cents: '1000', monthly_cap_cents: '5000' },
    })
    const res = await GET()
    const data = await res.json()
    expect(data.topup_enabled).toBe(true)
    expect(data.topup_threshold_cents).toBe(200)
    expect(data.topup_amount_cents).toBe(1000)
    expect(data.monthly_cap_cents).toBe(5000)
  })

  // B5: No Stripe customer
  it('B5: returns zero balance when user has no stripe_customer_id', async () => {
    mockGetUserByEmail.mockResolvedValue(mockUser({
      max_concurrent_bots: 0,
      data: {},
    }))
    const res = await GET()
    const data = await res.json()
    expect(data.balance_cents).toBe(0)
    expect(data.max_concurrent_bots).toBe(0)
    // Should NOT call Stripe
    expect(mockStripe.billing.creditBalanceSummary.retrieve).not.toHaveBeenCalled()
  })

  // B6: Unauthenticated
  it('B6: returns 401 when not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })
})
