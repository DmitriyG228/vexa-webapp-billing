import { computeUsageCents } from '@/lib/billing-rates'
import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'
import { checkAutoTopup } from '@/lib/auto-topup'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      meeting: {
        id: string
        user_email: string
        duration_seconds: number
        transcription_enabled?: boolean
      }
    }

    const meeting = body.meeting
    if (!meeting?.user_email || !meeting?.duration_seconds) {
      return NextResponse.json(
        { error: 'Missing required fields: meeting.user_email, meeting.duration_seconds' },
        { status: 422 }
      )
    }

    const stripe = getStripe()
    const durationMinutes = Math.ceil(meeting.duration_seconds / 60)

    // Look up user to get stripe_customer_id
    const user = await getUserByEmail(meeting.user_email)
    if (!user) {
      return NextResponse.json(
        { error: `User not found: ${meeting.user_email}` },
        { status: 404 }
      )
    }

    const customerId = user.data?.stripe_customer_id as string | undefined
    if (!customerId) {
      console.error(`[MEETING-HOOK] No stripe_customer_id for ${meeting.user_email}`)
      return NextResponse.json(
        { error: 'User has no Stripe customer ID' },
        { status: 400 }
      )
    }

    // Report bot minutes
    try {
      await stripe.billing.meterEvents.create({
        event_name: 'vexa_bot_minutes',
        payload: {
          stripe_customer_id: customerId,
          value: String(durationMinutes),
        },
      })
      console.log(`[MEETING-HOOK] Reported ${durationMinutes} bot minutes for ${meeting.user_email}`)
    } catch (err) {
      console.error(`[MEETING-HOOK] Bot MeterEvent failed for ${meeting.user_email}:`, err)
      return NextResponse.json(
        { error: 'Failed to report bot usage' },
        { status: 500 }
      )
    }

    // Report TX minutes if transcription was enabled
    if (meeting.transcription_enabled) {
      try {
        await stripe.billing.meterEvents.create({
          event_name: 'vexa_tx_addon_minutes',
          payload: {
            stripe_customer_id: customerId,
            value: String(durationMinutes),
          },
        })
        console.log(`[MEETING-HOOK] Reported ${durationMinutes} TX minutes for ${meeting.user_email}`)
      } catch (err) {
        console.error(`[MEETING-HOOK] TX MeterEvent failed for ${meeting.user_email}:`, err)
      }
    }

    // Check auto-topup threshold after reporting usage (don't block response)
    checkAutoTopup(stripe, customerId, meeting.user_email, computeUsageCents(durationMinutes, meeting.transcription_enabled ? durationMinutes : 0)).catch(err =>
      console.error(`[MEETING-HOOK] Auto-topup background check failed:`, err)
    )

    return NextResponse.json({
      success: true,
      meeting_id: meeting.id,
      bot_minutes: durationMinutes,
      tx_minutes: meeting.transcription_enabled ? durationMinutes : 0,
    })
  } catch (error) {
    console.error('[MEETING-HOOK] Error:', error)
    const message = error instanceof Error ? error.message : 'Hook processing failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
