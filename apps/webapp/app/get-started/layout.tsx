import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started | Vexa — Meeting Intelligence API',
  description: 'Send a bot to any Google Meet or Microsoft Teams meeting in seconds. Paste a meeting link and get real-time transcription via API.',
  alternates: {
    canonical: 'https://vexa.ai/get-started',
  },
  openGraph: {
    title: 'Get Started with Vexa',
    description: 'Send a meeting bot in seconds. Paste a Google Meet or Teams link and get real-time transcription.',
    url: 'https://vexa.ai/get-started',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Started with Vexa',
    description: 'Send a meeting bot in seconds. Paste a Google Meet or Teams link and get real-time transcription.',
  },
}

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
