import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Read the pricing configuration from the config directory
    const configPath = join(process.cwd(), 'config', 'pricing_tiers.json')
    const configData = readFileSync(configPath, 'utf8')
    const config = JSON.parse(configData)
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error loading pricing config:', error)
    
    // No fallback configuration - pricing must be loaded from JSON file
    return NextResponse.json(
      { error: 'Failed to load pricing configuration' },
      { status: 500 }
    )
  }
}
