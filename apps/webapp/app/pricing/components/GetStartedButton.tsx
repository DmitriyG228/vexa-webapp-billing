'use client'

import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface GetStartedButtonProps {
  buttonText?: string
  buttonVariant?: 'default' | 'outline'
  isPopular?: boolean
  isEnterprise?: boolean
  isLoading?: boolean
  planType?: 'mvp' | 'dynamic' | 'enterprise' | 'local' | 'community' | 'nomad' | 'dedicated'
  botCount?: number
  href?: string
}

export function GetStartedButton({
  buttonText = 'Get Started',
  buttonVariant = 'default',
  isPopular = false,
  isEnterprise = false,
  isLoading = false,
  planType = 'dynamic',
  botCount,
  href,
}: GetStartedButtonProps) {
  const { data: session } = useSession()
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleMvpSubscription = async () => {
    if (!session) {
      signIn('google', { callbackUrl: '/pricing' })
      return
    }

    setIsSubscribing(true)
    try {
      // Use customer portal managed by the billing service instead of a checkout route
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      if (data.url) window.location.href = data.url
      else throw new Error(data.error || 'Failed to open billing portal')
    } catch (error) {
      console.error('Error opening billing portal:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleButtonClick = () => {
    if (isEnterprise) {
      // Enterprise buttons: route to scheduling link if provided
      if (href) window.location.href = href
      else window.location.href = '/contact-sales'
      return
    }

    if (planType === 'mvp') {
      handleMvpSubscription()
      return
    }

    if (!session) {
      // If user is not logged in, initiate Google sign-in
      signIn('google', { callbackUrl: '/pricing' })
    } else {
      // If user is logged in, redirect them to the dashboard or a checkout page
      // For a simple "Get Started", redirecting to the dashboard makes sense.
      window.location.href = '/dashboard'
    }
  }

  const getButtonText = () => {
    if (isEnterprise) return buttonText || 'Talk to Founder'
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