import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getAdminAPIClient } from '@/lib/admin-api-client'

const TRANSCRIPTION_GW_URL = process.env.TRANSCRIPTION_GW_URL

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!TRANSCRIPTION_GW_URL) {
      return NextResponse.json({ error: 'Transcription gateway not configured' }, { status: 503 })
    }

    const userId = (session.user as any).id
    const days = request.nextUrl.searchParams.get('days') || '30'

    // Get user's API key from Admin API
    const adminAPI = getAdminAPIClient()
    const userResp = await adminAPI.fetch(`/admin/users/${userId}`, { cache: 'no-store' })
    if (!userResp.ok) {
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 502 })
    }
    const userData = await userResp.json()
    const apiKey = userData.api_tokens?.find((t: any) => t.is_active !== false)?.token
    if (!apiKey) {
      return NextResponse.json({ error: 'No active API key found' }, { status: 404 })
    }

    // Call Transcription GW
    const resp = await fetch(`${TRANSCRIPTION_GW_URL}/usage?days=${days}`, {
      headers: { 'X-API-Key': apiKey },
      cache: 'no-store',
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching usage:', error)
    return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 })
  }
}
