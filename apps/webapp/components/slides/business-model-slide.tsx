import { SlideLayout } from "./slide-layout";
import { DollarSign, Server, Unlock } from "lucide-react";

export function BusinessModelSlide() {
  return (
    <SlideLayout
      eyebrow="Business Model"
      title="Flexible pricing with no vendor lock-in"
    >
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="p-6 bg-card border-2 border-primary/20 rounded-xl print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold print:text-[14pt]">Hosted SaaS</h3>
          </div>
          <p className="text-3xl font-bold text-primary mb-2 print:text-[20pt]">$12–50</p>
          <p className="text-sm text-muted-foreground mb-4 print:text-[10pt]">per month / concurrent bot</p>
          <ul className="space-y-2 text-sm print:text-[9pt]">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>Managed infrastructure</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>Automatic scaling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>99.9% uptime SLA</span>
            </li>
          </ul>
        </div>
        
        <div className="p-6 bg-card border-2 border-border rounded-xl print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold print:text-[14pt]">Self-Hosted</h3>
          </div>
          <p className="text-3xl font-bold text-primary mb-2 print:text-[20pt]">Custom</p>
          <p className="text-sm text-muted-foreground mb-4 print:text-[10pt]">support & enterprise plans</p>
          <ul className="space-y-2 text-sm print:text-[9pt]">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>Full data sovereignty</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>On-premises deployment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>Priority support</span>
            </li>
          </ul>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-4">
            <Unlock className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold print:text-[14pt]">OSS Apps</h3>
          </div>
          <p className="text-3xl font-bold text-primary mb-2 print:text-[20pt]">Free</p>
          <p className="text-sm text-muted-foreground mb-4 print:text-[10pt]">when you build open source</p>
          <ul className="space-y-2 text-sm print:text-[9pt]">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>Community support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>Developer-friendly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>Zero lock-in</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-muted/50 rounded-xl text-center print:break-inside-avoid">
        <p className="text-xl font-semibold text-foreground print:text-[14pt]">
          No vendor lock-in — start hosted, migrate to open source anytime
        </p>
      </div>
    </SlideLayout>
  );
}





