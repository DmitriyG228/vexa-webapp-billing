'use client'

import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'

interface GetStartedButtonProps {
  buttonText?: string
  buttonVariant?: 'default' | 'outline'
  isPopular?: boolean
  isEnterprise?: boolean
  isLoading?: boolean
  planType?: 'mvp' | 'dynamic' | 'enterprise' | 'local' | 'community' | 'nomad' | 'dedicated' | 'individual' | 'bot_service' | 'transcription_api'
  botCount?: number
  totalPrice?: string
  href?: string
  /** Current user's subscription tier (passed from parent if available) */
  currentTier?: string
  /** Current user's subscription status */
  currentStatus?: string
}

export function GetStartedButton({
  buttonText = 'Get Started',
  buttonVariant = 'default',
  isPopular = false,
  isEnterprise = false,
  isLoading = false,
  planType = 'dynamic',
  botCount,
  totalPrice,
  href,
  currentTier,
  currentStatus,
}: GetStartedButtonProps) {
  const { data: session } = useSession()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const autoCheckoutTriggered = useRef(false)

  // Auto-resume checkout after sign-in redirect (read URL params without useSearchParams to avoid Suspense requirement)
  useEffect(() => {
    if (!session || autoCheckoutTriggered.current) return
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const checkoutPlan = params.get('checkout')
    if (checkoutPlan && checkoutPlan === planType) {
      autoCheckoutTriggered.current = true
      handleMvpSubscription()
    }
  }, [session])

  const hasActiveSub = currentStatus &&
    ['active', 'trialing', 'scheduled_to_cancel'].includes(currentStatus)

  const handleMvpSubscription = async () => {
    if (!session) {
      // Encode intended plan in callback URL so we auto-resume after sign-in
      signIn('google', { callbackUrl: `/pricing?checkout=${planType}` })
      return
    }

    // If user already has an active subscription on a DIFFERENT plan,
    // send them to Stripe Portal to switch (not a new checkout)
    if (hasActiveSub && currentTier && currentTier !== planType) {
      setIsSubscribing(true)
      try {
        const resp = await fetch('/api/stripe/create-portal-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error || 'Failed to open billing portal')
        window.location.href = data.url
      } catch (error) {
        console.error('Error opening portal:', error)
        alert('Failed to open billing portal. Please try again.')
      } finally {
        setIsSubscribing(false)
      }
      return
    }

    // If user is on the SAME plan already, also go to portal (manage)
    if (hasActiveSub && currentTier === planType) {
      setIsSubscribing(true)
      try {
        const resp = await fetch('/api/stripe/create-portal-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error || 'Failed to open billing portal')
        window.location.href = data.url
      } catch (error) {
        console.error('Error opening portal:', error)
        alert('Failed to open billing portal. Please try again.')
      } finally {
        setIsSubscribing(false)
      }
      return
    }

    // No active subscription → new checkout
    setIsSubscribing(true)
    try {
      const stripePlanType = planType === 'mvp' ? 'individual' : planType

      const response = await fetch('/api/stripe/resolve-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: 'pricing',
          plan_type: stripePlanType,
          quantity: botCount || 1,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve billing URL')
      }

      if (data.url) window.location.href = data.url
      else throw new Error(data.error || 'Failed to resolve billing URL')
    } catch (error) {
      console.error('Error resolving billing URL:', error)
      alert('Failed to continue. Please try again.')
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleButtonClick = () => {
    if (isEnterprise) {
      if (href) window.location.href = href
      else window.location.href = '/contact-sales'
      return
    }

    if (planType === 'mvp' || planType === 'individual' || planType === 'bot_service' || planType === 'transcription_api') {
      handleMvpSubscription()
      return
    }

    if (!session) {
      signIn('google', { callbackUrl: '/pricing' })
    } else {
      window.location.href = '/dashboard'
    }
  }

  const getButtonText = () => {
    if (isEnterprise) return buttonText || 'Talk to Founder'

    // If user has active sub on THIS plan → "Manage"
    if (hasActiveSub && currentTier === planType) return 'Manage Plan'

    // If user has active sub on DIFFERENT plan → "Switch to this plan"
    if (hasActiveSub && currentTier && currentTier !== planType) return 'Switch Plan'

    if (botCount && totalPrice) {
      const botText = botCount === 1 ? '1 bot' : `${botCount} bots`
      return `Subscribe for ${botText} for ${totalPrice}/mo`
    }

    if (buttonText) return buttonText
    if (!session) return 'Sign in to Get Started'
    return 'Go to Dashboard'
  }

  return (
    <Button
      className={`w-full h-10 text-sm font-semibold transition-all duration-300 ${
        buttonVariant === 'outline'
          ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-lg hover:shadow-xl'
          : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl'
      }`}
      variant={buttonVariant}
      size="lg"
      onClick={handleButtonClick}
      disabled={isLoading || isSubscribing}
    >
      {isSubscribing ? (
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current/30 border-t-current" />
          Loading...
        </div>
      ) : (
        getButtonText()
      )}
    </Button>
  )
}
