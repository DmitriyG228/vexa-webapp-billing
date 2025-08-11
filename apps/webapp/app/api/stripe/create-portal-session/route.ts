import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const BILLING_URL = process.env.BILLING_URL

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!BILLING_URL) {
      return NextResponse.json({ error: 'Server misconfiguration: BILLING_URL is not set' }, { status: 500 })
    }
    const origin = request.headers.get('origin')
    if (!origin) {
      return NextResponse.json({ error: 'Missing Origin header to construct return URL' }, { status: 400 })
    }
    const returnUrl = `${origin}/dashboard`
    const resp = await fetch(`${BILLING_URL}/v1/portal/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session.user.email, returnUrl })
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status })
    }
    return NextResponse.json({ url: data.url })

  } catch (error) {
    console.error('Error creating portal session:', error)
    
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
} 