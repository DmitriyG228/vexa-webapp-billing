'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Zap, Globe, Server, Info, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { 
  loadPricingConfig, 
  calculatePriceForUsers, 
  formatPrice, 
  getPricingTierInfo,
  type PricingConfig,
  type PricingTier
} from '@/lib/pricing'

interface PricingTierInfo {
  name: string
  description: string
  features: string[]
  icon: React.ReactNode
}

export function DynamicPricingCard() {
  const [sliderValue, setSliderValue] = useState([1]) // Default to 1 user, will be updated from config
  const [isLoading, setIsLoading] = useState(false)
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null)
  const [isConfigLoading, setIsConfigLoading] = useState(true)
  
  const { data: session } = useSession()
  
  // Load pricing configuration on component mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await loadPricingConfig()
        setPricingConfig(config)
        // Set default slider value from config
        setSliderValue([config.pricing_slider.default_value])
      } catch (error) {
        console.error('Failed to load pricing config:', error)
      } finally {
        setIsConfigLoading(false)
      }
    }
    
    loadConfig()
  }, [])
  
  // Get tier information based on current user count
  const getPricingInfo = (userCount: number): PricingTierInfo => {
    if (!pricingConfig) {
      throw new Error('Pricing configuration not loaded')
    }
    
    const tierInfo = getPricingTierInfo(userCount, pricingConfig.prices[0].tiers)
    if (!tierInfo) {
      throw new Error('No tier information found for user count')
    }
    
    const icons = [<Zap className="h-4 w-4 text-primary" />, <Globe className="h-4 w-4 text-primary" />, <Server className="h-4 w-4 text-primary" />]
    
    return {
      name: tierInfo.tierName,
      description: tierInfo.description,
      features: tierInfo.features,
      icon: icons[tierInfo.tierIndex] || <Zap className="h-4 w-4 text-primary" />
    }
  }
  
  // Calculate price using the tiered pricing configuration
  const calculatePrice = (userCount: number): number => {
    if (!pricingConfig) {
      throw new Error('Pricing configuration not loaded')
    }
    
    return calculatePriceForUsers(userCount, pricingConfig.prices[0].tiers)
  }
  
  // Get user calculation for display
  const getUserCalc = (userCount: number, price: number): string | null => {
    if (userCount < 25) return null // Only show for larger user counts
    
    const costPerUser = Math.round((price / 100 / userCount) * 100 / 3) / 100  // Convert cents to dollars first
    return `~ $${costPerUser}/user`
  }
  
  if (isConfigLoading) {
    return (
      <Card className="relative rounded-2xl border-0 bg-gradient-to-br from-card to-muted/30 shadow-2xl shadow-primary/10 flex flex-col overflow-hidden">
        <CardHeader className="relative flex-shrink-0 pb-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="space-y-3 pt-3">
            <div className="text-center space-y-2">
              <Skeleton className="h-5 w-16 mx-auto" />
              <Skeleton className="h-8 w-24 mx-auto" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative flex-1 p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }
  
  const currentUsers = sliderValue[0]
  const pricingInfo = getPricingInfo(currentUsers)
  const price = calculatePrice(currentUsers)
  const userCalc = getUserCalc(currentUsers, price)
  const perUserCost = Math.round((price / 100 / currentUsers) * 100) / 100 // Convert cents to dollars first, then calculate per-user cost

  const handleSubscribe = async () => {
    if (!session) {
      signIn('google', { callbackUrl: '/pricing' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/resolve-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context: 'pricing', quantity: sliderValue[0] }),
      })

      const data = await response.json()
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Failed to resolve billing URL')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Error resolving billing URL:', error)
      alert('Failed to continue. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="relative h-full rounded-2xl border-0 bg-gradient-to-br from-card to-muted/30 shadow-2xl shadow-primary/10 flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="absolute -top-4 -right-4 h-24 w-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-xl" />
      <Badge className="absolute top-4 right-4 bg-primary/10 text-primary border-primary/20 px-3 py-1">
        Most Popular
      </Badge>
      <CardHeader className="relative flex-shrink-0 pb-2">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            {pricingInfo.icon}
          </div>
          <div>
            <div className="font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {pricingInfo.name}
            </div>
            <div className="text-xs font-normal text-muted-foreground">
              {pricingInfo.description}
            </div>
          </div>
        </CardTitle>
        <div className="space-y-3 pt-3">
          <div className="text-center space-y-1">
            <div className="text-base font-semibold text-primary">
              {currentUsers} bots
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {formatPrice(price)}
              <span className="text-base font-normal text-muted-foreground">/mo</span>
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <span>${perUserCost} per bot</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average cost per concurrent bot at {currentUsers} bot{currentUsers !== 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          {userCalc && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <p className="text-xs font-medium text-primary text-center flex-1">
                  {userCalc}
                </p>
              </div>
              <Progress 
                value={Math.min((currentUsers / (pricingConfig?.pricing_slider.max_users || 50)) * 100, 100)} 
                className="h-1 bg-primary/20"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative flex-1 flex flex-col justify-between space-y-4 p-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold">Scale with confidence</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pricing scales automatically with your usage</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs px-2 py-0.5">
                {currentUsers} users
              </Badge>
            </div>
            <div className="space-y-2">
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                max={pricingConfig!.pricing_slider.max_users}
                min={pricingConfig!.pricing_slider.min_users}
                step={pricingConfig!.pricing_slider.step}
                className="w-full [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-lg [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-primary [&_.bg-primary]:to-primary/80"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>{pricingConfig!.pricing_slider.min_users} users</span>
                <span>{pricingConfig!.pricing_slider.max_users} users</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-xs font-medium">{currentUsers} concurrent bots</span>
            </div>
            {pricingInfo.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-xs">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <Button 
            className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300" 
            size="lg" 
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                Opening...
              </div>
            ) : (
              session ? 'Manage Subscription' : 'Start Free Trial'
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-1">
            No credit card required
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 