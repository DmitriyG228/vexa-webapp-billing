import { Metadata } from "next";
import Hero from "@/components/sections/hero";
import Features from "@/components/sections/features";
import { SplitFeature, CodePane } from "@/components/ui/split-feature";
import { LandingBackground, DefaultPromoCards, Breadcrumbs } from "@/components/marketing";
import {
  Bot,
  Zap,
  Webhook,
  Shield,
  Container,
  DollarSign,
  Server,
  Sparkles,
} from "lucide-react";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export const metadata: Metadata = {
  title: "Vexa Lite — Self-hosted Meeting Bot API (Open Source)",
  description:
    "Open-source, self-hosted meeting bot API to capture transcripts and meeting data from Google Meet & Microsoft Teams. Deploy as one Docker container in minutes. GPU-free option with external transcription, or self-host the transcriber.",
  keywords: [
    "meeting bot api",
    "self-hosted meeting bot",
    "open-source meeting assistant",
    "meeting transcripts api",
    "google meet bot",
    "microsoft teams bot",
    "real-time transcription api",
    "webhooks meeting events",
    "recall.ai alternative",
    "otter alternative self-hosted",
    "fireflies alternative self-hosted",
    "per-seat pricing alternative",
  ],
  alternates: {
    canonical: "https://vexa.ai/product/vexa-lite",
  },
  openGraph: {
    title: "Vexa Lite — Self-hosted Meeting Bot API (Open Source)",
    description:
      "Capture transcripts and meeting data from Meet & Teams behind a simple API. Deploy in minutes as one Docker container. Own your data pipeline.",
    url: "https://vexa.ai/product/vexa-lite",
    siteName: "Vexa",
    type: "website",
    images: [
      {
        url: "https://vexa.ai/images/og-vexa-lite.png",
        width: 1200,
        height: 630,
        alt: "Vexa Lite — Self-hosted Meeting Bot API",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vexa Lite — Self-hosted Meeting Bot API (Open Source)",
    description:
      "Open-source meeting bot API for Meet & Teams. Deploy as one Docker container. GPU-free option or self-host transcription.",
    images: ["https://vexa.ai/images/og-vexa-lite.png"],
    creator: "@grankin_d",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function VexaLitePage() {
  return (
    <>
      <PageViewTracker path="/product/vexa-lite" />
      <LandingBackground>
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/product/vexa-lite" },
              { label: "Vexa Lite" },
            ]}
          />
        </div>

        <Hero
          title="Meeting Transcription API in a Docker container"
          description="Deploy in minutes, then build your own meeting intelligence on top of a simple API."
          badge={false}
          buttons={[
            {
              href: "https://github.com/Vexa-ai/vexa",
              text: "Open-source on GitHub",
              variant: "default",
            },
          ]}
        />

        <Features
          title="Bots • real-time transcription • simple API"
          items={[
            {
              title: "Auto-join bots",
              description: "Bots join meetings automatically — your system captures the raw signal.",
              icon: <Bot className="size-5 stroke-1" />,
            },
            {
              title: "Real-time transcripts",
              description: "Stream live transcript events + fetch artifacts after the call.",
              icon: <Zap className="size-5 stroke-1" />,
            },
            {
              title: "API + webhooks",
              description: "Consume meeting events via webhooks. Query data via API.",
              icon: <Webhook className="size-5 stroke-1" />,
            },
          ]}
        />

        <SplitFeature
          eyebrow="Why Vexa Lite"
          title="Own your meeting-data pipeline"
          body={
            <>
              Meeting data as APIs + events — built for product and platform teams.
            </>
          }
          chips={[
            { label: "Open source", tone: "dark" },
            { label: "Self-hosted" },
            { label: "API + webhooks" },
            { label: "Docker deploy" },
          ]}
          bullets={[
            { strong: "Capture", rest: " — bots join Meet/Teams and collect the raw signal." },
            { strong: "Stream", rest: " — real-time transcript events via webhooks." },
            { strong: "Store", rest: " — keep meeting artifacts in your database." },
            { strong: "Build", rest: " — ship summaries/search/CRM sync on top of stable primitives." },
          ]}
          primaryCta={{ href: "https://github.com/Vexa-ai/vexa", label: "See the repo" }}
          visual={
            <div className="space-y-4">
              <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  What you get
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-3">
                    <Bot className="size-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">Meeting bots</div>
                      <div className="text-sm text-muted-foreground">Reliable capture for Meet + Teams.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Webhook className="size-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">Event stream</div>
                      <div className="text-sm text-muted-foreground">Transcript chunks + lifecycle events.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Server className="size-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">Queryable artifacts</div>
                      <div className="text-sm text-muted-foreground">Transcripts + metadata behind an API.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Why teams choose this
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-3">
                    <Container className="size-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">One Docker container</div>
                      <div className="text-sm text-muted-foreground">Deploy in minutes. Low ops overhead.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="size-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">Data stays in your infra</div>
                      <div className="text-sm text-muted-foreground">Better governance for sensitive meetings.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="size-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">No per-seat pricing</div>
                      <div className="text-sm text-muted-foreground">Infra economics for internal rollouts.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="size-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">Build custom product logic</div>
                      <div className="text-sm text-muted-foreground">Summaries, search, CRM sync, copilots.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <SplitFeature
          eyebrow="Deploy"
          title="One Docker container. Deploy in minutes."
          body={
            <>
              Point to your DB + a transcriber, run one Docker container, start integrating.
            </>
          }
          primaryCta={{ href: "/get-started#quickstart", label: "Follow quickstart" }}
          visual={
            <div className="space-y-4">
              <CodePane
                caption="One Docker container deployment"
                code={`docker run -d \\
  --name vexa \\
  -p 8056:8056 \\
  -e DATABASE_URL="postgresql://user:pass@host/vexa" \\
  -e ADMIN_API_TOKEN="your-admin-token" \\
  -e TRANSCRIBER_URL="https://transcription.service" \\
  -e TRANSCRIBER_API_KEY="transcriber-token" \\
  vexaai/vexa-lite:latest`}
              />
            </div>
          }
        />

        <SplitFeature
          eyebrow="GPU-free"
          title="Choose your transcription setup"
          body={
            <>
              Point Vexa Lite to an external transcriber (GPU-free) or self-host the transcription
              service for full on-prem control. Same API either way.
            </>
          }
          bullets={[
            { strong: "External transcriber", rest: " — fastest start, no GPU needed." },
            { strong: "Self-host transcriber", rest: " — open-source, full on-prem control." },
            { strong: "Same API", rest: " — swap providers without code changes." },
            { strong: "Stateless", rest: " — easy redeploy/scale with your DB." },
          ]}
          primaryCta={{ href: "https://github.com/Vexa-ai/vexa", label: "Transcription options" }}
          reverse
          visual={
            <div className="space-y-4">
              <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Option 1: External transcriber
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">GPU-free deployment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">Fastest setup</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">Minimal ops overhead</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Option 2: Self-host transcriber
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">Full on-prem processing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">Open-source transcriber</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">Complete data sovereignty</span>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <SplitFeature
          eyebrow="Positioning"
          title="Recall.ai category, but open-source + self-hosted"
          body={
            <>
              Compete in the “meeting bot API” category with an open-source, self-hosted deployment
              model and simpler ops.
            </>
          }
          primaryCta={{ href: "https://github.com/Vexa-ai/vexa", label: "Why self-host" }}
          visual={
            <div className="space-y-4">
              <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Hosted meeting bot APIs</h4>
                  <span className="text-xs text-muted-foreground">e.g. Recall.ai</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Vendor-operated infra</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Data governance depends on vendor controls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Harder to audit/extend</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border bg-primary/10 border-primary/20 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Vexa Lite</h4>
                  <span className="text-xs text-primary font-medium">Open-source • Self-hosted</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">Run the infra in your environment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">Ship custom product logic without constraints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">Deploy in minutes as one Docker container</span>
                  </li>
                </ul>
              </div>
            </div>
          }
        />

        <DefaultPromoCards />
      </LandingBackground>
    </>
  );
}
