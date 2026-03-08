import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started | Vexa — Send Your First Meeting Bot in 5 Minutes',
  description: 'Sign up, get an API key, and send a meeting bot to Google Meet, Teams, or Zoom. 1-hour free trial, no credit card required. Start transcribing in 5 minutes.',
  alternates: {
    canonical: 'https://vexa.ai/get-started',
  },
  openGraph: {
    title: 'Get Started with Vexa — Free Meeting Bot Trial',
    description: 'Send a meeting bot in 5 minutes. Real-time transcription for Google Meet, Teams & Zoom. No credit card required.',
    url: 'https://vexa.ai/get-started',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Started with Vexa — Free Meeting Bot Trial',
    description: 'Send a meeting bot in 5 minutes. Real-time transcription for Google Meet, Teams & Zoom. No credit card required.',
  },
}

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
