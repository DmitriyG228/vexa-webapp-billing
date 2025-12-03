import { Metadata } from 'next';
import Hero from "@/components/sections/hero";
import Features from "@/components/sections/features";
import { VexaOptions } from "@/components/ui/vexa-options";
import { SplitFeature, CodePane } from "@/components/ui/split-feature";
import { LandingBackground, DefaultPromoCards, VideoFeature, Breadcrumbs } from "@/components/marketing";
import { mcpVideoFeature } from "@/lib/marketing/content";
import { Bot, Zap, Server } from "lucide-react";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export const metadata: Metadata = {
  title: 'Microsoft Teams Transcription API - Self-Hosted Real-Time Transcription | Vexa',
  description: 'Real-time transcription for Microsoft Teams meetings. Self-hosted, privacy-first, and enterprise-ready. Auto-join bots with sub-second latency. Open-source and Apache 2.0 licensed.',
  keywords: [
    'Microsoft Teams transcription',
    'Microsoft Teams transcription API',
    'self-hosted Microsoft Teams transcription',
    'real-time meeting transcription',
    'Microsoft Teams bot',
    'meeting transcription API',
    'Teams transcription',
  ],
  alternates: {
    canonical: 'https://vexa.ai/product/microsoft-teams-transcription-api',
  },
  openGraph: {
    title: 'Microsoft Teams Transcription API - Self-Hosted Real-Time Transcription | Vexa',
    description: 'Real-time transcription for Microsoft Teams meetings. Self-hosted, privacy-first, and enterprise-ready.',
    url: 'https://vexa.ai/product/microsoft-teams-transcription-api',
    siteName: 'Vexa',
    type: 'website',
    images: [
      {
        url: 'https://vexa.ai/images/og-microsoft-teams-transcription.png',
        width: 1200,
        height: 630,
        alt: 'Microsoft Teams Transcription API by Vexa',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Microsoft Teams Transcription API - Self-Hosted Real-Time Transcription',
    description: 'Real-time transcription for Microsoft Teams meetings. Self-hosted, privacy-first, and enterprise-ready.',
    images: ['https://vexa.ai/images/og-microsoft-teams-transcription.png'],
    creator: '@grankin_d',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function MicrosoftTeamsTranscriptionPage() {
  return (
    <>
      <PageViewTracker path="/product/microsoft-teams-transcription-api" />
      <LandingBackground>
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/product/microsoft-teams-transcription-api" },
              { label: "Microsoft Teams Transcription API" },
            ]}
          />
        </div>
        <Hero
          title="Microsoft Teams Transcription API"
          description="Real-time transcription for Microsoft Teams meetings. Self-hosted, privacy-first, and enterprise-ready."
          badge={false}
          buttons={[
            {
              href: "/get-started",
              text: "Get Started",
              variant: "default",
            },
            {
              href: "https://github.com/Vexa-ai/vexa",
              text: "View on GitHub",
              variant: "outline",
            },
          ]}
        />

        <Features
          title="Everything you need for Microsoft Teams transcription"
          items={[
            {
              title: "Auto-join bots",
              description: "Bots automatically join your Microsoft Teams sessions",
              icon: <Bot className="size-5 stroke-1" />,
            },
            {
              title: "Real-time transcription",
              description: "Sub-second latency for live Microsoft Teams transcripts",
              icon: <Zap className="size-5 stroke-1" />,
            },
            {
              title: "Simple API",
              description: "POST bot, then GET transcript for Microsoft Teams",
              icon: <Server className="size-5 stroke-1" />,
            },
          ]}
        />

        <VexaOptions />

        <SplitFeature
          eyebrow="Microsoft Teams Integration"
          title="Start transcribing Microsoft Teams meetings in minutes"
          body={
            <>
              Connect to Microsoft Teams with a simple API call. Our bots join your meetings automatically
              and provide real-time transcription with sub-second latency.
            </>
          }
          primaryCta={{ href: "/get-started#quickstart", label: "Try Microsoft Teams Transcription" }}
          visual={
            <div className="space-y-4">
              <CodePane
                caption="1) Create bot"
                code={`curl -X POST https://api.cloud.vexa.ai/bots \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "platform": "teams",
    "native_meeting_id": "9387167464734",
    "passcode": "qxJanYOcdjN4d6UlGa"
  }'`}
              />
              <CodePane
                caption="2) Get transcript"
                code={`curl -X GET \\
  https://api.cloud.vexa.ai/transcripts/teams/9387167464734 \\
  -H "X-API-Key: YOUR_API_KEY"`}
              />
            </div>
          }
        />

        <VideoFeature {...mcpVideoFeature} />

        <DefaultPromoCards />
      </LandingBackground>
    </>
  );
}

