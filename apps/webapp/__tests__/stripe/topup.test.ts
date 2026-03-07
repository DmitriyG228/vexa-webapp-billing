import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockStripe, mockUser } from './helpers'

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

import { POST } from '@/app/api/stripe/topup/route'

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/stripe/topup', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
    body: JSON.stringify(body),
  })
}

describe('Topup Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { email: 'test@vexa.ai' } })
    mockGetUserByEmail.mockResolvedValue(mockUser({
      data: { stripe_customer_id: 'cus_test123' },
    }))
    mockStripe.customers.retrieve.mockResolvedValue({
      id: 'cus_test123', deleted: false,
      invoice_settings: { default_payment_method: 'pm_test123' },
    })
    mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test', status: 'succeeded' })
    mockStripe.billing.creditBalanceSummary.retrieve.mockResolvedValue({
      balances: [{ monetary: { available: { amount: 850 } } }],
    })
  })

  // T1: Off-session topup
  it('T1: charges off-session and creates credit grant for bot topup', async () => {
    const req = makeRequest({ amount_cents: 500, product: 'bot' })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 500,
        off_session: true,
        confirm: true,
      })
    )
    expect(mockStripe.billing.creditGrants.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_test123',
        category: 'paid',
      })
    )
  })

  // T2: Topup via checkout (no saved card)
  it('T2: returns checkout URL when no saved payment method', async () => {
    mockStripe.customers.retrieve.mockResolvedValueOnce({
      id: 'cus_test123', deleted: false,
      invoice_settings: {},
    })
    const req = makeRequest({ amount_cents: 500, product: 'bot' })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.url).toBe('https://checkout.stripe.com/test')
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalled()
  })

  // T3: TX topup
  it('T3: creates TX credit grant for transcription topup', async () => {
    const req = makeRequest({ amount_cents: 1000, product: 'tx' })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    expect(mockStripe.billing.creditGrants.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.stringContaining('tx'),
      })
    )
  })

  // T4: Save topup preferences
  it('T4: saves topup preferences to Customer.metadata', async () => {
    const req = makeRequest({
      topup_enabled: true,
      topup_threshold_cents: 200,
      topup_amount_cents: 1000,
      monthly_cap_cents: 5000,
    })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(mockStripe.customers.update).toHaveBeenCalledWith(
      'cus_test123',
      expect.objectContaining({
        metadata: expect.objectContaining({
          topup_enabled: 'true',
          topup_threshold_cents: '200',
          topup_amount_cents: '1000',
          monthly_cap_cents: '5000',
        }),
      })
    )
  })

  // T5: Monthly cap enforcement — handled in webhook auto-topup
  it('T5: caps are stored and used at webhook time', async () => {
    const req = makeRequest({
      topup_enabled: true,
      monthly_cap_cents: 3000,
    })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    expect(mockStripe.customers.update).toHaveBeenCalledWith(
      'cus_test123',
      expect.objectContaining({
        metadata: expect.objectContaining({ monthly_cap_cents: '3000' }),
      })
    )
  })
})
