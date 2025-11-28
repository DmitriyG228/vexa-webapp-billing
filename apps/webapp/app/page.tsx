'use client';

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Bot, FileAudio, Zap, Server, Globe, RefreshCw, CheckCircle2, Clock, Video, Lock, Plus, Layers, Key } from "lucide-react"
import { MCP, N8n, Claude, Github } from '@lobehub/icons';
import { Button } from "@/components/ui/button"
import { SplitFeature, Placeholder, CodePane } from "@/components/ui/split-feature"
import { YouTubeEmbed } from "@/components/ui/youtube-embed"
import { trackEvent } from '@/lib/analytics'
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { useEffect, useState } from "react";
import Hero from "@/components/sections/hero";
import Features from "@/components/sections/features";
import { VexaOptions } from "@/components/ui/vexa-options";

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
    <div className="relative min-h-screen bg-gradient-to-b from-slate-100 via-gray-50 to-background dark:from-slate-900 dark:via-slate-950 dark:to-background">
      {/* Launch-UI inspired background layers with subtle motion */}
      <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden">
        {/* Radial glow effects - much more visible */}
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-gradient-radial from-primary/25 via-primary/15 to-transparent rounded-full blur-3xl animate-slow-pulse" />
        <div className="absolute top-[60%] right-[15%] w-[500px] h-[500px] bg-gradient-radial from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-slow-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[20%] left-[50%] w-[400px] h-[400px] bg-gradient-radial from-primary/18 via-primary/9 to-transparent rounded-full blur-2xl animate-slow-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Subtle grid pattern - more visible */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] animate-drift"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)/0.12) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)/0.12) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }}
        />
        
        {/* Floating dots pattern */}
        <div 
          className="absolute inset-0 opacity-[0.008] dark:opacity-[0.015] animate-drift"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)/0.12) 1px, transparent 0)`,
            backgroundSize: '64px 64px',
            animation: 'float 25s ease-in-out infinite'
          }}
        />
        
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.005] dark:opacity-[0.01]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }} 
        />
      </div>
      
      {/* Strategic glow orbs for depth and focus - highly visible */}
      <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[25%] w-[500px] h-[500px] bg-gradient-radial from-primary/22 via-primary/12 to-transparent rounded-full blur-3xl animate-slow-pulse" />
        <div className="absolute top-[70%] right-[20%] w-[450px] h-[450px] bg-gradient-radial from-primary/18 via-primary/9 to-transparent rounded-full blur-3xl animate-slow-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[25%] left-[45%] w-[350px] h-[350px] bg-gradient-radial from-primary/15 via-primary/8 to-transparent rounded-full blur-2xl animate-slow-pulse" style={{ animationDelay: '6s' }} />
      </div>
      
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
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm p-8 sm:p-12 overflow-hidden">
            <div className="grid items-stretch gap-8 sm:gap-12 min-h-[400px] lg:grid-cols-2">
              {/* Video - Full left side */}
              <div className="relative flex flex-col justify-center h-full min-w-0 lg:order-1">
                <div className="pointer-events-none absolute inset-x-0 sm:-inset-x-8 -top-10 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl opacity-60 sm:opacity-70" />
                <div className="relative rounded-2xl w-full">
                  <YouTubeEmbed 
                    videoId="Gv-GVrIr_y8" 
                    title="Vexa MCP Integration Demo" 
                  />
                </div>
              </div>

              {/* Text content */}
              <div className="flex flex-col justify-center min-w-0 lg:order-2">
                <p className="uppercase tracking-wider text-xs text-muted-foreground">MCP-ready</p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-balance">
                  MCP server included
                </h2>
                <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">
                  Use MCP so agents can start/stop meeting bots and fetch or stream transcripts on demand.
                  Works alongside your existing agent stack.
                </p>

                {/* bullets */}
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span>
                      <span className="font-medium text-foreground">Send bots</span>{" "}
                      <span className="text-muted-foreground">via MCP tool calls</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span>
                      <span className="font-medium text-foreground">Stream or fetch transcripts</span>{" "}
                      <span className="text-muted-foreground">as needed</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span>
                      <span className="font-medium text-foreground">Claude Desktop today</span>{" "}
                      <span className="text-muted-foreground">and other MCP-capable tools</span>
                    </span>
                  </li>
                </ul>

                {/* CTAs */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href="/blog/claude-desktop-vexa-mcp-google-meet-transcripts"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    MCP Guide
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/blog/claude-desktop-vexa-mcp-google-meet-transcripts#example"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-medium text-foreground ring-1 ring-border hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ml-auto"
                  >
                    Example Config
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>






      {/* Use & Hack Vexa - Promos */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-3 mb-16 md:mb-20 lg:mb-24">
            {/* n8n Card */}
            <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="text-center space-y-4 flex-1">
                <div className="flex justify-center">
                  <N8n size={50} />
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">Google Meet → N8N</h4>
                  <p className="text-sm text-muted-foreground">Meeting transcripts in n8n flow</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Image src="/google-meet-logo.png" alt="Google Meet video conferencing platform logo" width={28} height={28} className="object-contain" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Image src="/logodark.svg" alt="Vexa meeting transcription API logo" width={28} height={28} className="object-contain" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <N8n.Color size={28} />
                </div>
              </div>
              <div className="flex justify-center mt-auto pt-4">
                <Link href="/blog/google-meet-transcription-n8n-workflow" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <span>Explore N8N nodes</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* MCP Card */}
            <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="text-center space-y-4 flex-1">
                <div className="flex justify-center">
                  <MCP size={50} />
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">Google Meet → MCP</h4>
                  <p className="text-sm text-muted-foreground">Claude is now your real-time meeting assistant</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Image src="/google-meet-logo.png" alt="Google Meet video conferencing platform logo" width={28} height={28} className="object-contain" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Image src="/logodark.svg" alt="Vexa meeting transcription API logo" width={28} height={28} className="object-contain" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <MCP size={28} />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Claude.Color size={28} />
                </div>
              </div>
              <div className="flex justify-center mt-auto pt-4">
                <Link href="/blog/claude-desktop-vexa-mcp-google-meet-transcripts" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <span>Connect Claude to MCP</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* API Card */}
            <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="text-center space-y-4 flex-1">
                <div className="flex justify-center">
                  <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md border bg-background">
                    <Zap className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">Google Meet → API</h4>
                  <p className="text-sm text-muted-foreground">Simply POST bot, then GET transcript</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Image src="/google-meet-logo.png" alt="Google Meet video conferencing platform logo" width={28} height={28} className="object-contain" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Image src="/logodark.svg" alt="Vexa meeting transcription API logo" width={28} height={28} className="object-contain" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Zap className="h-7 w-7" />
                </div>
              </div>
              <div className="flex justify-center mt-auto pt-4">
                <Link href="/get-started" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <span>Test the API</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </section>


    </div>
  )
}

