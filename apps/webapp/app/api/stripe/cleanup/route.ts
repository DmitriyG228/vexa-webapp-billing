import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const BILLING_URL = process.env.BILLING_URL

export async function POST(_: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 })
    }
    if (!BILLING_URL) {
      return NextResponse.json({ error: 'Server misconfiguration: BILLING_URL is not set' }, { status: 500 })
    }
    const resp = await fetch(`${BILLING_URL}/`)
    const data = await resp.json()
    return NextResponse.json({ message: 'Cleanup moved to billing ops', billing: data })
  } catch (error) {
    console.error('Error in cleanup endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(_: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 })
    }
    if (!BILLING_URL) {
      return NextResponse.json({ error: 'Server misconfiguration: BILLING_URL is not set' }, { status: 500 })
    }
    const resp = await fetch(`${BILLING_URL}/`)
    const data = await resp.json()
    return NextResponse.json({ message: 'Summary moved to billing ops', billing: data })
  } catch (error) {
    console.error('Error in summary endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
 