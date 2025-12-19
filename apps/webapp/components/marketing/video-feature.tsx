import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import { Button } from "@/components/ui/button";

export interface VideoFeatureBullet {
  strong: string;
  rest?: string;
}

interface VideoFeatureProps {
  eyebrow?: string;
  title: string;
  description: string;
  bullets?: VideoFeatureBullet[];
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  videoId?: string;
  videoTitle?: string;
  className?: string;
}

/**
 * Reusable video feature section for showcasing demos and tutorials.
 * Combines video content with feature bullets and CTAs.
 */
export function VideoFeature({
  eyebrow,
  title,
  description,
  bullets = [],
  primaryCta,
  secondaryCta,
  videoId,
  videoTitle,
  className = "",
}: VideoFeatureProps) {
  // Show MCP diagram if no videoId provided
  const showDiagram = !videoId;
  return (
    <section className={`py-12 sm:py-16 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm p-8 sm:p-12 overflow-hidden">
          <div className="grid items-stretch gap-8 sm:gap-12 min-h-[400px] lg:grid-cols-2">
            {/* Video or Diagram - Full left side */}
            <div className="relative flex flex-col justify-center h-full min-w-0 lg:order-1">
              <div className="pointer-events-none absolute inset-x-0 sm:-inset-x-8 -top-10 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl opacity-60 sm:opacity-70" />
              <div className="relative rounded-2xl w-full">
                {showDiagram ? (
                  <div className="w-full aspect-video rounded-2xl border bg-card/50 backdrop-blur-sm p-8 flex items-center justify-center">
                    {/* MCP Diagram */}
                    <div className="w-full max-w-2xl space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        {/* Claude/ChatGPT */}
                        <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl border bg-card">
                          <div className="text-2xl font-bold text-foreground">Claude</div>
                          <div className="text-xs text-muted-foreground">AI Assistant</div>
                        </div>
                        
                        {/* Arrow */}
                        <ArrowRight className="h-8 w-8 text-primary flex-shrink-0" />
                        
                        {/* MCP Server */}
                        <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl border bg-primary/10 border-primary/20">
                          <div className="text-2xl font-bold text-primary">MCP Server</div>
                          <div className="text-xs text-muted-foreground">Model Context Protocol</div>
                        </div>
                        
                        {/* Arrow */}
                        <ArrowRight className="h-8 w-8 text-primary flex-shrink-0" />
                        
                        {/* Vexa Transcripts */}
                        <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl border bg-card">
                          <div className="text-2xl font-bold text-foreground">Vexa</div>
                          <div className="text-xs text-muted-foreground">Transcripts</div>
                        </div>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        Real-time meeting transcripts flow through MCP to your AI assistant
                      </div>
                    </div>
                  </div>
                ) : (
                  <YouTubeEmbed 
                    videoId={videoId!} 
                    title={videoTitle || title} 
                  />
                )}
              </div>
            </div>

            {/* Text content */}
            <div className="flex flex-col justify-center min-w-0 lg:order-2">
              {eyebrow && (
                <p className="uppercase tracking-wider text-xs text-muted-foreground">{eyebrow}</p>
              )}
              <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-balance">
                {title}
              </h2>
              <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">
                {description}
              </p>

              {/* bullets */}
              {bullets.length > 0 && (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      </span>
                      <span>
                        <span className="font-medium text-foreground">{bullet.strong}</span>{" "}
                        {bullet.rest && <span className="text-muted-foreground">{bullet.rest}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* CTAs */}
              {(primaryCta || secondaryCta) && (
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  {primaryCta && (
                    <Button asChild size="lg" className="gap-2">
                      <Link href={primaryCta.href}>
                        {primaryCta.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  {secondaryCta && (
                    <Button asChild variant="outline" size="lg" className="ml-auto">
                      <Link href={secondaryCta.href}>
                        {secondaryCta.label}
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


