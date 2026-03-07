import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockStripe, mockUser } from './helpers'

const mockStripe = createMockStripe()
const mockGetUserByEmail = vi.fn()

vi.mock('@/lib/stripe-billing', () => ({
  getStripe: () => mockStripe,
  getUserByEmail: (...args: any[]) => mockGetUserByEmail(...args),
}))

import { POST } from '@/app/api/hooks/meeting-completed/route'

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/hooks/meeting-completed', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('Meeting Completed Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserByEmail.mockResolvedValue(mockUser({
      data: { stripe_customer_id: 'cus_test123' },
    }))
  })

  // M1: Bot-only meeting
  it('M1: reports bot minutes only for non-TX meeting', async () => {
    const req = makeRequest({
      meeting: { id: 'mtg_1', user_email: 'test@vexa.ai', duration_seconds: 3600, transcription_enabled: false },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.bot_minutes).toBe(60)
    expect(data.tx_minutes).toBe(0)
    expect(mockStripe.billing.meterEvents.create).toHaveBeenCalledTimes(1)
    expect(mockStripe.billing.meterEvents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'vexa_bot_minutes',
        payload: expect.objectContaining({ value: '60' }),
      })
    )
  })

  // M2: Bot + TX meeting
  it('M2: reports both bot and TX minutes', async () => {
    const req = makeRequest({
      meeting: { id: 'mtg_2', user_email: 'test@vexa.ai', duration_seconds: 3600, transcription_enabled: true },
    })
    const res = await POST(req as any)
    const data = await res.json()
    expect(data.bot_minutes).toBe(60)
    expect(data.tx_minutes).toBe(60)
    expect(mockStripe.billing.meterEvents.create).toHaveBeenCalledTimes(2)
  })

  // M3: Short meeting
  it('M3: reports correct minutes for short meeting', async () => {
    const req = makeRequest({
      meeting: { id: 'mtg_3', user_email: 'test@vexa.ai', duration_seconds: 300 },
    })
    const res = await POST(req as any)
    const data = await res.json()
    expect(data.bot_minutes).toBe(5)
    expect(mockStripe.billing.meterEvents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ value: '5' }),
      })
    )
  })

  // M4: Unknown user email
  it('M4: returns 404 for unknown user', async () => {
    mockGetUserByEmail.mockResolvedValue(null)
    const req = makeRequest({
      meeting: { id: 'mtg_4', user_email: 'noone@example.com', duration_seconds: 3600 },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(404)
  })

  // M5: Missing stripe_customer_id
  it('M5: returns 400 when user has no Stripe ID', async () => {
    mockGetUserByEmail.mockResolvedValue(mockUser({ data: {} }))
    const req = makeRequest({
      meeting: { id: 'mtg_5', user_email: 'test@vexa.ai', duration_seconds: 3600 },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  // M6: Negative balance allowed
  it('M6: reports usage even with zero credit (no gating)', async () => {
    const req = makeRequest({
      meeting: { id: 'mtg_6', user_email: 'test@vexa.ai', duration_seconds: 3600 },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    expect(mockStripe.billing.meterEvents.create).toHaveBeenCalled()
  })
})
