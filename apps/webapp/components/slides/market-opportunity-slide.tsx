import { SlideLayout } from "./slide-layout";

export function MarketOpportunitySlide() {
  return (
    <SlideLayout
      eyebrow="Market Opportunity"
      title="Multi-billion dollar AI meeting intelligence market"
    >
      <div className="grid grid-cols-2 gap-8 mt-6">
        <div className="print:break-inside-avoid">
          <h3 className="text-2xl font-semibold mb-4 print:text-[16pt]">Who We Serve</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base print:text-[11pt]">
                <strong>Developers</strong> integrating meetings into LLM pipelines
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base print:text-[11pt]">
                <strong>AI Startups</strong> building notetakers, copilots, analytics
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base print:text-[11pt]">
                <strong>Enterprises</strong> with compliance or on-prem needs
              </span>
            </li>
          </ul>
        </div>
        
        <div className="print:break-inside-avoid">
          <h3 className="text-2xl font-semibold mb-4 print:text-[16pt]">TAM</h3>
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <p className="text-lg mb-4 text-foreground print:text-[12pt]">
              AI meeting intelligence + enterprise collaboration
            </p>
            <p className="text-3xl font-bold text-primary print:text-[20pt]">
              Multi-billion market
            </p>
          </div>
          
          <div className="mt-6 p-4 bg-card border border-border rounded-lg print:break-inside-avoid">
            <p className="text-sm font-medium text-muted-foreground mb-2 print:text-[9pt]">Entry Wedge</p>
            <p className="text-base font-semibold print:text-[11pt]">
              OSS adoption → hosted conversions
            </p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}





