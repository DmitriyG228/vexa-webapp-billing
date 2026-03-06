import { Metadata } from 'next'
import { PricingSection } from '@/components/landing/pricing-section'

export const metadata: Metadata = {
  title: 'Pricing | Vexa — Meeting Intelligence API',
  description: 'Usage-based pricing from $0.45/hr. Self-host free, or use our managed cloud. ~37% cheaper than Recall.ai.',
  alternates: {
    canonical: 'https://vexa.ai/pricing',
  },
  openGraph: {
    title: 'Vexa Pricing — Meeting Intelligence API',
    description: 'Open source free forever. Individual $12/mo. Bot Service from $0.45/hr. ~37% cheaper than alternatives.',
    url: 'https://vexa.ai/pricing',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vexa Pricing — Meeting Intelligence API',
    description: 'Usage-based pricing from $0.45/hr. Self-host free or use our managed cloud.',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does Vexa cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vexa offers four tiers: Open Source (free, self-host), Individual ($12/mo for 1 bot), Bot Service ($0.45/hr pay-as-you-go), and Enterprise (custom pricing). All plans include a 1-hour free trial with no credit card required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which plan is right for me?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Choose Individual ($12/mo) if you need one bot for personal use — it includes real-time transcription, storage, and the Dashboard. Choose Pay-as-you-go ($0.45/hr) if you need multiple simultaneous bots or want to pay only for what you use — ideal for teams and API integrations. Both plans include Google Meet and Microsoft Teams support. Self-host for free from GitHub if you need full data control.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Vexa cheaper than Recall.ai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Vexa's full-service Bot Service costs $0.45/hr (bot + real-time transcription) compared to Recall.ai's equivalent at approximately $0.72/hr — that's ~37% cheaper. Plus, Vexa is open source so you can self-host for free.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I self-host Vexa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Vexa is Apache 2.0 licensed and fully self-hostable. Deploy with Docker Compose, Kubernetes, or OpenShift on your own infrastructure with complete data sovereignty.',
      },
    },
    {
      '@type': 'Question',
      name: 'What meeting platforms does Vexa support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vexa supports Google Meet, Microsoft Teams, and Zoom. All platforms use the same API surface — send a bot with one API call regardless of platform.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Vexa offer a free trial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every new account gets 1 hour of free bot time — no credit card required. The trial includes all features: transcription, recording, real-time data, and API access.',
      },
    },
  ],
};

export default function PricingPage() {
  return (
    <div className="pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PricingSection />
    </div>
  )
}
