import { HeroSection } from '@/components/landing/hero-section'
import { BentoGrid } from '@/components/landing/bento-grid'
import { AgenticSection } from '@/components/landing/agentic-section'
import { EnterpriseSection } from '@/components/landing/enterprise-section'
import { MeetingBotsSection } from '@/components/landing/meeting-bots-section'
import { OpenSourceSection } from '@/components/landing/open-source-section'
import { UseCaseTabs } from '@/components/landing/use-case-tabs'
import { CodeShowcase } from '@/components/landing/code-showcase'
import { PricingSection } from '@/components/landing/pricing-section'

const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Vexa',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Cloud, Self-hosted (Docker, Kubernetes)',
  description: 'Open-source meeting transcription API for Google Meet, Microsoft Teams, and Zoom. Real-time transcripts via REST API and WebSocket. Apache 2.0 licensed.',
  url: 'https://vexa.ai',
  downloadUrl: 'https://github.com/Vexa-ai/vexa',
  softwareVersion: '0.9',
  license: 'https://www.apache.org/licenses/LICENSE-2.0',
  offers: [
    {
      '@type': 'Offer',
      name: 'Open Source',
      price: '0',
      priceCurrency: 'USD',
      description: 'Self-host for free, Apache 2.0 license',
    },
    {
      '@type': 'Offer',
      name: 'Individual',
      price: '12',
      priceCurrency: 'USD',
      billingIncrement: 'P1M',
      description: '1 concurrent bot, unlimited meetings',
    },
    {
      '@type': 'Offer',
      name: 'Bot Service',
      price: '0.45',
      priceCurrency: 'USD',
      unitText: 'per hour',
      description: 'Pay-as-you-go bot service with transcription',
    },
  ],
  publisher: {
    '@type': 'Organization',
    name: 'Vexa',
    url: 'https://vexa.ai',
    logo: 'https://vexa.ai/logodark.svg',
    sameAs: [
      'https://github.com/Vexa-ai/vexa',
      'https://twitter.com/veaborhq',
    ],
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <HeroSection />
      <BentoGrid />
      <AgenticSection />
      <EnterpriseSection />
      <MeetingBotsSection />
      <OpenSourceSection />
      <UseCaseTabs />
      <CodeShowcase />
      <PricingSection />
    </>
  )
}
