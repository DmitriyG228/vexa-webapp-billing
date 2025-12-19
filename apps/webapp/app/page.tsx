'use client';

import { ArrowRight, Star } from "lucide-react";
import { CodePane } from "@/components/ui/split-feature"
import { SplitFeature } from "@/components/ui/split-feature"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trackEvent } from '@/lib/analytics'
import { useEffect, useState } from "react";
import Hero from "@/components/sections/hero";
import { LandingBackground } from "@/components/marketing";
import { mcpVideoFeature } from "@/lib/marketing/content";
import { getDefaultPromoCards } from "@/lib/marketing/get-promo-cards";
// Lazy load below-the-fold components to reduce initial bundle size and TBT
import { Features, VexaOptions, PromoCards, VideoFeature } from "@/app/components/LazyComponents";

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
    // Track signup button click with enhanced logging
    console.log('🖱️  [CLICK] Signup button clicked on homepage');
    trackEvent('signup_button_click', { location: 'home_cta' });
  };

  const handleDiscordClick = () => {
    // Track discord join click with enhanced logging
    console.log('🖱️  [CLICK] Discord join link clicked on homepage');
    trackEvent('discord_join_click', { location: 'home_cta' });
  };

  // Track page view using requestIdleCallback to avoid blocking main thread (reduces TBT)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use requestIdleCallback for non-critical analytics to reduce TBT
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          trackEvent('page_view', { page: 'home' });
        }, { timeout: 2000 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
      trackEvent('page_view', { page: 'home' });
        }, 100);
      }
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
            <div className="mb-4">
              <Tabs 
                value={selectedPlatform} 
                onValueChange={(value) => {
                  const platform = value as 'google_meet' | 'teams';
                  console.log(`🖱️  [CLICK] Platform selector: ${platform === 'google_meet' ? 'Google Meet' : 'Microsoft Teams'}`);
                  setSelectedPlatform(platform);
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="google_meet">Google Meet</TabsTrigger>
                  <TabsTrigger value="teams">Microsoft Teams</TabsTrigger>
                </TabsList>
              </Tabs>
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
          <div className="w-full rounded-xl border bg-gradient-to-br from-muted/30 to-card p-8" style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground)/0.03) 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}>
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Open Source & Community Driven</h3>
                <div className="flex items-center justify-center gap-8">
                  <svg className="h-12 w-12 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-current text-foreground" />
                      <div className="flex flex-col items-start">
                        <span className="text-2xl font-bold text-foreground leading-none">1.5k</span>
                        <span className="text-xs text-muted-foreground">Stars</span>
                      </div>
                    </div>
                    <div className="h-12 w-px bg-border"></div>
                    <div className="flex flex-col items-start">
                      <span className="text-2xl font-bold text-foreground leading-none">150+</span>
                      <span className="text-xs text-muted-foreground">Forks</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <span className="text-sm font-medium text-foreground">Apache 2.0</span>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Open Source</span>
              </div>
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
