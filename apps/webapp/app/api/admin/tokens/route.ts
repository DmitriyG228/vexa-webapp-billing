import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const BILLING_URL = process.env.BILLING_URL || 'http://localhost:9000'
const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:18056'
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN || ''

// POST /api/admin/tokens
// Creates a new API token via Billing service (which will also handle 1-hour trial if needed)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({} as any))
    const userId = body.userId
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const resp = await fetch(`${BILLING_URL}/v1/trials/api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session.user.email, userId })
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating token via Billing service:', error)
    return NextResponse.json({ error: 'Failed to create API token via billing.' }, { status: 500 })
  }
}

// GET /api/admin/tokens?userId=123
// Returns user with tokens from Admin API
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    if (!ADMIN_API_TOKEN) {
      return NextResponse.json({ error: 'Server is not configured for admin API' }, { status: 500 })
    }

    const resp = await fetch(`${ADMIN_API_URL}/admin/users/${userId}`, {
      headers: { 'X-Admin-API-Key': ADMIN_API_TOKEN },
      cache: 'no-store',
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching user from Admin API:', error)
    return NextResponse.json({ error: 'Failed to retrieve user' }, { status: 500 })
  }
} 