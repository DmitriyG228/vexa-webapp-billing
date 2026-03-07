import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockStripe, MOCK_STRIPE_IDS, mockUser } from './helpers'

const mockStripe = createMockStripe()
const mockGetServerSession = vi.fn()

vi.mock('next-auth', () => ({
  getServerSession: (...args: any[]) => mockGetServerSession(...args),
}))

vi.mock('../../app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}))

vi.mock('@/lib/stripe-billing', () => ({
  getStripe: () => mockStripe,
  getStripeIds: () => MOCK_STRIPE_IDS,
  getPriceId: (plan: string) => MOCK_STRIPE_IDS[plan as keyof typeof MOCK_STRIPE_IDS]?.price_id || `price_${plan}`,
  getUserByEmail: vi.fn().mockResolvedValue(mockUser({ data: { stripe_customer_id: 'cus_test123' } })),
  BOT_PLANS: new Set(['individual', 'bot_service']),
  TX_PLANS: new Set(['transcription_api', 'transcription_addon']),
  ONETIME_PLANS: new Set(['consultation']),
}))

import { POST } from '@/app/api/stripe/checkout/route'

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/stripe/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
    body: JSON.stringify(body),
  })
}

describe('Checkout Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { email: 'test@vexa.ai', name: 'Test' } })
  })

  // C1: Individual checkout
  it('C1: creates individual subscription checkout', async () => {
    const req = makeRequest({ plan: 'individual' })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.url).toBe('https://checkout.stripe.com/test')
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: expect.arrayContaining([
          expect.objectContaining({ price: 'price_individual', quantity: 1 }),
        ]),
      })
    )
  })

  // C2: PAYG checkout
  it('C2: creates PAYG subscription checkout', async () => {
    const req = makeRequest({ plan: 'bot_service' })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: expect.arrayContaining([
          expect.objectContaining({ price: 'price_bot_service' }),
        ]),
      })
    )
  })

  // C3: TX standalone checkout
  it('C3: creates TX standalone subscription checkout', async () => {
    const req = makeRequest({ plan: 'transcription_api' })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: expect.arrayContaining([
          expect.objectContaining({ price: 'price_tx_api' }),
        ]),
      })
    )
  })

  // C4: TX add-on checkout
  it('C4: creates TX add-on subscription checkout', async () => {
    const req = makeRequest({ plan: 'transcription_addon' })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: expect.arrayContaining([
          expect.objectContaining({ price: 'price_tx_addon' }),
        ]),
      })
    )
  })

  // C5: Plan switch
  it('C5: creates checkout with replaces_sub metadata for plan switch', async () => {
    const req = makeRequest({ plan: 'bot_service', current_sub: 'sub_old123' })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        subscription_data: expect.objectContaining({
          metadata: expect.objectContaining({
            replaces_sub: 'sub_old123',
          }),
        }),
      })
    )
  })

  // C6: Unauthenticated
  it('C6: returns 401 when not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const req = makeRequest({ plan: 'individual' })
    const res = await POST(req as any)
    expect(res.status).toBe(401)
  })
})
