import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
const BILLING_URL = process.env.BILLING_URL || 'http://localhost:9000'

export async function GET(request: NextRequest) {
  try {
    console.log('[Test Portal] Checking Stripe configuration...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log(`[Test Portal] User email: ${session.user.email}`)

    const resp = await fetch(`${BILLING_URL}/v1/portal/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session.user.email, returnUrl: `${request.headers.get('origin') || 'http://localhost:3001'}/dashboard` })
    })
    const data = await resp.json()
    return NextResponse.json(data, { status: resp.status })

  } catch (error) {
    console.error('[Test Portal] General error:', error)
    
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 