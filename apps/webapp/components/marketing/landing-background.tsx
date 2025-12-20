'use client';

import { ReactNode } from "react";

interface LandingBackgroundProps {
  children: ReactNode;
  className?: string;
}

/**
 * Clean, technical background for API/SaaS landing pages.
 * Uses theme "chart" hues (not primary) for subtle color, plus a masked grid + dots.
 */
export function LandingBackground({ children, className = "" }: LandingBackgroundProps) {
  const heroMask = "radial-gradient(ellipse 80% 60% at 50% 10%, black 0%, transparent 70%)";

  return (
    <div className={`relative min-h-screen bg-background ${className}`}>
      {/* Base background - Enhanced for better visibility */}
      <div className="fixed inset-0 -z-50 bg-gradient-to-b from-blue-50/40 via-slate-50/30 to-background dark:from-slate-950 dark:via-background dark:to-background" />

      {/* Aurora wash + glows (mode-specific so light mode stays cold) */}
      {/* Light mode: teal + blue (direct RGB for visibility) - Always show by default */}
      <div className="fixed inset-0 -z-40 pointer-events-none overflow-hidden block dark:hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% -100px, rgba(14, 165, 233, 0.25), transparent 65%)",
          }}
        />
        <div
          className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, rgba(6, 182, 212, 0.30) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-32 -right-40 h-[650px] w-[650px] rounded-full blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.28) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(115deg, transparent 0%, rgba(14, 165, 233, 0.12) 25%, transparent 60%),
              linear-gradient(35deg, transparent 0%, rgba(6, 182, 212, 0.10) 20%, transparent 55%)
            `,
          }}
        />
      </div>

      {/* Dark mode: blue + teal (direct RGB for visibility) */}
      <div className="fixed inset-0 -z-40 pointer-events-none overflow-hidden hidden dark:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% -100px, rgba(59, 130, 246, 0.30), transparent 65%)",
          }}
        />
        <div
          className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-32 -right-40 h-[650px] w-[650px] rounded-full blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(6, 182, 212, 0.32) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(115deg, transparent 0%, rgba(59, 130, 246, 0.15) 25%, transparent 60%),
              linear-gradient(35deg, transparent 0%, rgba(6, 182, 212, 0.12) 20%, transparent 55%)
            `,
          }}
        />
      </div>

      {/* Technical grid (masked to hero area) */}
      <div
        className="fixed inset-0 -z-30 pointer-events-none opacity-[0.08] dark:opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground) / 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground) / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px",
          maskImage: heroMask,
          WebkitMaskImage: heroMask,
        }}
      />

      {/* Dots layer (gives texture, still clean) */}
      <div
        className="fixed inset-0 -z-20 pointer-events-none opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--foreground) / 0.16) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage: heroMask,
          WebkitMaskImage: heroMask,
        }}
      />

      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
}
