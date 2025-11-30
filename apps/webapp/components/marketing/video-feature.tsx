import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";

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
  videoId: string;
  videoTitle: string;
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
  return (
    <section className={`py-12 sm:py-16 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm p-8 sm:p-12 overflow-hidden">
          <div className="grid items-stretch gap-8 sm:gap-12 min-h-[400px] lg:grid-cols-2">
            {/* Video - Full left side */}
            <div className="relative flex flex-col justify-center h-full min-w-0 lg:order-1">
              <div className="pointer-events-none absolute inset-x-0 sm:-inset-x-8 -top-10 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl opacity-60 sm:opacity-70" />
              <div className="relative rounded-2xl w-full">
                <YouTubeEmbed 
                  videoId={videoId} 
                  title={videoTitle} 
                />
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
                    <Link
                      href={primaryCta.href}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {primaryCta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {secondaryCta && (
                    <Link
                      href={secondaryCta.href}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-medium text-foreground ring-1 ring-border hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ml-auto"
                    >
                      {secondaryCta.label}
                    </Link>
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


