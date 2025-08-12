'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle2, Info } from 'lucide-react'
import { GetStartedButton } from './GetStartedButton'
import {
  loadPricingConfig,
  calculatePriceForUsers,
  formatPrice,
  type PricingConfig,
} from '@/lib/pricing'

const BOT_MARKS = [1, 3, 5, 10, 20, 50, 100, 200]
const DISPLAY_STARTS_AT_USD = 12
const DEFAULT_MIN_BOTS = 1
const DEFAULT_MAX_BOTS = 200
const SLIDER_RESOLUTION = 1000 // higher resolution to preserve integer coverage in exp mapping

function botsFromSlider(position: number, min: number, max: number): number {
  const t = Math.max(0, Math.min(position, SLIDER_RESOLUTION)) / SLIDER_RESOLUTION
  const bots = Math.round(Math.exp(Math.log(min) + t * Math.log(max / min)))
  return Math.max(min, Math.min(bots, max))
}

function sliderFromBots(bots: number, min: number, max: number): number {
  const clamped = Math.max(min, Math.min(bots, max))
  const t = (Math.log(clamped) - Math.log(min)) / Math.log(max / min)
  return Math.round(t * SLIDER_RESOLUTION)
}

export function ConcurrencyPricingCard() {
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null)
  const [minBots, setMinBots] = useState<number>(DEFAULT_MIN_BOTS)
  const [maxBots, setMaxBots] = useState<number>(DEFAULT_MAX_BOTS)
  const [bots, setBots] = useState<number>(DEFAULT_MIN_BOTS)
  const [sliderPos, setSliderPos] = useState<number>(sliderFromBots(DEFAULT_MIN_BOTS, DEFAULT_MIN_BOTS, DEFAULT_MAX_BOTS))

  // Load pricing configuration once
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const cfg = await loadPricingConfig()
        if (!isMounted) return
        setPricingConfig(cfg)
        // Override to allow 1–200 bots selection regardless of slider defaults
        const cfgMin = 1
        const cfgMax = 200
        setMinBots(cfgMin)
        setMaxBots(cfgMax)
        const initial = Math.min(Math.max(cfg.pricing_slider.default_value || cfgMin, cfgMin), cfgMax)
        setBots(initial)
        setSliderPos(sliderFromBots(initial, cfgMin, cfgMax))
      } catch (e) {
        console.error('Failed to load pricing config', e)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  // Calculate tiered price (cents) and format
  const totalCents = useMemo(() => {
    if (!pricingConfig) return 0
    const tiers = pricingConfig.prices[0].tiers
    return calculatePriceForUsers(bots, tiers)
  }, [pricingConfig, bots])

  const currency = pricingConfig?.prices[0].currency || 'USD'
  const totalFormatted = useMemo(() => formatPrice(totalCents, currency), [totalCents, currency])
  const avgPerBotCents = useMemo(() => (bots > 0 ? Math.round(totalCents / bots) : 0), [totalCents, bots])
  const avgPerBotFormatted = useMemo(() => formatPrice(avgPerBotCents, currency), [avgPerBotCents, currency])
  const perBotDisplay = useMemo(() => (bots > 0 ? `${avgPerBotFormatted} per bot` : ''), [avgPerBotFormatted, bots])
  const thumbLeftPercent = useMemo(() => (sliderPos / SLIDER_RESOLUTION) * 100, [sliderPos])

  const formatBotsLabel = (n: number) => `${n} ${n === 1 ? 'bot' : 'bots'}`

  return (
    <Card className="relative h-full rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">

      <CardHeader className="relative flex-shrink-0 gap-2 p-6">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Simple concurrency pricing
          </span>
        </CardTitle>
        <div className="flex items-end gap-2">
          <span className="text-[44px] leading-[52px] font-semibold tabular-nums">{avgPerBotFormatted}</span>
          <span className="text-muted-foreground">/mo per bot</span>
        </div>
        <div className="text-sm text-muted-foreground">Total: <span className="font-mono tabular-nums font-semibold">{totalFormatted}</span>/mo</div>
        <p className="text-base leading-6 text-muted-foreground">Bots = concurrent meetings. Minutes & meetings are unlimited.</p>
      </CardHeader>

      <CardContent className="relative flex-1 flex flex-col justify-between space-y-5 p-6 pt-0">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm font-medium">
                Bots
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex items-center text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-sm">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Concurrency. 3 bots = 3 meetings at once.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-right text-base" aria-live="polite">
                <span className="text-muted-foreground">Live total</span>{' '}
                <span className="font-mono tabular-nums font-semibold">{totalFormatted}/mo</span>
              </div>
            </div>
            <div className="relative">
              <Slider
                value={[sliderPos]}
                onValueChange={(v) => {
                  const pos = v[0]
                  setSliderPos(pos)
                  setBots(botsFromSlider(pos, minBots, maxBots))
                }}
                min={0}
                max={SLIDER_RESOLUTION}
                step={1}
                className="w-full [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-primary [&_.bg-primary]:to-primary/80"
              />
              <div
                className="pointer-events-none absolute -top-10 -translate-x-1/2 text-[11px] px-2 py-0.5 rounded-md border bg-muted text-foreground shadow-sm"
                style={{ left: `${thumbLeftPercent}%` }}
                aria-hidden
              >
                {formatBotsLabel(bots)}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>{minBots}</span>
              <span>{maxBots}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Quick picks:</span>
              {BOT_MARKS.filter((n) => n >= minBots && n <= maxBots).map((n) => (
                <Button
                  key={n}
                  size="sm"
                  variant={bots === n ? 'default' : 'outline'}
                  className={`h-7 px-2 text-xs ${bots === n ? '' : 'border-primary/30'}`}
                  onClick={() => {
                    setBots(n)
                    setSliderPos(sliderFromBots(n, minBots, maxBots))
                  }}
                  aria-label={`Quick pick ${formatBotsLabel(n)}`}
                >
                  {n}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">Change bots anytime—prorates instantly; reductions become credit.</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold">Includes</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm">Join up to <span className="font-semibold">{bots} simultaneous meetings</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm"><span className="font-semibold">Unlimited</span> transcription & real-time translation (100+ languages)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm">Regions: <span className="font-semibold">EU/US/APAC</span>, 7-day rolling storage (configurable)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm">Community support & Discord</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 p-6">
        <GetStartedButton buttonText="Start from $12" planType="mvp" botCount={bots} />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Card required.</span> Change bot count anytime—prorates instantly; reductions become credit.
        </p>
      </CardFooter>
    </Card>
  )
}


