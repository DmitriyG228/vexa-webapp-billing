import { SlideLayout } from "./slide-layout";
import { Cloud, Server, CheckCircle2 } from "lucide-react";
import { Github } from '@lobehub/icons';

export function ProductSlide() {
  return (
    <SlideLayout
      eyebrow="Product Snapshot"
      title="Cloud Hosted or Self-Hosted — Same API"
    >
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="p-6 bg-card border border-border rounded-xl print:break-inside-avoid">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="h-8 w-8 text-primary" />
            <h3 className="text-2xl font-semibold print:text-[16pt]">Cloud Hosted</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm print:text-[10pt]">Reliable, scalable, enterprise-ready</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm print:text-[10pt]">Managed infrastructure</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm print:text-[10pt]">Start in minutes</span>
            </li>
          </ul>
        </div>
        
        <div className="p-6 bg-card border border-border rounded-xl print:break-inside-avoid">
          <div className="flex items-center gap-3 mb-4">
            <Server className="h-8 w-8 text-primary" />
            <h3 className="text-2xl font-semibold print:text-[16pt]">Self-Hosted</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm print:text-[10pt]">Apache-2.0 OSS core</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm print:text-[10pt]">Full data sovereignty</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm print:text-[10pt]">Deploy with Docker Compose or Nomad</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4 print:gap-3">
        <div className="p-4 bg-muted/50 rounded-lg text-center print:break-inside-avoid">
          <p className="text-sm font-medium text-muted-foreground mb-1 print:text-[9pt]">Integrations</p>
          <p className="text-base font-semibold print:text-[11pt]">n8n, Claude (MCP), LangChain</p>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg text-center print:break-inside-avoid">
          <p className="text-sm font-medium text-muted-foreground mb-1 print:text-[9pt]">Deployments</p>
          <p className="text-base font-semibold print:text-[11pt]">Docker Compose, Nomad</p>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg text-center print:break-inside-avoid">
          <p className="text-sm font-medium text-muted-foreground mb-1 print:text-[9pt]">Security</p>
          <p className="text-base font-semibold print:text-[11pt]">Own keys & retention</p>
        </div>
      </div>
    </SlideLayout>
  );
}





