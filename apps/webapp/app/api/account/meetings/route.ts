import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getAdminAPIClient } from '@/lib/admin-api-client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const adminAPI = getAdminAPIClient()

    const resp = await adminAPI.fetch(`/admin/analytics/users/${userId}/details`, {
      cache: 'no-store',
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching meeting analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch meeting data' }, { status: 500 })
  }
}
