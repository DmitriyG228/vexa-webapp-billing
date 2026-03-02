import { Metadata } from 'next'
import { PricingSection } from '@/components/landing/pricing-section'

export const metadata: Metadata = {
  title: 'Pricing | Vexa — Meeting Intelligence API',
  description: 'Usage-based pricing from $0.45/hr. Self-host free, or use our managed cloud. 30% cheaper than Recall.ai.',
  alternates: {
    canonical: 'https://vexa.ai/pricing',
  },
  openGraph: {
    title: 'Vexa Pricing — Meeting Intelligence API',
    description: 'Open source free forever. Individual $12/mo. Bot Service from $0.45/hr. 30% cheaper than alternatives.',
    url: 'https://vexa.ai/pricing',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vexa Pricing — Meeting Intelligence API',
    description: 'Usage-based pricing from $0.45/hr. Self-host free or use our managed cloud.',
  },
}

export default function PricingPage() {
  return (
    <div className="pt-8">
      <PricingSection />
    </div>
  )
}
