import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getAdminAPIClient } from '@/lib/admin-api-client'

const BILLING_URL = process.env.BILLING_URL

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

    if (!BILLING_URL) {
      return NextResponse.json({ error: 'Server misconfiguration: BILLING_URL is not set' }, { status: 500 })
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
    const userIdRaw = request.nextUrl.searchParams.get('userId')
    if (!userIdRaw) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    // Strictly validate userId to be digits only, no trailing punctuation
    const userId = userIdRaw.trim()
    if (!userId || !/^\d+$/.test(userId)) {
      console.error(`[admin/tokens] Invalid userId received: "${userIdRaw}" (trimmed: "${userId}")`)
      return NextResponse.json({
        error: 'Invalid userId',
        details: `userId must be a positive integer, received: "${userIdRaw}"`
      }, { status: 400 })
    }
    // Use circuit breaker for resilient admin API calls
    const adminAPI = getAdminAPIClient()

    const resp = await adminAPI.fetch(`/admin/users/${userId}`, {
      cache: 'no-store',
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching user from Admin API:', error)

    // Provide specific error messages based on error type
    if (error.message.includes('Circuit breaker is open')) {
      return NextResponse.json({
        error: 'Service temporarily unavailable',
        details: 'The admin API is temporarily unavailable due to recent failures. Please try again in a few minutes.',
        retryAfter: 60
      }, {
        status: 503,
        headers: { 'Retry-After': '60' }
      })
    }

    if (error.message.includes('timeout') || error.name === 'AbortError') {
      return NextResponse.json({
        error: 'Request timeout',
        details: 'The admin API is taking too long to respond. Please try again.'
      }, { status: 504 })
    }

    if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({
        error: 'Service unavailable',
        details: 'Cannot connect to the admin API service. This may be due to network issues or service maintenance.'
      }, { status: 503 })
    }

    // Generic error for unexpected issues
    return NextResponse.json({
      error: 'Service error',
      details: 'An unexpected error occurred while retrieving user data. Please try again later.'
    }, { status: 500 })
  }
} 