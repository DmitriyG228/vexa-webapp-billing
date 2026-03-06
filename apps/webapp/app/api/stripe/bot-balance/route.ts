import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const BILLING_URL = process.env.BILLING_URL
const INITIAL_CREDIT_CENTS = 500 // $5 welcome credit

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const emptyBotBalance = {
      balance_cents: 0,
      initial_credit_cents: 0,
      usage_cents: 0,
      balance_usd: '$0.00',
      usage_usd: '$0.00',
      initial_credit_usd: '$0.00',
      has_subscription: false,
      topup_enabled: true,
      topup_threshold_cents: 100,
      topup_amount_cents: 500,
    }

    if (!BILLING_URL) {
      return NextResponse.json(emptyBotBalance)
    }

    const resp = await fetch(`${BILLING_URL}/v1/balance/${encodeURIComponent(session.user.email)}`, {
      cache: 'no-store',
    })

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json(emptyBotBalance)
    }

    // Transform billing API response to frontend-expected shape
    const bot = data.bot || {}
    const balanceCents = bot.balance_cents || 0
    const initialCreditCents = bot.welcome_credit_given ? INITIAL_CREDIT_CENTS : 0
    const usageCents = Math.max(initialCreditCents - balanceCents, 0)

    return NextResponse.json({
      balance_cents: balanceCents,
      initial_credit_cents: initialCreditCents,
      usage_cents: usageCents,
      balance_usd: formatUsd(balanceCents),
      usage_usd: formatUsd(usageCents),
      initial_credit_usd: formatUsd(initialCreditCents),
      has_subscription: bot.welcome_credit_given || balanceCents > 0,
      topup_enabled: bot.topup_enabled ?? true,
      topup_threshold_cents: bot.topup_threshold_cents ?? 100,
      topup_amount_cents: bot.topup_amount_cents ?? 500,
    })
  } catch (error) {
    console.error('Error fetching bot balance:', error)
    return NextResponse.json({
      balance_cents: 0,
      initial_credit_cents: 0,
      usage_cents: 0,
      balance_usd: '$0.00',
      usage_usd: '$0.00',
      initial_credit_usd: '$0.00',
      has_subscription: false,
      topup_enabled: true,
      topup_threshold_cents: 100,
      topup_amount_cents: 500,
    })
  }
}
