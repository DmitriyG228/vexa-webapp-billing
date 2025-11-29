'use client';

import { ArrowRight, Github } from "lucide-react";
import { SplitFeature, CodePane } from "@/components/ui/split-feature"
import { trackEvent } from '@/lib/analytics'
import { useEffect, useState } from "react";
import Hero from "@/components/sections/hero";
import Features from "@/components/sections/features";
import { VexaOptions } from "@/components/ui/vexa-options";
import { LandingBackground, PromoCards, VideoFeature } from "@/components/marketing";
import { mcpVideoFeature } from "@/lib/marketing/content";
import { getDefaultPromoCards } from "@/lib/marketing/get-promo-cards";

export default function LandingPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<'google_meet' | 'teams'>('google_meet');
  const [apiKey, setApiKey] = useState('YOUR_API_KEY');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [parsedData, setParsedData] = useState<{
    platform: string;
    meetingId: string;
    passcode?: string;
  } | null>(null);

  const handleSignupClick = () => {
    // Track signup button click
    trackEvent('signup_button_click', { location: 'home_cta' });
  };

  const handleDiscordClick = () => {
    // Track discord join click
    trackEvent('discord_join_click', { location: 'home_cta' });
  };

  // Track page view manually on component mount instead of using PageViewTracker component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackEvent('page_view', { page: 'home' });
    }
  }, []);

  const parseMeetingUrl = (url: string) => {
    if (!url) return null;

    // Parse Google Meet URL
    const googleMeetMatch = url.match(/meet\.google\.com\/([a-z-]+)/i);
    if (googleMeetMatch) {
      return {
        platform: 'google_meet',
        meetingId: googleMeetMatch[1]
      };
    }

    // Parse Microsoft Teams URL
    const teamsMatch = url.match(/teams\.live\.com\/meet\/(\d+)\?p=([^&]+)/i);
    if (teamsMatch) {
      return {
        platform: 'teams',
        meetingId: teamsMatch[1],
        passcode: teamsMatch[2]
      };
    }

    return null;
  };

  const handleUrlChange = (url: string) => {
    setMeetingUrl(url);
    const parsed = parseMeetingUrl(url);
    setParsedData(parsed);
    if (parsed) {
      setSelectedPlatform(parsed.platform as 'google_meet' | 'teams');
    }
  };

  const getCodeSnippets = () => {
    const platform = parsedData?.platform || selectedPlatform;
    const meetingId = parsedData?.meetingId || (selectedPlatform === 'google_meet' ? 'abc-defg-hij' : '9387167464734');
    const passcode = parsedData?.passcode || 'qxJanYOcdjN4d6UlGa';

    if (platform === 'google_meet') {
      return {
        createBot: `curl -X POST https://api.cloud.vexa.ai/bots \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "platform": "google_meet",
    "native_meeting_id": "${meetingId}"
  }'`,
        getTranscript: `curl -X GET \\
  https://api.cloud.vexa.ai/transcripts/google_meet/${meetingId} \\
  -H "X-API-Key: ${apiKey}"`
      };
    } else {
      return {
        createBot: `curl -X POST https://api.cloud.vexa.ai/bots \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "platform": "teams",
    "native_meeting_id": "${meetingId}",
    "passcode": "${passcode}"
  }'`,
        getTranscript: `curl -X GET \\
  https://api.cloud.vexa.ai/transcripts/teams/${meetingId} \\
  -H "X-API-Key: ${apiKey}"`
      };
    }
  };

  return (
    <LandingBackground>
      {/* Professional Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <Features />

      {/* Vexa Options */}
      <VexaOptions />

      {/* Simplicity */}
      <SplitFeature
        eyebrow="Simple API"
        title="POST bot → GET transcripts. That's it."
        body={
          <>
            Start a bot and stream transcripts with two simple calls. Use WebSockets for sub-second
            latency, or REST if you prefer.
          </>
        }
        primaryCta={{ href: "/get-started#quickstart", label: "Test the API in 5 minutes" }}
        visual={
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setSelectedPlatform('google_meet')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedPlatform === 'google_meet' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Google Meet
              </button>
              <button 
                onClick={() => setSelectedPlatform('teams')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedPlatform === 'teams' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Microsoft Teams
              </button>
            </div>
            <CodePane
              caption="1) Create bot"
              code={getCodeSnippets().createBot}
            />
            <CodePane
              caption="2) Get transcript"
              code={getCodeSnippets().getTranscript}
            />
          </div>
        }
      />


      {/* Enterprise-ready */}
      <SplitFeature
        eyebrow="Enterprise-ready"
        title="Self-host for total control."
        body={
          <>
            If parking years of company conversations on a third-party server is unacceptable, run Vexa
            on your infrastructure. Keep transcripts inside your network, choose your region, and integrate
            with internal systems.
          </>
        }
        bullets={[
          { strong: "Open-source core", rest: "(Apache-2.0)" },
          { strong: "Deploy fast", rest: "with Docker Compose or Nomad" },
          { strong: "Own retention & keys", rest: "logs stay in your infra" },
          { strong: "Regions", rest: "choose where data lives" },
        ]}
        primaryCta={{ href: "https://github.com/Vexa-ai/vexa/blob/main/DEPLOYMENT.md", label: "Start Self-Host Guide" }}
        secondaryCta={{ href: "https://github.com/Vexa-ai/vexa", label: "View on GitHub" }}
        visual={
          <div className="flex flex-col items-center justify-center space-y-6 p-8">
            {/* GitHub Logo */}
            <div className="flex items-center justify-center w-32 h-32 rounded-2xl bg-card border border-border shadow-sm">
              <Github size={64} className="text-foreground" />
            </div>
            
            {/* Apache 2.0 License Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
              <span className="text-sm font-medium text-foreground">Apache 2.0</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">Open Source</span>
            </div>
          </div>
        }
        reverse
      />


      {/* MCP-ready */}
      <VideoFeature {...mcpVideoFeature} />

      {/* Use & Hack Vexa - Promos */}
      <PromoCards cards={getDefaultPromoCards()} />
    </LandingBackground>
  )
}
