'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { CheckCircle2, Zap, Globe, Server } from 'lucide-react'
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
    if (userCount < 10) return null // Only show for larger user counts
    
    const costPerUser = Math.round((price / userCount) * 100) / 100
    return `${userCount} users at ~$${costPerUser}/user/month`
  }
  
  if (isConfigLoading) {
    return (
      <Card className="relative rounded-xl border bg-card shadow-sm transition-all hover:shadow-md flex flex-col">
        <CardContent className="p-6">
          <div className="text-center">Loading pricing...</div>
        </CardContent>
      </Card>
    )
  }
  
  const currentUsers = sliderValue[0]
  const pricingInfo = getPricingInfo(currentUsers)
  const price = calculatePrice(currentUsers)
  const userCalc = getUserCalc(currentUsers, price)
  const perUserCost = Math.round((price / currentUsers) * 100) / 100

  const handleSubscribe = async () => {
    if (!session) {
      signIn('google', { callbackUrl: '/pricing' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Failed to open billing portal')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Error opening portal:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="relative rounded-xl border bg-card shadow-sm transition-all hover:shadow-md flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          {pricingInfo.icon}
          {pricingInfo.name}
        </CardTitle>
        <CardDescription className="min-h-[2.5rem] flex items-center">
          {pricingInfo.description}
        </CardDescription>
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {currentUsers} users
            </div>
            <div className="text-3xl font-bold">
              {formatPrice(price)}
              <span className="text-base font-normal text-muted-foreground">/mo</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              ${perUserCost} per user
            </div>
          </div>
          {userCalc && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm font-medium text-primary text-center">
                {userCalc}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Users</span>
              <Badge variant="secondary">{currentUsers}</Badge>
            </div>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={pricingConfig!.pricing_slider.max_users}
              min={pricingConfig!.pricing_slider.min_users}
              step={pricingConfig!.pricing_slider.step}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{pricingConfig!.pricing_slider.min_users}</span>
              <span>{pricingConfig!.pricing_slider.max_users}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">{currentUsers} users</span>
            </div>
            {pricingInfo.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? 'Opening...' : (session ? 'Manage Subscription' : 'Sign in to Manage')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 