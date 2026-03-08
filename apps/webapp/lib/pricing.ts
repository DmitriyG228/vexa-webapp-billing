/**
 * Frontend pricing utilities for the new usage-based pricing model
 */

export interface ProductCta {
  text: string
  href?: string
  plan_type?: string
}

export interface ProductComparison {
  vexa: string
  competitor: string
  savings: string
}

export interface PricingProduct {
  id: string
  name: string
  type: 'free' | 'subscription' | 'metered' | 'metered_addon' | 'one_time' | 'custom'
  tagline: string
  price_display: string
  price_unit?: string
  price_cents?: number
  price_cents_per_hour?: number
  price_per_min_cents?: number
  currency?: string
  interval?: string
  featured?: boolean
  features?: string[]
  cta?: ProductCta
  comparison?: ProductComparison
  parent?: string
}

export interface PricingConfig {
  products: PricingProduct[]
}

import pricingConfig from '@pricing_tiers.json'

export function loadPricingConfig(): PricingConfig {
  return pricingConfig as unknown as PricingConfig
}

export function getProduct(id: string): PricingProduct | undefined {
  const config = loadPricingConfig()
  return config.products.find(p => p.id === id)
}

export function getMainProducts(): PricingProduct[] {
  const config = loadPricingConfig()
  return config.products.filter(p =>
    ['free', 'subscription', 'custom'].includes(p.type) ||
    (p.type === 'metered' && p.id === 'bot_service')
  )
}

export function getAddons(): PricingProduct[] {
  const config = loadPricingConfig()
  return config.products.filter(p =>
    p.type === 'metered_addon' ||
    p.id === 'transcription_api' ||
    p.id === 'consultation'
  )
}

export function formatPrice(priceCents: number, currency: string = 'USD'): string {
  const dollars = priceCents / 100
  return `$${dollars.toFixed(2)}`
}
