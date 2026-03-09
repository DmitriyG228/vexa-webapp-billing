import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'

export const dynamic = 'force-dynamic'

// Pricing per minute (in cents) — must match Stripe price configuration
const BOT_RATE_PER_MIN = 0.5   // $0.30/hr = $0.005/min = 0.5 cents/min
const TX_RATE_PER_MIN = 0.1667 // $0.10/hr = $0.001667/min ≈ 0.1667 cents/min

async function getMeterUsage(
  stripe: Stripe,
  customerId: string,
  meterEventName: string,
  periodStart: number,
  periodEnd: number,
): Promise<number> {
  try {
    const meters = await stripe.billing.meters.list({ limit: 10 })
    const meter = meters.data.find(m => m.event_name === meterEventName)
    if (!meter) return 0
    const summaries = await stripe.billing.meters.listEventSummaries(meter.id, {
      customer: customerId,
      start_time: periodStart,
      end_time: periodEnd,
    })
    let total = 0
    for (const s of summaries.data) total += s.aggregated_value
    return total
  } catch {
    return 0
  }
}

async function checkAutoTopup(stripe: Stripe, customerId: string, email: string) {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) return
    const cust = customer as Stripe.Customer
    const meta = cust.metadata || {}

    if (meta.topup_enabled !== 'true') return

    const thresholdCents = parseInt(meta.topup_threshold_cents || '100', 10)
    const topupAmountCents = parseInt(meta.topup_amount_cents || '500', 10)

    // Get current credit balance
    let creditBalanceCents = 0
    try {
      const summary = await stripe.billing.creditBalanceSummary.retrieve({
        customer: customerId,
        filter: { type: 'applicability_scope', applicability_scope: { price_type: 'metered' } },
      } as Stripe.Billing.CreditBalanceSummaryRetrieveParams)
      const balances = (summary as unknown as { balances: Array<{ available_balance: { monetary: { value: number } } }> }).balances || []
      for (const bal of balances) creditBalanceCents += bal.available_balance?.monetary?.value || 0
    } catch {}

    // Get current period metered usage
    let periodStart = 0
    let periodEnd = 0
    try {
      const subs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 5 })
      if (subs.data.length > 0) {
        periodStart = subs.data[0].current_period_start
        periodEnd = subs.data[0].current_period_end
      }
    } catch {}

    let usageCents = 0
    if (periodStart > 0 && periodEnd > 0) {
      const [botMin, txMin] = await Promise.all([
        getMeterUsage(stripe, customerId, 'vexa_bot_minutes', periodStart, periodEnd),
        getMeterUsage(stripe, customerId, 'vexa_tx_minutes', periodStart, periodEnd),
      ])
      usageCents = Math.round(botMin * BOT_RATE_PER_MIN + txMin * TX_RATE_PER_MIN)
    }

    // Add proration credits (negative customer.balance = credit)
    let prorationCents = 0
    if (cust.balance < 0) prorationCents = Math.abs(cust.balance)

    const effectiveBalance = Math.max(creditBalanceCents + prorationCents - usageCents, 0)

    console.log(`[MEETING-HOOK] Auto-topup check for ${email}: balance=${effectiveBalance}c, threshold=${thresholdCents}c`)

    if (effectiveBalance >= thresholdCents) return // Balance is fine

    // Balance below threshold — charge and create credit grant
    let pmId = cust.invoice_settings?.default_payment_method
    if (typeof pmId === 'object' && pmId !== null) pmId = pmId.id
    if (!pmId) {
      console.log(`[MEETING-HOOK] No payment method for auto-topup: ${email}`)
      return
    }

    const pi = await stripe.paymentIntents.create({
      amount: topupAmountCents,
      currency: 'usd',
      customer: customerId,
      payment_method: pmId as string,
      off_session: true,
      confirm: true,
      description: `Auto top-up $${(topupAmountCents / 100).toFixed(2)} (balance below $${(thresholdCents / 100).toFixed(2)} threshold)`,
    })

    if (pi.status === 'succeeded') {
      await stripe.billing.creditGrants.create({
        customer: customerId,
        name: `Auto top-up $${(topupAmountCents / 100).toFixed(2)}`,
        category: 'paid',
        amount: { type: 'monetary', monetary: { currency: 'usd', value: topupAmountCents } },
        applicability_config: { scope: { price_type: 'metered' } },
      } as Stripe.Billing.CreditGrantCreateParams)
      console.log(`[MEETING-HOOK] Auto-topup +$${(topupAmountCents / 100).toFixed(2)} for ${email} (was ${effectiveBalance}c < ${thresholdCents}c)`)
    }
  } catch (err) {
    console.error(`[MEETING-HOOK] Auto-topup failed for ${email}:`, err)
  }
}

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
          event_name: 'vexa_tx_minutes',
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
    checkAutoTopup(stripe, customerId, meeting.user_email).catch(err =>
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
