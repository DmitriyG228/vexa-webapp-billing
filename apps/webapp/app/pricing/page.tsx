import { Metadata } from 'next'
import { PricingSection } from '@/components/landing/pricing-section'

export const metadata: Metadata = {
  title: 'Pricing | Vexa — Meeting Intelligence API',
  description: 'From open source to enterprise scale. Self-host for free, or let us run it for you. Pay only for what you use.',
  alternates: {
    canonical: 'https://vexa.ai/pricing',
  },
  openGraph: {
    title: 'Vexa Pricing — Meeting Intelligence API',
    description: 'Open source free forever. Individual $12/mo. Startup from $150/mo. Enterprise custom.',
    url: 'https://vexa.ai/pricing',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vexa Pricing — Meeting Intelligence API',
    description: 'From open source to enterprise. Self-host free or use our managed cloud.',
  },
}

export default function PricingPage() {
  return (
    <div className="pt-8">
      <PricingSection />
    </div>
  )
}
