/**
 * Frontend pricing utilities for the pricing slider
 * Uses the same pricing configuration as the backend
 */

export interface PricingTier {
  up_to: number | 'inf'
  unit_amount: number
}

export interface PricingConfig {
  product: {
    name: string
    type: string
  }
  prices: Array<{
    nickname: string
    currency: string
    recurring: {
      interval: string
    }
    billing_scheme: string
    tiers_mode: string
    tiers: PricingTier[]
  }>
  pricing_slider: {
    min_users: number
    max_users: number
    step: number
    default_value: number
    currency: string
    display_format: string
  }
}

// Load pricing configuration from the API endpoint
export async function loadPricingConfig(): Promise<PricingConfig> {
  try {
    const response = await fetch('/api/pricing-config')
    if (!response.ok) {
      throw new Error(`Failed to load pricing config: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading pricing config:', error)
    // Fallback to default configuration if loading fails
    return getDefaultPricingConfig()
  }
}

// No fallback configuration - pricing must be loaded from JSON file
function getDefaultPricingConfig(): PricingConfig {
  throw new Error('Pricing configuration must be loaded from pricing_tiers.json')
}

/**
 * Calculate the total price for a given number of users using tiered pricing
 * @param userCount Number of users
 * @param tiers Pricing tiers configuration
 * @returns Total price in cents
 */
export function calculatePriceForUsers(userCount: number, tiers: PricingTier[]): number {
  if (userCount <= 0) return 0
  
  let totalPrice = 0
  let remainingUsers = userCount
  
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i]
    const upTo = tier.up_to
    const unitAmount = tier.unit_amount
    
    if (upTo === 'inf') {
      // Last tier - charge for all remaining users
      totalPrice += remainingUsers * unitAmount
      break
    } else {
      // Calculate how many users fall into this tier
      const previousUpTo = i > 0 ? (typeof tiers[i - 1].up_to === 'number' ? tiers[i - 1].up_to : 0) : 0
      const tierUsers = Math.min(remainingUsers, (upTo as number) - previousUpTo)
      
      if (tierUsers > 0) {
        totalPrice += tierUsers * unitAmount
        remainingUsers -= tierUsers
      }
      
      if (remainingUsers <= 0) break
    }
  }
  
  return totalPrice
}

/**
 * Get detailed breakdown of pricing for a given number of users
 * @param userCount Number of users
 * @param tiers Pricing tiers configuration
 * @returns List of pricing breakdowns per tier
 */
export function getPricingBreakdown(userCount: number, tiers: PricingTier[]) {
  if (userCount <= 0) return []
  
  const breakdown: Array<{
    tierRange: string
    usersInTier: number
    pricePerUser: number
    totalForTier: number
  }> = []
  
  let remainingUsers = userCount
  
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i]
    const upTo = tier.up_to
    const unitAmount = tier.unit_amount
    
    if (upTo === 'inf') {
      // Last tier
      if (remainingUsers > 0) {
        const previousUpTo = i > 0 ? (typeof tiers[i - 1].up_to === 'number' ? tiers[i - 1].up_to : 0) : 0
        breakdown.push({
          tierRange: `${previousUpTo + 1}+ users`,
          usersInTier: remainingUsers,
          pricePerUser: unitAmount / 100, // Convert cents to dollars
          totalForTier: (remainingUsers * unitAmount) / 100
        })
      }
      break
    } else {
      // Calculate users in this tier
      const previousUpTo = i > 0 ? (typeof tiers[i - 1].up_to === 'number' ? tiers[i - 1].up_to : 0) : 0
      const tierStart = previousUpTo + 1
      const tierUsers = Math.min(remainingUsers, upTo - tierStart + 1)
      
      if (tierUsers > 0) {
        breakdown.push({
          tierRange: `${tierStart}-${upTo} users`,
          usersInTier: tierUsers,
          pricePerUser: unitAmount / 100,
          totalForTier: (tierUsers * unitAmount) / 100
        })
        remainingUsers -= tierUsers
      }
      
      if (remainingUsers <= 0) break
    }
  }
  
  return breakdown
}

/**
 * Format price from cents to human-readable format
 * @param priceCents Price in cents
 * @param currency Currency code
 * @returns Formatted price string
 */
export function formatPrice(priceCents: number, currency: string = "USD"): string {
  const dollars = priceCents / 100
  return `$${dollars.toFixed(2)}`
}

/**
 * Get pricing tier information for a given number of users
 * @param userCount Number of users
 * @param tiers Pricing tiers configuration
 * @returns Tier information object
 */
export function getPricingTierInfo(userCount: number, tiers: PricingTier[]) {
  if (userCount <= 0) return null
  
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i]
    if (tier.up_to === 'inf' || userCount <= tier.up_to) {
      return {
        tierIndex: i,
        tierName: getTierName(i),
        description: getTierDescription(i),
        features: getTierFeatures(i)
      }
    }
  }
  
  return null
}

// Helper functions for tier information
function getTierName(tierIndex: number): string {
  const names = ['Startup', 'Growth', 'Scale', 'Enterprise', 'Enterprise+']
  return names[tierIndex] || `Tier ${tierIndex + 1}`
}

function getTierDescription(tierIndex: number): string {
  const descriptions = [
    'For early products and internal products for small teams',
    'For medium-sized companies and growing conversation-AI vendors',
    'For mid-market tooling platforms',
    'For large enterprises and regulated workloads',
    'For ultra-scale deployments'
  ]
  return descriptions[tierIndex] || 'Professional tier'
}

function getTierFeatures(tierIndex: number): string[] {
  const baseFeatures = ['Unlimited transcription volume']
  
  const tierFeatures = [
    ['Community Slack support'],
    ['1 h solutions consult / month'],
    ['24 × 5 e-mail + Slack support', '4 h P1 SLA, quarterly review'],
    ['24 × 7 support', '1 h P1 SLA, monthly review'],
    ['Dedicated support team', 'Custom SLA, weekly review']
  ]
  
  return [...baseFeatures, ...(tierFeatures[tierIndex] || [])]
}
