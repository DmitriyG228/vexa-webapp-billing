import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'
import { BOT_RATE_CENTS_PER_MIN, TX_RATE_CENTS_PER_MIN, TX_API_RATE_CENTS_PER_MIN } from '@/lib/billing-rates'
import { getLedgerEntries } from '@/lib/meter-ledger'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const RATE_MAP: Record<string, { label: string; rate: number }> = {
  vexa_bot_minutes: { label: 'Bot minutes', rate: BOT_RATE_CENTS_PER_MIN },
  vexa_tx_addon_minutes: { label: 'Real-time transcription', rate: TX_RATE_CENTS_PER_MIN },
  vexa_tx_api_minutes: { label: 'Transcription', rate: TX_API_RATE_CENTS_PER_MIN },
}

interface BillingEvent {
  id: string
  date: string
  type: string
  description: string
  amount_cents: number
  amount_usd: string
  status: string
  meter?: string
  minutes?: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '100', 10), 200)
    const email = session.user.email

    const user = await getUserByEmail(email)
    if (!user) return NextResponse.json({ events: [], meter_events: [] })

    const customerId = user.data?.stripe_customer_id as string | undefined
    if (!customerId) return NextResponse.json({ events: [], meter_events: [] })

    const stripe = getStripe()
    const events: BillingEvent[] = []
    const meterEvents: BillingEvent[] = []

    // Fetch billing data and meter ledger in parallel
    const [charges, invoices, creditGrants, ledgerEntries, customerBalanceTxns] = await Promise.all([
      stripe.charges.list({ customer: customerId, limit }),
      stripe.invoices.list({ customer: customerId, limit }),
      stripe.billing.creditGrants.list({ customer: customerId as any, limit } as any).catch(() => ({ data: [] as any[] })),
      getLedgerEntries(customerId, 30),
      stripe.customers.listBalanceTransactions(customerId, { limit }).catch(() => ({ data: [] as any[] })),
    ])

    // Meter events from Redis ledger (exact timestamps)
    for (let i = 0; i < ledgerEntries.length; i++) {
      const entry = ledgerEntries[i]
      const def = RATE_MAP[entry.event_name]
      if (!def) continue

      const costCents = entry.value * def.rate
      meterEvents.push({
        id: `ledger_${i}_${entry.timestamp}`,
        date: new Date(entry.timestamp * 1000).toISOString(),
        type: 'meter',
        description: `${def.label}: ${entry.value.toFixed(2)} min`,
        amount_cents: costCents,
        amount_usd: `$${(costCents / 100).toFixed(4)}`,
        status: 'recorded',
        meter: entry.event_name,
        minutes: entry.value,
      })
    }

    // Refunds from charges (standalone charges are omitted — they duplicate credit_grants)
    for (const charge of charges.data) {
      if (charge.invoice) continue
      if (charge.refunded) {
        events.push({
          id: charge.id,
          date: new Date(charge.created * 1000).toISOString(),
          type: 'refund',
          description: charge.description || 'Refund',
          amount_cents: charge.amount_refunded,
          amount_usd: formatCents(charge.amount_refunded),
          status: 'refunded',
        })
      }
    }

    // Invoices — classify as subscription (card-paid, no balance impact) vs usage
    for (const inv of invoices.data) {
      const desc = inv.lines?.data?.length === 1
        ? inv.lines.data[0].description || 'Invoice'
        : `Invoice — ${inv.lines?.data?.length || 0} items`
      const isSubscription = (inv.billing_reason || '').startsWith('subscription')
      // Skip $0 subscription invoices (prorations that netted to zero)
      if (isSubscription && (inv.amount_due || 0) === 0) continue
      events.push({
        id: inv.id,
        date: new Date((inv.created || 0) * 1000).toISOString(),
        type: isSubscription ? 'subscription' : 'invoice',
        description: desc,
        amount_cents: inv.amount_due || 0,
        amount_usd: formatCents(inv.amount_due || 0),
        status: inv.status || 'unknown',
      })
    }

    // Credit grants
    for (const grant of (creditGrants as any).data || []) {
      const amt = grant.amount?.monetary?.value || 0
      events.push({
        id: grant.id,
        date: new Date((grant.created || 0) * 1000).toISOString(),
        type: 'credit_grant',
        description: grant.name || 'Credit grant',
        amount_cents: amt,
        amount_usd: formatCents(amt),
        status: grant.voided ? 'voided' : 'active',
      })
    }

    // Customer balance transactions — split manual adjustments from prorations
    const cbtList = (customerBalanceTxns as any).data || []
    // Manual adjustments: show each individually
    for (const txn of cbtList) {
      if (txn.type !== 'adjustment' || txn.amount >= 0) continue
      events.push({
        id: txn.id,
        date: new Date((txn.created || 0) * 1000).toISOString(),
        type: 'credit_grant',
        description: txn.description || 'Manual credit',
        amount_cents: Math.abs(txn.amount),
        amount_usd: formatCents(Math.abs(txn.amount)),
        status: 'active',
      })
    }
    // Prorations: net all non-adjustment transactions into one line
    const prorationNet = cbtList
      .filter((t: any) => t.type !== 'adjustment')
      .reduce((s: number, t: any) => s + t.amount, 0)
    if (prorationNet < 0) {
      const latestProration = cbtList.find((t: any) => t.type !== 'adjustment')
      events.push({
        id: 'proration_credit',
        date: new Date((latestProration?.created || Date.now() / 1000) * 1000).toISOString(),
        type: 'credit_grant',
        description: 'Plan switch credit',
        amount_cents: Math.abs(prorationNet),
        amount_usd: formatCents(Math.abs(prorationNet)),
        status: 'active',
      })
    }

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    meterEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      events: events.slice(0, limit),
      meter_events: meterEvents,
    })
  } catch (error) {
    console.error('[BILLING-EVENTS] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch billing events' }, { status: 500 })
  }
}

function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`
}
