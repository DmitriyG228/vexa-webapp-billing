import { Metadata } from 'next';
import Hero from "@/components/sections/hero";
import Features from "@/components/sections/features";
import { SplitFeature } from "@/components/ui/split-feature";
import { LandingBackground, Breadcrumbs } from "@/components/marketing";
import { Github } from "lucide-react";
import { Code, Shield, Globe } from "lucide-react";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export const metadata: Metadata = {
  title: 'Open Source Meeting Transcription API - Apache 2.0 Licensed | Vexa',
  description: 'Open-source meeting transcription API licensed under Apache 2.0. View the code, modify it, deploy it anywhere. Complete transparency, security, and no vendor lock-in.',
  keywords: [
    'open source transcription API',
    'Apache 2.0 transcription',
    'open source meeting transcription',
    'self-hosted transcription',
    'transcription API source code',
    'free transcription API',
  ],
  alternates: {
    canonical: 'https://vexa.ai/open-source',
  },
  openGraph: {
    title: 'Open Source Meeting Transcription API - Apache 2.0 Licensed | Vexa',
    description: 'Open-source meeting transcription API licensed under Apache 2.0. View the code, modify it, deploy it anywhere.',
    url: 'https://vexa.ai/open-source',
    siteName: 'Vexa',
    type: 'website',
    images: [
      {
        url: 'https://vexa.ai/images/og-open-source.png',
        width: 1200,
        height: 630,
        alt: 'Open Source Meeting Transcription API by Vexa',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Open Source Meeting Transcription API - Apache 2.0 Licensed',
    description: 'Open-source meeting transcription API licensed under Apache 2.0. View the code, modify it, deploy it anywhere.',
    images: ['https://vexa.ai/images/og-open-source.png'],
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

export default function OpenSourcePage() {
  return (
    <>
      <PageViewTracker path="/open-source" />
    <LandingBackground>
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Open Source" },
          ]}
        />
      </div>
      <Hero
        title="Open Source Meeting Transcription"
        description="Apache 2.0 licensed transcription API. View the code, modify it, deploy it anywhere."
        badge={false}
        buttons={[
          {
            href: "https://github.com/Vexa-ai/vexa",
            text: "View on GitHub",
            variant: "default",
            icon: <Github className="size-4" />,
          },
          {
            href: "/get-started",
            text: "Try Cloud API",
            variant: "outline",
          },
        ]}
      />

      <Features
        title="Why open source matters for transcription"
        items={[
          {
            title: "Complete transparency",
            description: "See exactly how your audio is processed and transcribed",
            icon: <Code className="size-5 stroke-1" />,
          },
          {
            title: "Security & compliance",
            description: "Audit security implementations and verify compliance",
            icon: <Shield className="size-5 stroke-1" />,
          },
          {
            title: "No vendor lock-in",
            description: "Deploy anywhere, customize features, integrate freely",
            icon: <Globe className="size-5 stroke-1" />,
          },
        ]}
      />

      <SplitFeature
        eyebrow="Apache 2.0 License"
        title="Free to use, modify, and distribute"
        body={
          <>
            Vexa is licensed under Apache 2.0, giving you complete freedom to use it in commercial
            projects, modify the source code, and distribute your changes.
          </>
        }
        bullets={[
          { strong: "Commercial use", rest: "allowed" },
          { strong: "Modification", rest: "allowed" },
          { strong: "Distribution", rest: "allowed" },
          { strong: "Private use", rest: "allowed" },
        ]}
        primaryCta={{ href: "https://github.com/Vexa-ai/vexa", label: "View Source Code" }}
        secondaryCta={{ href: "https://github.com/Vexa-ai/vexa/blob/main/LICENSE", label: "Read License" }}
        visual={
          <div className="flex flex-col items-center justify-center space-y-6 p-8">
            <div className="flex items-center justify-center w-32 h-32 rounded-2xl bg-card border border-border shadow-sm">
              <Github size={64} className="text-foreground" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
              <span className="text-sm font-medium text-foreground">Apache 2.0</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">Open Source</span>
            </div>
          </div>
        }
      />
    </LandingBackground>
    </>
  );
}

