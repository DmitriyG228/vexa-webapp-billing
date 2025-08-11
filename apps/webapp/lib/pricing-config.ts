export interface PricingTier {
  name: string
  min_bots: number
  max_bots: number
  discount: number
  description: string
}

export interface BaseCosts {
  min_per_bot: number
  max_per_bot: number
  floor_price: number
}

export interface PricingSliderConfig {
  min_bots: number
  max_bots: number
  tiers: PricingTier[]
  base_costs: BaseCosts
}

export interface StripePrice {
  nickname: string
  currency: string
  recurring: {
    interval: string
  }
  billing_scheme: string
  tiers_mode: string
  tiers: Array<{
    up_to: number | string
    unit_amount: number
  }>
}

export interface StripeProduct {
  name: string
  type: string
}

export interface PricingConfig {
  product: StripeProduct
  prices: StripePrice[]
  pricing_slider: PricingSliderConfig
}

// Load pricing configuration from the JSON file
export function loadPricingConfig(): PricingConfig {
  // In a Next.js app, we need to fetch this at runtime since it's not a static import
  // This will be called from the component
  return {
    product: {
      name: "Bot subscription",
      type: "service"
    },
    prices: [
      {
        nickname: "Startup",
        currency: "usd",
        recurring: { interval: "month" },
        billing_scheme: "tiered",
        tiers_mode: "graduated",
        tiers: [
          { up_to: 1, unit_amount: 1200 },
          { up_to: 5, unit_amount: 2400 },
          { up_to: 50, unit_amount: 2000 },
          { up_to: 200, unit_amount: 1500 },
          { up_to: "inf", unit_amount: 1000 }
        ]
      }
    ],
    pricing_slider: {
      min_bots: 5,
      max_bots: 1000,
      tiers: [
        {
          name: "startup",
          min_bots: 5,
          max_bots: 29,
          discount: 0.95,
          description: "Perfect for small teams and startups"
        },
        {
          name: "growth",
          min_bots: 30,
          max_bots: 179,
          discount: 0.90,
          description: "Ideal for growing businesses"
        },
        {
          name: "scale",
          min_bots: 180,
          max_bots: 1000,
          discount: 0.85,
          description: "Built for enterprise scale"
        }
      ],
      base_costs: {
        min_per_bot: 10,
        max_per_bot: 24,
        floor_price: 120
      }
    }
  }
}

// Helper function to get pricing tier info
export function getPricingTierInfo(bots: number, config: PricingSliderConfig): PricingTier | null {
  for (const tier of config.tiers) {
    if (bots >= tier.min_bots && bots <= tier.max_bots) {
      return tier
    }
  }
  return null
}

// Helper function to calculate price based on bot count and configuration
export function calculatePrice(bots: number, config: PricingSliderConfig): number {
  const { base_costs } = config
  
  // Per-bot cost decreases with volume: starts at max_per_bot, approaches min_per_bot
  // Using exponential decay: cost = min_per_bot + (max_per_bot - min_per_bot) * e^(-bots/100)
  const perBotCost = base_costs.min_per_bot + 
    (base_costs.max_per_bot - base_costs.min_per_bot) * Math.exp(-bots / 100)
  
  // Base price calculation
  let basePrice = Math.round(bots * Math.max(base_costs.min_per_bot, perBotCost))
  
  // Apply floor price
  basePrice = Math.max(base_costs.floor_price, basePrice)
  
  // Apply tier discounts
  const tier = getPricingTierInfo(bots, config)
  if (tier) {
    basePrice = Math.round(basePrice * tier.discount)
  }
  
  // Ensure floor is maintained after discounts
  return Math.max(base_costs.floor_price, Math.max(bots * base_costs.min_per_bot, basePrice))
}
