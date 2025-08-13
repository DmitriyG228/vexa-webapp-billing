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
    
    console.log(`[DEBUG] BILLING_URL: ${BILLING_URL}`)
    console.log(`[DEBUG] User email: ${session.user.email}`)
    
    const origin = request.headers.get('origin')
    if (!origin) {
      return NextResponse.json({ error: 'Missing Origin header to construct return URL' }, { status: 400 })
    }
    const returnUrl = `${origin}/dashboard`
    const billingEndpoint = `${BILLING_URL}/v1/portal/session`
    
    console.log(`[DEBUG] Calling billing endpoint: ${billingEndpoint}`)
    console.log(`[DEBUG] Payload: ${JSON.stringify({ email: session.user.email, returnUrl })}`)
    
    const resp = await fetch(billingEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session.user.email, returnUrl }),
    })
    
    console.log(`[DEBUG] Billing response status: ${resp.status}`)
    console.log(`[DEBUG] Billing response headers:`, Object.fromEntries(resp.headers.entries()))
    
    const data = await resp.json().catch(() => ({}))
    console.log(`[DEBUG] Billing response data:`, data)
    
    if (!resp.ok) {
      console.error(`[DEBUG] Billing service returned error: ${resp.status}`, data)
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