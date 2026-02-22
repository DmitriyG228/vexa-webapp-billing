import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const BILLING_URL = process.env.BILLING_URL

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!BILLING_URL) {
      return NextResponse.json({ error: 'Server misconfiguration: BILLING_URL is not set' }, { status: 500 })
    }

    const origin = request.headers.get('origin')
    if (!origin) {
      return NextResponse.json({ error: 'Missing Origin header to construct return URL' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({})) as { context?: string; quantity?: number }
    const context = body?.context || 'pricing'
    const quantity = typeof body?.quantity === 'number' ? body.quantity : undefined

    const payload = {
      email: session.user.email,
      context,
      quantity,
      origin,
      returnUrl: `${origin}/account`,
      successUrl: `${origin}/account`,
      cancelUrl: `${origin}/pricing`,
    }

    const resp = await fetch(`${BILLING_URL}/v1/stripe/resolve-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status })
    }

    return NextResponse.json({ url: data.url })
  } catch (error) {
    console.error('Error resolving billing URL:', error)
    return NextResponse.json({ error: 'Failed to resolve billing URL' }, { status: 500 })
  }
}


