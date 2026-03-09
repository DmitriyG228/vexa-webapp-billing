import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import Stripe from 'stripe'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const stripe = getStripe()
    const email = session.user.email
    const body = await request.json() as {
      amount_cents?: number
      product?: 'bot' | 'tx'
      // Topup preferences update
      topup_enabled?: boolean
      topup_threshold_cents?: number
      topup_amount_cents?: number
      monthly_cap_cents?: number | null
    }

    const user = await getUserByEmail(email)
    const customerId = user?.data?.stripe_customer_id as string | undefined
    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 })
    }

    // If this is a preferences update (no amount), save to Customer.metadata
    if (body.topup_enabled !== undefined && !body.amount_cents) {
      await stripe.customers.update(customerId, {
        metadata: {
          topup_enabled: String(body.topup_enabled),
          ...(body.topup_threshold_cents !== undefined && {
            topup_threshold_cents: String(body.topup_threshold_cents),
          }),
          ...(body.topup_amount_cents !== undefined && {
            topup_amount_cents: String(body.topup_amount_cents),
          }),
          ...(body.monthly_cap_cents !== undefined && {
            monthly_cap_cents: body.monthly_cap_cents === null ? '' : String(body.monthly_cap_cents),
          }),
        },
      })
      return NextResponse.json({ success: true })
    }

    // Top-up with amount
    const amountCents = body.amount_cents || 500
    const product = body.product || 'bot'

    // Try off-session charge with saved payment method
    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 400 })
    }

    const cust = customer as Stripe.Customer
    let pmId = cust.invoice_settings?.default_payment_method
    if (typeof pmId === 'object' && pmId !== null) pmId = pmId.id

    if (pmId) {
      // Off-session charge + Credit Grant
      try {
        const pi = await stripe.paymentIntents.create({
          amount: amountCents,
          currency: 'usd',
          customer: customerId,
          payment_method: pmId as string,
          off_session: true,
          confirm: true,
          description: `Top-up $${(amountCents / 100).toFixed(2)} — ${product}`,
        })

        if (pi.status === 'succeeded') {
          await stripe.billing.creditGrants.create({
            customer: customerId,
            name: `Top-up $${(amountCents / 100).toFixed(2)} — ${product}`,
            category: 'paid',
            amount: { type: 'monetary', monetary: { currency: 'usd', value: amountCents } },
            applicability_config: { scope: { price_type: 'metered' } },
          } as Stripe.Billing.CreditGrantCreateParams)

          // Read updated balance
          let newBalance = 0
          try {
            const summary = await stripe.billing.creditBalanceSummary.retrieve({
              customer: customerId,
              filter: { type: 'applicability_scope', applicability_scope: { price_type: 'metered' } },
            } as Stripe.Billing.CreditBalanceSummaryRetrieveParams)
            for (const bal of (summary as unknown as { balances: Array<{ available_balance: { monetary: { value: number } } }> }).balances || []) {
              newBalance += bal.available_balance?.monetary?.value || 0
            }
          } catch { /* ignore */ }

          return NextResponse.json({
            success: true,
            new_balance_cents: newBalance,
            new_balance_usd: `$${(newBalance / 100).toFixed(2)}`,
          })
        }
      } catch (err) {
        // Off-session failed (card declined, auth required) — fall through to checkout
        console.log('[TOPUP] Off-session charge failed, falling back to checkout:', err)
      }
    }

    // No saved card or off-session failed — create checkout session
    const origin = request.headers.get('origin') || request.nextUrl.origin
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: amountCents,
          product_data: {
            name: `Top-up $${(amountCents / 100).toFixed(2)} — ${product === 'tx' ? 'Transcription' : 'Bot Service'}`,
          },
        },
        quantity: 1,
      }],
      success_url: `${origin}/account?topup=success`,
      cancel_url: `${origin}/account`,
      metadata: {
        userEmail: email,
        topup_product: product,
        topup_amount_cents: String(amountCents),
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('[TOPUP] Error:', error)
    const message = error instanceof Error ? error.message : 'Top-up failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
