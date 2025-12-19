'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, CreditCard, Mic } from 'lucide-react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const PRICE_PER_MINUTE = 0.0015
const MINIMUM_PURCHASE = 5.00
const QUICK_PICK_AMOUNTS = [5, 10, 20, 50, 100]

export function TranscriptionPricingCard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [purchaseAmount, setPurchaseAmount] = useState<number>(5)
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickPick = (amount: number) => {
    setPurchaseAmount(amount)
  }

  const calculateMinutes = (amount: number) => {
    return Math.round(amount / PRICE_PER_MINUTE)
  }

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      if (!session) {
        // Redirect to transcription page which will handle sign-in
        // The transcription page will prompt sign-in if needed
        signIn('google', { callbackUrl: `/dashboard/transcription?purchase=${purchaseAmount}` })
        return
      }
      // Redirect to transcription dashboard with purchase amount
      router.push(`/dashboard/transcription?purchase=${purchaseAmount}`)
    } catch (error) {
      console.error('Error initiating purchase:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const minutes = calculateMinutes(purchaseAmount)

  return (
    <Card className="relative h-full rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
      <CardHeader className="relative flex-shrink-0 gap-2 p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="font-display bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Transcription Minutes
            </span>
          </CardTitle>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-[44px] leading-[52px] font-display tabular-nums">${PRICE_PER_MINUTE.toFixed(4)}</span>
          <span className="text-muted-foreground">/minute</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Pay-as-you-go • Minimum: ${MINIMUM_PURCHASE.toFixed(2)}
        </div>
        <p className="text-base leading-6 text-muted-foreground">
          Purchase transcription minutes for your meetings. Use as needed, no subscription required.
        </p>
      </CardHeader>

      <CardContent className="relative flex-1 flex flex-col justify-between space-y-5 p-6 pt-0">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Purchase Amount
              </div>
              <div className="text-right text-base" aria-live="polite">
                <span className="text-muted-foreground">≈ </span>
                <span className="font-mono tabular-nums font-display">{minutes.toLocaleString()} min</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Quick picks:</span>
              {QUICK_PICK_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  size="sm"
                  variant={purchaseAmount === amount ? 'default' : 'outline'}
                  className={`h-7 px-2 text-xs ${purchaseAmount === amount ? '' : 'border-primary/30'}`}
                  onClick={() => handleQuickPick(amount)}
                  aria-label={`Quick pick $${amount}`}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Selected: <span className="font-mono font-display">${purchaseAmount.toFixed(2)}</span> ≈ {minutes.toLocaleString()} minutes
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-caption">Includes</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm">High-quality transcription for Google Meet & Microsoft Teams</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm">Real-time transcription with speaker identification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm">No expiration — use minutes when you need them</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm">API access for automation and integrations</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 p-6">
        <Button
          onClick={handlePurchase}
          disabled={isLoading || purchaseAmount < MINIMUM_PURCHASE}
          size="lg"
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Buy {minutes.toLocaleString()} min for ${purchaseAmount.toFixed(2)}
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-caption">Card required.</span> Minutes never expire.
        </p>
      </CardFooter>
    </Card>
  )
}
