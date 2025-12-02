import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, ArrowDownRight } from "lucide-react";

export function Placeholder({ caption }: { caption?: string }) {
  return (
    <figure className="m-0 relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-card ring-1 ring-border shadow-sm">
      <div className="absolute inset-0">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)",
            backgroundSize: "14px 14px, 100% 100%",
          }}
          aria-hidden="true"
        />
      </div>
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 px-4 py-2 text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function CodePane({ code, caption }: { code: string; caption?: string }) {
  // Simple syntax highlighting for curl commands
  const highlightCode = (text: string) => {
    return text
      .replace(/(curl|POST|GET|PUT|DELETE|PATCH)\b/g, '<span style="color: #f472b6;">$1</span>') // Pink for HTTP methods
      .replace(/(-X|-H|-d|--header|--data)\b/g, '<span style="color: #60a5fa;">$1</span>') // Blue for flags
      .replace(/("https?:\/\/[^"]+")/g, '<span style="color: #34d399;">$1</span>') // Green for URLs
      .replace(/("X-API-Key|Content-Type|application\/json")/g, '<span style="color: #a78bfa;">$1</span>') // Purple for headers
      .replace(/(platform|native_meeting_id|passcode)/g, '<span style="color: #fbbf24;">$1</span>') // Amber for keys
      .replace(/(google_meet|teams)/g, '<span style="color: #34d399;">$1</span>') // Green for values
      .replace(/(\{|\}|\[|\])/g, '<span style="color: #d1d5db;">$1</span>'); // Gray for brackets
  };

  return (
    <figure className="m-0 w-full relative overflow-hidden rounded-2xl ring-1 ring-border shadow-sm bg-[#0b0f14]">
      <pre className="overflow-hidden p-4 text-[13px] leading-relaxed" style={{
        color: '#e4e4e7',
        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
      }}>
        <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
      </pre>
      {caption && (
        <figcaption className="px-4 py-2 text-xs text-gray-400 border-t border-white/10">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

type Chip = { label: string; tone?: "dark" | "light" };
type Bullet = { strong: string; rest?: string };

export function SplitFeature({
  eyebrow,
  title,
  body,
  chips = [],
  bullets = [],
  primaryCta,
  secondaryCta,
  visual,
  reverse = false,
}: {
  eyebrow?: string;
  title: string;
  body: React.ReactNode;
  chips?: Chip[];
  bullets?: Bullet[];
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  visual: React.ReactNode; // <img/> | <CodePane/> | <Placeholder/>
  reverse?: boolean;
}) {
  return (
    <section className="py-12 sm:py-16 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm p-8 sm:p-12 overflow-hidden">
          <div
            className={[
              "grid items-stretch gap-8 sm:gap-12 min-h-[400px]",
              visual ? "lg:grid-cols-2" : "",
              reverse ? "lg:[&>*:first-child]:order-2" : "",
            ].join(" ")}
          >
        {/* Text */}
        <div className="flex flex-col justify-center min-w-0 max-w-md">
          {eyebrow && (
            <p className="uppercase tracking-wider text-xs text-muted-foreground">{eyebrow}</p>
          )}
          <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-balance">
            {title}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
          
          {/* Arrow pointing to code */}
          {visual && (
            <div className="mt-6 flex items-center gap-2 text-primary opacity-60">
              <span className="text-sm font-medium">POST bot</span>
              <ArrowDownRight className="h-4 w-4" />
            </div>
          )}

          {/* chips */}
          {chips.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {chips.map((c, i) => (
                <span
                  key={i}
                  className={[
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                    c.tone === "dark" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {c.label}
                </span>
              ))}
            </div>
          )}

          {/* bullets */}
          {bullets.length > 0 && (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <span>
                    <span className="font-medium text-foreground">{b.strong}</span>{" "}
                    {b.rest && <span className="text-muted-foreground">{b.rest}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}

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

        {/* Visual */}
        {visual && (
          <div className="relative flex flex-col justify-center h-full min-w-0">
            <div className="pointer-events-none absolute inset-x-0 sm:-inset-x-8 -top-10 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl opacity-60 sm:opacity-70" />
            <div className="relative rounded-2xl w-full">{visual}</div>
          </div>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
