import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SlideLayoutProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  bullets?: Array<{ strong?: string; rest: string }>;
  visual?: ReactNode;
  className?: string;
  children?: ReactNode;
  centered?: boolean;
}

export function SlideLayout({
  title,
  subtitle,
  eyebrow,
  bullets,
  visual,
  className,
  children,
  centered = false,
}: SlideLayoutProps) {
  return (
    <section
      className={cn(
        "slide",
        "w-[297mm] min-h-[210mm] flex flex-col justify-center mx-auto",
        "print:h-[210mm] print:min-h-0",
        "px-16 py-12",
        "border-2 border-border mb-8",
        "print:border-0 print:mb-0 print:px-[16mm] print:py-[16mm]",
        "bg-background",
        className
      )}
    >
      <div className={cn("max-w-6xl mx-auto w-full", centered && "text-center")}>
        {eyebrow && (
          <p className="uppercase tracking-wider text-xs text-muted-foreground mb-3 print:text-[10pt]">
            {eyebrow}
          </p>
        )}
        
        {title && (
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground mb-4 print:text-[32pt] print:mb-3">
            {title}
          </h1>
        )}
        
        {subtitle && (
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl print:text-[14pt] print:mb-4">
            {subtitle}
          </p>
        )}
        
        {bullets && bullets.length > 0 && (
          <ul className="space-y-3 mb-6 print:space-y-2 print:mb-4">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0 print:mt-1" />
                <span className="text-lg print:text-[12pt]">
                  {bullet.strong && (
                    <strong className="font-semibold text-foreground">{bullet.strong}</strong>
                  )}{" "}
                  <span className="text-muted-foreground">{bullet.rest}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        
        {visual && (
          <div className="mt-8 print:mt-4 print:break-inside-avoid">
            {visual}
          </div>
        )}
        
        {children}
      </div>
    </section>
  );
}

