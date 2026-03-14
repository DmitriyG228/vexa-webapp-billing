import { Metadata } from 'next'
import { PricingSection } from '@/components/landing/pricing-section'

export const metadata: Metadata = {
  title: 'Pricing | Vexa — Meeting Bot API',
  description: 'Bot infrastructure from $0.30/hr. Transcription add-on +$0.20/hr. Self-host free, or use our managed cloud. 40% cheaper than Recall.ai.',
  alternates: {
    canonical: 'https://vexa.ai/pricing',
  },
  openGraph: {
    title: 'Vexa Pricing — Meeting Bot API',
    description: 'Open source free forever. Individual $12/mo. Bot Service from $0.30/hr + $0.20/hr transcription. 40% cheaper than alternatives.',
    url: 'https://vexa.ai/pricing',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vexa Pricing — Meeting Bot API',
    description: 'Bot infrastructure from $0.30/hr. Transcription +$0.20/hr. Self-host free or use our managed cloud.',
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
        text: 'Vexa offers four tiers: Open Source (free, self-host), Individual ($12/mo for 1 bot with transcription included), Bot Service ($0.30/hr bot infrastructure + $0.20/hr transcription add-on), and Enterprise (custom pricing). New accounts get $5 free credit — no credit card required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which plan is right for me?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Choose Individual ($12/mo) if you need one bot for personal use — it includes real-time transcription, storage, and the Dashboard. Choose Pay-as-you-go ($0.30/hr) if you need multiple simultaneous bots or want to pay only for what you use — ideal for teams and API integrations. Both plans include Google Meet and Microsoft Teams support. Self-host for free from GitHub if you need full data control.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Vexa cheaper than Recall.ai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Vexa's bot infrastructure costs $0.30/hr vs Recall.ai's approximately $0.50/hr — 40% cheaper. Transcription add-on: Vexa $0.20/hr vs approximately $0.15/hr. Plus, Vexa is open source so you can self-host for free.",
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
      name: 'Does Vexa offer free credit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every new account gets $5 in free bot credit — no credit card required. That covers approximately 16 hours of bot time at $0.30/hr. All features are available including transcription, recording, and full API access.',
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
      <div className="text-center mb-2 px-6">
        <h1 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
          Meeting Bot API Pricing
        </h1>
        <p className="mt-3 text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-xl mx-auto">
          Bot infrastructure from $0.30/hr. Self-host free or use our managed cloud.
        </p>
      </div>
      <PricingSection />
    </div>
  )
}
