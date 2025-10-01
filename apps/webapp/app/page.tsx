'use client';

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Bot, FileAudio, Zap, Server, Globe, RefreshCw, CheckCircle2, Clock, Video, Lock, Plus, Layers, Key } from "lucide-react"
import { MCP, N8n, Claude, Github } from '@lobehub/icons';
import { Button } from "@/components/ui/button"
import { SplitFeature, Placeholder, CodePane } from "@/components/ui/split-feature"
import { trackEvent } from '@/lib/analytics'
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { useEffect } from "react";

export default function LandingPage() {
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

  return (
    <div className="flex flex-col gap-10 py-8">
      {/* Hero Section */}
      <section className="relative">
        <div className="container space-y-6 py-10 md:py-16">
          <div className="mx-auto flex max-w-[46rem] flex-col items-center gap-4 text-center">

            <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.015em] leading-tight">
              Real‑time meeting transcription API
            </h1>
            <div className="flex flex-col items-center gap-2 text-lg md:text-xl font-medium tracking-[-0.01em] text-foreground/90">

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2">
                  <Image src="/microsoft-teams-logo.png" alt="Microsoft Teams" width={24} height={24} className="h-6 w-6 object-contain" />
                  Microsoft Teams
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-2">
                  <Image src="/google-meet-logo.png" alt="Google Meet" width={24} height={24} className="h-6 w-6 object-contain" />
                  Google Meet
                </span>
              </div>
            </div>

            {/* Feature chips intentionally omitted for clarity */}
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link href="/get-started">
                <Button size="lg" className="gap-2">
                  Quick Start
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://github.com/Vexa-ai/vexa" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="ghost" className="gap-2">
                  <Github size={18} />
                  View on GitHub
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>
      
      {/* What's new in v0.6 */}
      <section className="container py-3">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border bg-gradient-to-b from-muted/40 to-background p-6 md:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground animate-pulse">
                NEW
              </span>
            </div>
            <div className="text-center mb-5 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold tracking-tight">What's new in v0.6</h2>
              </div>
              <p className="text-xs text-muted-foreground">1 October 2025</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div className="rounded-lg border bg-card/50 p-4 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Microsoft Teams support (alongside Google Meet)</span>
              </div>
              <div className="rounded-lg border bg-card/50 p-4 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">WebSocket streaming for efficient, sub-second delivery</span>
              </div>
              <div className="rounded-lg border bg-card/50 p-4 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Reliability improvements from real-world usage</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Audience micro-routing */}
      <section className="container py-3">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
            <p className="text-sm text-muted-foreground mb-3">Who are you? →</p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link href="https://github.com/Vexa-ai/vexa/blob/main/DEPLOYMENT.md" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                Enterprise (Self-host)
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/get-started#teams-quickstart" className="text-primary hover:underline font-medium">
                Teams quickstart
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/get-started" className="text-primary hover:underline font-medium">
                SMB (Hosted)
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/blog/google-meet-transcription-n8n-workflow" className="text-primary hover:underline font-medium">
                n8n & Indie
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/contact-sales" className="text-primary hover:underline font-medium">
                Considering Recall.ai?
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enterprise Self-host strip */}
      <section className="container py-3">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Self-host Vexa for full data control</h2>
                  <p className="text-muted-foreground">
                    Open-source core with deployment guides. Run Vexa in your environment and stream transcripts to your internal systems.
                  </p>
                </div>
              </div>
              <Link href="https://github.com/Vexa-ai/vexa/blob/main/DEPLOYMENT.md" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <Button size="lg" className="gap-2">
                  Self-host guide
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Use & Hack Vexa - Promos */}
      <section className="container py-3">
        <div className="mx-auto max-w-5xl">
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
                  <Image src="/google-meet-logo.png" alt="Google Meet" width={28} height={28} className="object-contain" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Image src="/logodark.svg" alt="Vexa" width={28} height={28} className="object-contain" />
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
                  <Image src="/google-meet-logo.png" alt="Google Meet" width={28} height={28} className="object-contain" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Image src="/logodark.svg" alt="Vexa" width={28} height={28} className="object-contain" />
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
                  <Image src="/google-meet-logo.png" alt="Google Meet" width={28} height={28} className="object-contain" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Image src="/logodark.svg" alt="Vexa" width={28} height={28} className="object-contain" />
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
          
          {/* Big Black Button */}
          <div className="text-center mt-0">
            <Link href="/get-started">
              <Button size="lg" className="gap-2 bg-black hover:bg-gray-800 text-white">
                Test the API in under 5 minutes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>




      {/* Features */}
      <section className="container py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all group-hover:bg-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 text-primary">
                  <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-1">Open Source</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Fully open source and community-driven development. Customize, extend, and contribute to the project.
              </p>
              <Link 
                href="https://github.com/Vexa-ai/vexa" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Star us on GitHub
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all group-hover:bg-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-1">Invisible Latency</h3>
              <p className="text-sm text-muted-foreground">
                Real-time transcription with imperceptible delay, keeping your conversations flowing naturally without interruption.
              </p>
            </div>
            
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all group-hover:bg-primary/20">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-1">99 Languages Supported</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive language coverage with high-quality transcription for meetings in virtually any language.
              </p>
            </div>
            
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all group-hover:bg-primary/20">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-1">Real-Time Translation</h3>
              <p className="text-sm text-muted-foreground">
                Seamless translation between any language pair in real-time, breaking down communication barriers instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI needs data - Lead section */}
      <SplitFeature
        eyebrow="Live conversational intelligence"
        title="AI needs data. The faster, the better."
        body={
          <>
            Vexa delivers conversations to your AI as they happen — so your systems can act
            while the meeting is still live.
          </>
        }
        chips={[
          { label: "WebSocket streaming (near-real time)" },
          { label: "REST + webhooks/events" },
          { label: "Meet & Teams" },
          { label: "p50 ~200 ms WS", tone: "dark" },
        ]}
        primaryCta={{ href: "/get-started", label: "Get API Key" }}
        secondaryCta={{ href: "/get-started#quickstart", label: "See Quickstart" }}
        visual={<Placeholder caption="Realtime stream → your AI pipeline" />}
      />

      {/* Agents love APIs */}
      <SplitFeature
        eyebrow="For AI-first companies"
        title="Agents hate UIs. Agents love APIs."
        body={
          <>
            Vexa drops a bot into Meet or Teams and streams transcripts straight into your AI pipelines.
            Use <span className="font-medium text-foreground">WebSocket</span> for sub-second delivery,
            <span className="font-medium text-foreground"> REST</span> when you prefer polling, and
            <span className="font-medium text-foreground"> MCP</span> for direct agent control.
          </>
        }
        chips={[
          { label: "WebSocket (sub-second)" },
          { label: "REST + webhooks" },
          { label: "JS / Python / cURL examples" },
          { label: "p50 ~200 ms WS", tone: "dark" },
        ]}
        primaryCta={{ href: "/get-started", label: "Get API Key" }}
        secondaryCta={{ href: "/get-started#quickstart", label: "See Quickstart" }}
        reverse
        visual={
          <CodePane
            caption="Minimal WS client showing partial/final messages"
            code={`const ws = new WebSocket("wss://<HOST>/ws/transcripts?bot_id=<BOT>&token=<TOKEN>");
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data); // {type: "partial"|"final", ts, text}
  console.log(msg.type, msg.text);
};`}
          />
        }
      />

      {/* Simplicity */}
      <SplitFeature
        eyebrow="Simplicity"
        title="POST bot → GET transcripts. That's it."
        body={
          <>
            Start a bot and stream transcripts with two simple calls. Use WebSockets for sub-second
            latency, or REST if you prefer.
          </>
        }
        chips={[{ label: "2 calls, minutes to first transcript", tone: "dark" }]}
        primaryCta={{ href: "/get-started#quickstart", label: "Copy the snippets" }}
        visual={
          <CodePane
            caption="Create bot (Meet or Teams) → stream over WS"
            code={`# 1) Create bot
curl -X POST https://<HOST>/bots \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "platform": "microsoft_teams",  // or "google_meet"
    "meeting_url": "<MEETING_URL>",
    "language": "en"
  }'

# 2) Stream transcripts (WebSocket)
wscat -c "wss://<HOST>/ws/transcripts?bot_id=<BOT_ID>&token=<TOKEN>"`}
          />
        }
      />

      {/* MCP-ready */}
      <SplitFeature
        eyebrow="MCP-ready"
        title="Claude Desktop integration (and other MCP-capable agents)"
        body={
          <>
            Use our MCP server so agents can start/stop meeting bots and fetch or stream transcripts on demand.
            Works alongside your existing agent stack.
          </>
        }
        bullets={[
          { strong: "Send bots", rest: "via MCP tool calls" },
          { strong: "Stream or fetch transcripts", rest: "as needed" },
          { strong: "Claude Desktop today", rest: "and other MCP-capable tools" },
        ]}
        primaryCta={{ href: "/blog/claude-desktop-vexa-mcp-google-meet-transcripts", label: "MCP Guide" }}
        secondaryCta={{ href: "/blog/claude-desktop-vexa-mcp-google-meet-transcripts#example", label: "Example Config" }}
        reverse
        visual={
          <Placeholder caption="Claude Desktop → MCP tools → Vexa transcripts" />
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
        visual={<Placeholder caption="Self-hosted architecture diagram" />}
      />

      {/* Real-time translation */}
      <SplitFeature
        eyebrow="Multilingual"
        title="Real-time translation, 99+ languages"
        body={
          <>
            Stream conversations in one language and deliver translated transcripts to your apps in near
            real time. Language coverage depends on the chosen model; defaults work out of the box.
          </>
        }
        chips={[{ label: "Live translation" }, { label: "Language auto-detect" }, { label: "Model-dependent coverage" }]}
        primaryCta={{ href: "/get-started#translation", label: "Enable translation" }}
        reverse
        visual={<Placeholder caption="Original → Translated stream preview" />}
      />

      {/* Ship your Otter/Fireflies/Fathom */}
      <SplitFeature
        eyebrow="Build faster"
        title="Ship your Otter / Fireflies / Fathom-like app in days"
        body={
          <>
            Focus on UX and insights; Vexa handles bot creation/management, joining Meet & Teams, and
            real-time transcription. Start on the hosted API and switch to self-host anytime without
            changing your app's contract.
          </>
        }
        chips={[
          { label: "One API for Meet & Teams" },
          { label: "Realtime WS + final transcripts" },
          { label: "Webhooks for lifecycle/status" },
        ]}
        primaryCta={{ href: "/examples", label: "See example app" }}
        visual={<Placeholder caption="Builder view: transcript → summary → action items" />}
      />

      {/* n8n automations */}
      <SplitFeature
        eyebrow="Automations"
        title="n8n + Vexa = information-rich flows"
        body={
          <>
            Trigger flows when people speak, push summaries to Slack/Notion/CRM, and pipe transcripts into
            your RAG stack — no glue code.
          </>
        }
        chips={[{ label: "Importable n8n workflow", tone: "dark" }, { label: "Works with agents" }]}
        primaryCta={{ href: "/blog/google-meet-transcription-n8n-workflow", label: "Import n8n Workflow" }}
        secondaryCta={{ href: "/blog/google-meet-transcription-n8n-workflow#video", label: "Watch Tutorial" }}
        reverse
        visual={<Placeholder caption="n8n flow: Vexa → Summarize → Slack/Notion" />}
      />

      {/* Build your own CI app */}
      <section className="container py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold">Ship your "conversation intelligence" app in days</h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Focus on UX and insights; Vexa handles bot creation/management, joining Meet & Teams, and real-time transcription. 
              Start with the hosted API and <strong>switch to self-host anytime</strong> without changing your app's contract.
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-foreground">One API for Meet & Teams</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-foreground">Realtime WS + final transcripts</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-foreground">Webhooks for lifecycle/status</p>
              </div>
            </div>
            <Link href="/get-started" className="inline-block mt-6">
              <Button size="lg" className="gap-2">
                View Example App
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* n8n automations */}
      <section className="container py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold">n8n + Vexa = information-rich automations</h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Trigger flows when people speak, push summaries to Slack/Notion/CRM, and pipe transcripts into your RAG stack—no extra glue code.
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-foreground">Importable n8n workflow</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-foreground">Step-by-step tutorial</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-foreground">Plays nicely with your agents</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/blog/google-meet-transcription-n8n-workflow">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Import n8n Workflow
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/blog/google-meet-transcription-n8n-workflow#tutorial">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  Watch Tutorial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="container py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Use cases</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">AI needs data. The faster, the better.</h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Vexa delivers conversations to your AI as they happen—so your systems can act while the meeting is still live.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">Sales & Success</p>
                <p className="text-xs text-muted-foreground mt-1">notes, CRM, next steps</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">Recruiting & HR</p>
                <p className="text-xs text-muted-foreground mt-1">structured feedback, ATS updates</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">Engineering dailies</p>
                <p className="text-xs text-muted-foreground mt-1">tickets, changelogs, action items</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">Support/Operations</p>
                <p className="text-xs text-muted-foreground mt-1">incident timelines, handoffs</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">Research & Interviews</p>
                <p className="text-xs text-muted-foreground mt-1">themes, highlights</p>
              </div>
            </div>
            <Link href="/get-started#flows" className="inline-block mt-6">
              <Button size="lg" variant="outline" className="gap-2">
                See Example Flows
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contribute */}
      <section className="container py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold">Contribute and get noticed</h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              We welcome issues and PRs. Build reputation in the open—<strong>we highlight contributors</strong> in release notes and social posts.
            </p>
            <ul className="mt-6 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Good-first-issues labeled</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Maintainers active & responsive</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">OSS-friendly companies and investors watch this repo</span>
              </li>
            </ul>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="https://github.com/Vexa-ai/vexa/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Good First Issues
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://github.com/Vexa-ai/vexa/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  Contributor Guide
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border shadow-lg overflow-hidden">
          <div className="bg-primary p-6 md:p-8 text-primary-foreground">
            <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
              <div className="space-y-3 max-w-lg">
                <h2 className="text-2xl font-bold">Ready to get started?</h2>
                <p className="text-primary-foreground/80">
                  From signup to your first API call in just 5 minutes. Start transcribing meetings today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/api/auth/signin">
                  <Button size="lg" variant="secondary" className="w-full md:w-auto flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      <path fill="none" d="M1 1h22v22H1z" />
                    </svg>
                    Log in with Google
                  </Button>
                </Link>
                <Link 
                  href="https://discord.gg/Ga9duGkVz9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={handleDiscordClick}
                >
                  <Button size="lg" variant="outline" className="w-full md:w-auto border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20">
                    Join Discord
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

