import { SlideLayout } from "./slide-layout";

export function MarketTimingSlide() {
  return (
    <SlideLayout
      eyebrow="Market Timing"
      title="Perfect convergence of AI adoption and enterprise needs"
      bullets={[
        {
          strong: "AI workflows and agents are surging",
          rest: "— all need conversation data",
        },
        {
          strong: "Enterprises moving from black-box SaaS",
          rest: "→ transparent, self-hosted APIs",
        },
        {
          strong: "Google Meet + MS Teams dominate 80% of enterprise calls",
          rest: "— yet no developer-friendly API",
        },
      ]}
    >
      <div className="mt-8 grid grid-cols-3 gap-6 print:gap-4">
        <div className="p-6 bg-card border border-border rounded-xl text-center print:break-inside-avoid">
          <p className="text-4xl font-bold text-primary mb-2 print:text-[24pt]">80%</p>
          <p className="text-sm text-muted-foreground print:text-[10pt]">
            Enterprise calls on Teams + Meet
          </p>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl text-center print:break-inside-avoid">
          <p className="text-4xl font-bold text-primary mb-2 print:text-[24pt]">0</p>
          <p className="text-sm text-muted-foreground print:text-[10pt]">
            Developer-friendly native APIs
          </p>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl text-center print:break-inside-avoid">
          <p className="text-4xl font-bold text-primary mb-2 print:text-[24pt]">100%</p>
          <p className="text-sm text-muted-foreground print:text-[10pt]">
            AI agents need meeting data
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}





