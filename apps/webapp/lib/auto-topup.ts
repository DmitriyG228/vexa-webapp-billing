import Stripe from 'stripe'
import { BOT_RATE_CENTS_PER_MIN, TX_RATE_CENTS_PER_MIN } from '@/lib/billing-rates'
import { getUserByEmail, patchUser } from '@/lib/stripe-billing'


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

/**
 * Check if customer's effective balance is below their auto-topup threshold.
 * If so, charge their saved payment method and create a credit grant.
 */
export async function checkAutoTopup(stripe: Stripe, customerId: string, email: string, additionalUsageCents: number = 0) {
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
        getMeterUsage(stripe, customerId, 'vexa_tx_addon_minutes', periodStart, periodEnd),
      ])
      usageCents = Math.round(botMin * BOT_RATE_CENTS_PER_MIN + txMin * TX_RATE_CENTS_PER_MIN)
    }

    // Add proration credits (negative customer.balance = credit)
    let prorationCents = 0
    if (cust.balance < 0) prorationCents = Math.abs(cust.balance)

    const effectiveBalance = Math.max(creditBalanceCents + prorationCents - usageCents - additionalUsageCents, 0)

    console.log(`[AUTO-TOPUP] Check for ${email}: balance=${effectiveBalance}c, threshold=${thresholdCents}c`)

    if (effectiveBalance >= thresholdCents) return

    // F6: Enforce monthly cap — sum credit grants this month, skip if cap would be exceeded
    const monthlyCapCents = parseInt(meta.monthly_cap_cents || '0', 10)
    if (monthlyCapCents > 0) {
      try {
        const startOfMonth = new Date()
        startOfMonth.setUTCDate(1)
        startOfMonth.setUTCHours(0, 0, 0, 0)
        // List recent credit grants for this customer to sum this month's topups
        const grants = await stripe.billing.creditGrants.list({
          customer: customerId,
        } as Stripe.Billing.CreditGrantListParams)
        let monthlyTotalCents = 0
        for (const grant of grants.data) {
          // Only count paid grants (topups, not promotional)
          if (grant.category !== 'paid') continue
          const grantDate = new Date(grant.created * 1000)
          if (grantDate >= startOfMonth) {
            const grantAmount = (grant.amount as { monetary?: { value?: number } })?.monetary?.value || 0
            monthlyTotalCents += grantAmount
          }
        }
        if (monthlyTotalCents + topupAmountCents > monthlyCapCents) {
          console.log(`[AUTO-TOPUP] Monthly cap exceeded for ${email}: ${monthlyTotalCents}c + ${topupAmountCents}c > ${monthlyCapCents}c cap`)
          return false
        }
      } catch (capErr) {
        console.error(`[AUTO-TOPUP] Monthly cap check failed for ${email}:`, capErr)
        // Fail open — allow the charge if cap check errors
      }
    }

    // Balance below threshold — charge and create credit grant
    let pmId = cust.invoice_settings?.default_payment_method
    if (typeof pmId === 'object' && pmId !== null) pmId = pmId.id
    // Fallback: find any saved payment method on the customer
    if (!pmId) {
      const pms = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 1 })
      if (pms.data.length > 0) {
        pmId = pms.data[0].id
        // Save as default for future use
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: pmId },
        })
      }
    }
    if (!pmId) {
      console.log(`[AUTO-TOPUP] No payment method for ${email}`)
      return
    }

    // F5: Idempotency key prevents duplicate charges from concurrent webhook firings
    const now = new Date()
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
    const idempotencyKey = `autotopup-${customerId}-${monthKey}-${Math.floor(Date.now() / 60000)}`

    const pi = await stripe.paymentIntents.create({
      amount: topupAmountCents,
      currency: 'usd',
      customer: customerId,
      payment_method: pmId as string,
      off_session: true,
      confirm: true,
      description: `Auto top-up $${(topupAmountCents / 100).toFixed(2)} (balance below $${(thresholdCents / 100).toFixed(2)} threshold)`,
    }, {
      idempotencyKey,
    })

    if (pi.status === 'succeeded') {
      await stripe.billing.creditGrants.create({
        customer: customerId,
        name: `Auto top-up $${(topupAmountCents / 100).toFixed(2)}`,
        category: 'paid',
        amount: { type: 'monetary', monetary: { currency: 'usd', value: topupAmountCents } },
        applicability_config: { scope: { price_type: 'metered' } },
      } as Stripe.Billing.CreditGrantCreateParams)
      console.log(`[AUTO-TOPUP] +$${(topupAmountCents / 100).toFixed(2)} for ${email} (was ${effectiveBalance}c < ${thresholdCents}c)`)

      // M2: Restore bots if user was disabled due to depleted credits
      try {
        const user = await getUserByEmail(email)
        if (user && user.max_concurrent_bots === 0) {
          const tier = user.data?.subscription_tier as string | undefined
          const defaultBots = tier === 'individual' ? 1 : 5
          await patchUser(user.id, { max_concurrent_bots: defaultBots })
          console.log(`[AUTO-TOPUP] Restored max_concurrent_bots=${defaultBots} for ${email}`)
        }
      } catch (restoreErr) {
        console.error(`[AUTO-TOPUP] Failed to restore bots for ${email}:`, restoreErr)
      }

      return { topped_up: true, amount_cents: topupAmountCents }
    }
  } catch (err) {
    console.error(`[AUTO-TOPUP] Failed for ${email}:`, err)
  }
}
