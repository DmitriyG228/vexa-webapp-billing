import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getStripe, getUserByEmail } from '@/lib/stripe-billing'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const stripe = getStripe()
    const email = session.user.email

    const user = await getUserByEmail(email)
    const customerId = user?.data?.stripe_customer_id as string | undefined
    if (!customerId) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
    }

    // Find the subscription that is set to cancel at period end
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10,
    })

    const cancelingSub = subs.data.find(s => s.cancel_at_period_end)
    if (!cancelingSub) {
      return NextResponse.json({ error: 'No subscription pending cancellation' }, { status: 404 })
    }

    // Un-cancel: set cancel_at_period_end back to false
    const updated = await stripe.subscriptions.update(cancelingSub.id, {
      cancel_at_period_end: false,
    })

    return NextResponse.json({
      success: true,
      subscription_id: updated.id,
      status: updated.status,
      cancel_at_period_end: updated.cancel_at_period_end,
    })
  } catch (error) {
    console.error('[REACTIVATE] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to reactivate subscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
