import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

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

    const resp = await fetch(`${BILLING_URL}/v1/balance/${encodeURIComponent(session.user.email)}`, {
      cache: 'no-store',
    })

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status })
    }

    // Map billing service response to expected format for the account page
    const tx = data.tx || {}
    return NextResponse.json({
      balance_minutes: tx.balance_minutes ?? 0,
      remaining_minutes: tx.balance_minutes ?? 0,
      total_purchased_minutes: tx.balance_minutes ?? 0,
      total_used_minutes: 0,
    })
  } catch (error) {
    console.error('Error fetching balance:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
