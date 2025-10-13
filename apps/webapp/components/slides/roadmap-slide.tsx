import { SlideLayout } from "./slide-layout";
import { CheckCircle2, Circle } from "lucide-react";

export function RoadmapSlide() {
  return (
    <SlideLayout
      eyebrow="12-Month Roadmap"
      title="Expanding platforms and enterprise features"
    >
      <div className="grid grid-cols-2 gap-8 mt-6">
        <div className="print:break-inside-avoid">
          <h3 className="text-2xl font-semibold mb-6 print:text-[16pt]">Platform Expansion</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground print:text-[11pt]">Google Meet</p>
                <p className="text-sm text-muted-foreground print:text-[9pt]">Live</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground print:text-[11pt]">Microsoft Teams</p>
                <p className="text-sm text-muted-foreground print:text-[9pt]">Live (v0.6)</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Circle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground print:text-[11pt]">Zoom</p>
                <p className="text-sm text-muted-foreground print:text-[9pt]">Q1 2026</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Circle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground print:text-[11pt]">Webex</p>
                <p className="text-sm text-muted-foreground print:text-[9pt]">Q2 2026</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="print:break-inside-avoid">
          <h3 className="text-2xl font-semibold mb-6 print:text-[16pt]">Enterprise Features</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Circle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground print:text-[11pt]">Real-time Translation</p>
                <p className="text-sm text-muted-foreground print:text-[9pt]">Multi-language support</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Circle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground print:text-[11pt]">Entity Tagging</p>
                <p className="text-sm text-muted-foreground print:text-[9pt]">Speaker IDs, timestamps, metadata</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Circle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground print:text-[11pt]">Compliance Packs</p>
                <p className="text-sm text-muted-foreground print:text-[9pt]">SOC2, ISO 27001</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Circle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground print:text-[11pt]">SLA 99.95% Uptime</p>
                <p className="text-sm text-muted-foreground print:text-[9pt]">Enterprise tier</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-muted/50 rounded-xl print:break-inside-avoid">
        <h3 className="text-lg font-semibold mb-3 print:text-[12pt]">Integration Templates</h3>
        <p className="text-base text-muted-foreground print:text-[10pt]">
          n8n workflow templates, MCP configuration examples, LangChain components
        </p>
      </div>
    </SlideLayout>
  );
}





