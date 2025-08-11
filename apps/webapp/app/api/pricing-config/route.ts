import { NextResponse } from 'next/server'
import pricingConfig from '@pricing_tiers.json'

export async function GET() {
  try {
    return NextResponse.json(pricingConfig)
  } catch (error) {
    console.error('Error loading pricing config:', error)
    return NextResponse.json({ error: 'Failed to load pricing configuration' }, { status: 500 })
  }
}
