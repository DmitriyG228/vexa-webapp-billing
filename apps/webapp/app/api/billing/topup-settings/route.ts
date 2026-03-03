import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const BILLING_URL = process.env.BILLING_URL

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (!BILLING_URL) {
      return NextResponse.json({ error: 'BILLING_URL not configured' }, { status: 503 })
    }

    const body = await request.json()
    const resp = await fetch(`${BILLING_URL}/v1/balance/topup-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, email: session.user.email }),
    })

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating topup settings:', error)
    return NextResponse.json({ error: 'Failed to update topup settings' }, { status: 500 })
  }
}
