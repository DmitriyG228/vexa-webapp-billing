import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

const BILLING_URL = process.env.BILLING_URL

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!BILLING_URL) {
      return NextResponse.json({ error: 'BILLING_URL not configured' }, { status: 503 })
    }

    const resp = await fetch(`${BILLING_URL}/v1/stripe/bot-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session.user.email }),
      cache: 'no-store',
    })

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching bot balance:', error)
    return NextResponse.json({ error: 'Failed to fetch bot balance' }, { status: 500 })
  }
}
