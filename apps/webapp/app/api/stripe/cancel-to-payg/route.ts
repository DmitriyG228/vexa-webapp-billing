import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

import { getStripe, getUserByEmail } from '@/lib/stripe-billing'

/**
 * Cancel current Individual subscription immediately.
 * Auto-provision will create a PAYG (bot_service) sub on next page load.
 */
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

    // Find active subscription
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 5,
    })

    if (subs.data.length === 0) {
      return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 })
    }

    // Cancel immediately (not at period end) so auto-provision can create PAYG
    const sub = subs.data[0]
    await stripe.subscriptions.cancel(sub.id)

    return NextResponse.json({ success: true, canceled_sub: sub.id })
  } catch (error) {
    console.error('[CANCEL-TO-PAYG] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
