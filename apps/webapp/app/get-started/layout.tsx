import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started with Vexa - Self-Hosted Transcription in 5 Minutes | Free Trial',
  description: 'Quick start guide for Vexa meeting transcription API. Deploy in 5 minutes with Docker. Free tier available. Step-by-step tutorial for developers.',
  openGraph: {
    title: 'Get Started with Vexa - Self-Hosted Transcription in 5 Minutes',
    description: 'Quick start guide for Vexa meeting transcription API. Deploy in 5 minutes with Docker. Free tier available.',
    url: 'https://vexa.ai/get-started',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Started with Vexa - Self-Hosted Transcription in 5 Minutes',
    description: 'Quick start guide for Vexa meeting transcription API. Deploy in 5 minutes with Docker.',
  },
}

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
