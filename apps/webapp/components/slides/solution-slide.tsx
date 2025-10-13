import { SlideLayout } from "./slide-layout";
import { CodePane } from "@/components/ui/split-feature";

export function SolutionSlide() {
  return (
    <SlideLayout
      eyebrow="The Solution"
      title="Vexa plugs AI into live meetings via a simple, open API"
    >
      <div className="grid grid-cols-2 gap-8 mt-6 print:gap-6">
        <div className="space-y-4 print:break-inside-avoid">
          <h3 className="text-2xl font-semibold mb-4 print:text-[16pt]">Core Capabilities</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base print:text-[11pt]">
                <strong>Bots that auto-join</strong> Microsoft Teams & Google Meet
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base print:text-[11pt]">
                <strong>Real-time transcription</strong> with sub-second latency
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base print:text-[11pt]">
                <strong>Simple API:</strong> POST bot → GET transcript
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base print:text-[11pt]">
                <strong>SaaS or Self-Host:</strong> same API, full control
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base print:text-[11pt]">
                <strong>MCP-Ready:</strong> agents can start/stop bots and stream transcripts
              </span>
            </li>
          </ul>
        </div>
        
        <div className="space-y-3 print:break-inside-avoid">
          <CodePane
            caption="1) Create bot"
            code={`curl -X POST https://api.cloud.vexa.ai/bots \\
  -H "X-API-Key: YOUR_KEY" \\
  -d '{
    "platform": "google_meet",
    "native_meeting_id": "abc-defg-hij"
  }'`}
          />
          <CodePane
            caption="2) Get transcript"
            code={`curl -X GET https://api.cloud.vexa.ai/transcripts/google_meet/abc-defg-hij \\
  -H "X-API-Key: YOUR_KEY"`}
          />
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center print:break-inside-avoid">
        <p className="text-lg font-medium text-foreground print:text-[12pt]">
          "Start using Vexa in 5 minutes. API key in 3 clicks."
        </p>
      </div>
    </SlideLayout>
  );
}





