import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'

export const dynamic = 'force-dynamic'

const TX_API_METER = 'vexa_tx_api_minutes'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const days = parseInt(request.nextUrl.searchParams.get('days') || '30', 10)
    const email = session.user.email

    const emptyUsage = {
      user_id: (session.user as any)?.id?.toString() || '',
      email,
      balance_minutes: 0,
      total_purchased_minutes: 0,
      total_used_minutes: 0,
      usage_history: [] as { date: string; minutes: number }[],
      statistics: { period_days: days, total_minutes: 0, average_daily_minutes: 0, days_with_usage: 0 },
    }

    const user = await getUserByEmail(email)
    if (!user) return NextResponse.json(emptyUsage)

    const customerId = user.data?.stripe_customer_id as string | undefined
    if (!customerId) return NextResponse.json(emptyUsage)

    const stripe = getStripe()

    // Find the TX API meter
    const meters = await stripe.billing.meters.list({ limit: 10 })
    const txMeter = meters.data.find(m => m.event_name === TX_API_METER)
    if (!txMeter) return NextResponse.json(emptyUsage)

    // Query daily summaries for last N days
    const now = Math.floor(Date.now() / 1000)
    const endTime = now + (86400 - (now % 86400)) // ceil to next day boundary
    const startTime = endTime - days * 86400

    const summaries = await stripe.billing.meters.listEventSummaries(
      txMeter.id,
      {
        customer: customerId,
        start_time: startTime,
        end_time: endTime,
        value_grouping_window: 'day',
      },
    )

    // Build daily usage history
    const usageByDate = new Map<string, number>()
    for (const s of summaries.data) {
      if (s.aggregated_value > 0) {
        const date = new Date(s.start_time * 1000).toISOString().split('T')[0]
        usageByDate.set(date, (usageByDate.get(date) || 0) + s.aggregated_value)
      }
    }

    // Fill all days in range
    const usage_history: { date: string; minutes: number }[] = []
    for (let t = startTime; t < endTime; t += 86400) {
      const date = new Date(t * 1000).toISOString().split('T')[0]
      usage_history.push({ date, minutes: usageByDate.get(date) || 0 })
    }

    const totalMinutes = usage_history.reduce((sum, d) => sum + d.minutes, 0)
    const daysWithUsage = usage_history.filter(d => d.minutes > 0).length

    return NextResponse.json({
      user_id: (session.user as any).id.toString(),
      email,
      balance_minutes: 0, // balance is shown via bot-balance endpoint
      total_purchased_minutes: 0,
      total_used_minutes: totalMinutes,
      usage_history,
      statistics: {
        period_days: days,
        total_minutes: Math.round(totalMinutes * 100) / 100,
        average_daily_minutes: Math.round((totalMinutes / days) * 100) / 100,
        days_with_usage: daysWithUsage,
      },
    })
  } catch (error) {
    console.error('[ACCOUNT/USAGE] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 })
  }
}
