import { ReactNode } from "react";

interface LandingBackgroundProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable background pattern component for all landing pages.
 * Provides consistent visual foundation with animated gradients and patterns.
 */
export function LandingBackground({ children, className = "" }: LandingBackgroundProps) {
  return (
    <div className={`relative min-h-screen bg-gradient-to-b from-slate-100 via-gray-50 to-background dark:from-slate-900 dark:via-slate-950 dark:to-background ${className}`}>
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

      {children}
    </div>
  );
}

