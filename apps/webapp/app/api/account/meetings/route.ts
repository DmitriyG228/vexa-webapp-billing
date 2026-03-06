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

    // Map admin API field names to what the frontend expects
    const stats = data.meeting_stats || {}
    const patterns = data.usage_patterns || {}

    // Use platform_counts from admin API, fall back to most_used_platform
    const platforms: Record<string, number> = patterns.platform_counts ?? {}
    if (Object.keys(platforms).length === 0 && patterns.most_used_platform) {
      platforms[patterns.most_used_platform] = stats.total_meetings ?? 0
    }

    return NextResponse.json({
      meeting_stats: {
        total: stats.total_meetings ?? 0,
        completed: stats.completed_meetings ?? 0,
        failed: stats.failed_meetings ?? 0,
        active: stats.active_meetings ?? 0,
        total_duration: stats.total_duration ?? null,
        average_duration: stats.average_duration ?? null,
      },
      usage_patterns: {
        platforms,
        peak_hours: patterns.peak_usage_hours ?? [],
        meetings_per_day: patterns.meetings_per_day ?? 0,
        last_activity: patterns.last_activity ?? null,
      },
    })
  } catch (error) {
    console.error('Error fetching meeting analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch meeting data' }, { status: 500 })
  }
}
