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
      {/* Base background */}
      <div className="fixed inset-0 -z-50 bg-gradient-to-b from-slate-50/70 via-background to-background dark:from-slate-950 dark:via-background dark:to-background" />

      {/* Aurora wash + glows (mode-specific so light mode stays cold) */}
      {/* Light mode: teal + blue (chart-2, chart-3) */}
      <div className="fixed inset-0 -z-40 pointer-events-none overflow-hidden dark:hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(1100px 520px at 50% -120px, hsl(var(--chart-3) / 0.22), transparent 70%)",
          }}
        />
        <div
          className="absolute -top-24 -left-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-60"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--chart-2) / 0.28) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-24 -right-48 h-[560px] w-[560px] rounded-full blur-3xl opacity-55"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--chart-3) / 0.22) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: `
              linear-gradient(115deg, transparent 0%, hsl(var(--chart-3) / 0.10) 22%, transparent 55%),
              linear-gradient(35deg, transparent 0%, hsl(var(--chart-2) / 0.09) 18%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Dark mode: blue + teal (chart-1, chart-2) */}
      <div className="fixed inset-0 -z-40 pointer-events-none overflow-hidden hidden dark:block">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background:
              "radial-gradient(1100px 520px at 50% -120px, hsl(var(--chart-1) / 0.24), transparent 70%)",
          }}
        />
        <div
          className="absolute -top-24 -left-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-50"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--chart-1) / 0.28) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-24 -right-48 h-[560px] w-[560px] rounded-full blur-3xl opacity-45"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--chart-2) / 0.24) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: `
              linear-gradient(115deg, transparent 0%, hsl(var(--chart-1) / 0.10) 22%, transparent 55%),
              linear-gradient(35deg, transparent 0%, hsl(var(--chart-2) / 0.08) 18%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Technical grid (masked to hero area) */}
      <div
        className="fixed inset-0 -z-30 pointer-events-none opacity-[0.05] dark:opacity-[0.10]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground) / 0.10) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground) / 0.10) 1px, transparent 1px)
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
