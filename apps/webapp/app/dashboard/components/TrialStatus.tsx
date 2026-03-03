'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CreditCard, Clock } from 'lucide-react'

interface TrialStatusProps {
  subscriptionId?: string
  status?: string
  trialEnd?: string | number
  onAddPaymentMethod?: () => void
}

function parseTimestamp(value?: string | number): number | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'number') {
    return value < 1e12 ? value * 1000 : value
  }
  if (/^\d+$/.test(value)) {
    const num = Number(value)
    return num < 1e12 ? num * 1000 : num
  }
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? null : ms
}

export function TrialStatus({
  subscriptionId,
  status,
  trialEnd,
  onAddPaymentMethod
}: TrialStatusProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [now, setNow] = useState(Date.now())

  // Live countdown — tick every second when < 1 hour, every 30s when < 1 day, every 60s otherwise
  useEffect(() => {
    if (status !== 'trialing') return

    const trialEndMs = parseTimestamp(trialEnd)
    if (!trialEndMs) return

    const getInterval = () => {
      const remaining = trialEndMs - Date.now()
      if (remaining <= 0) return null
      if (remaining <= 60 * 60 * 1000) return 1000        // < 1 hour: every second
      if (remaining <= 24 * 60 * 60 * 1000) return 30000  // < 1 day: every 30s
      return 60000                                          // else: every minute
    }

    let intervalId: ReturnType<typeof setInterval> | null = null

    const startInterval = () => {
      const ms = getInterval()
      if (ms === null) return
      intervalId = setInterval(() => {
        setNow(Date.now())
        // Re-evaluate interval frequency
        const newMs = getInterval()
        if (newMs === null || newMs !== ms) {
          if (intervalId) clearInterval(intervalId)
          if (newMs !== null) startInterval()
        }
      }, ms)
    }

    startInterval()
    return () => { if (intervalId) clearInterval(intervalId) }
  }, [status, trialEnd])

  const handleAddPaymentMethod = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/resolve-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context: 'dashboard' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve billing URL')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error resolving billing URL:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status !== 'trialing') {
    return null
  }

  const trialEndMs = parseTimestamp(trialEnd)
  const timeLeft = trialEndMs ? trialEndMs - now : 0
  const isExpired = timeLeft <= 0
  const isUrgent = !isExpired && timeLeft <= 10 * 60 * 1000    // < 10 minutes
  const isWarning = !isExpired && timeLeft <= 60 * 60 * 1000   // < 1 hour

  // Build countdown string
  const getCountdownText = () => {
    if (isExpired) return 'Trial has ended'
    const totalSeconds = Math.ceil(timeLeft / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (days >= 1) {
      return `${days}d ${hours}h remaining`
    }
    if (hours >= 1) {
      return `${hours}h ${minutes}m remaining`
    }
    if (minutes >= 1) {
      return `${minutes}m ${seconds}s remaining`
    }
    return `${seconds}s remaining`
  }

  // Styling based on urgency
  const borderColor = isExpired || isUrgent
    ? 'border-red-300 dark:border-red-800'
    : isWarning
    ? 'border-amber-300 dark:border-amber-800'
    : 'border-orange-200 dark:border-orange-800'

  const bgColor = isExpired || isUrgent
    ? 'bg-red-50 dark:bg-red-950'
    : isWarning
    ? 'bg-amber-50 dark:bg-amber-950'
    : 'bg-orange-50 dark:bg-orange-950'

  const titleColor = isExpired || isUrgent
    ? 'text-red-800 dark:text-red-200'
    : isWarning
    ? 'text-amber-800 dark:text-amber-200'
    : 'text-orange-800 dark:text-orange-200'

  const textColor = isExpired || isUrgent
    ? 'text-red-700 dark:text-red-300'
    : isWarning
    ? 'text-amber-700 dark:text-amber-300'
    : 'text-orange-700 dark:text-orange-300'

  const buttonColor = isExpired || isUrgent
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-orange-600 hover:bg-orange-700 text-white'

  return (
    <Card className={`${borderColor} ${bgColor} mb-6`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 ${titleColor}`}>
          <AlertTriangle className={`h-5 w-5 ${isUrgent ? 'animate-pulse' : ''}`} />
          {isExpired ? 'Trial Ended' : isUrgent ? 'Trial Ending Now' : 'Trial Period Active'}
        </CardTitle>
        {/* Prominent countdown */}
        <div className={`flex items-center gap-2 mt-2 ${titleColor}`}>
          <Clock className="h-4 w-4" />
          <span className={`text-xl font-bold font-mono tracking-tight ${isUrgent ? 'animate-pulse' : ''}`}>
            {getCountdownText()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className={`text-sm ${textColor}`}>
            {isExpired
              ? 'Your trial has ended. Subscribe to continue using Vexa.'
              : isUrgent
              ? 'Your trial is about to expire! Add a payment method now to avoid service interruption.'
              : 'Add a payment method to continue using Vexa after your trial ends.'}
          </p>
          <Button
            onClick={handleAddPaymentMethod}
            disabled={isLoading}
            className={buttonColor}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isLoading ? 'Processing...' : isExpired ? 'Subscribe Now' : 'Add Payment Method'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
