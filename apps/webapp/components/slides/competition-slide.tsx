import { SlideLayout } from "./slide-layout";

export function CompetitionSlide() {
  return (
    <SlideLayout
      eyebrow="Competitive Landscape"
      title="Vexa is the only open, developer-first meeting API"
    >
      <div className="mt-6 overflow-x-auto print:break-inside-avoid">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left p-4 font-semibold text-foreground print:text-[11pt]">Product</th>
              <th className="text-left p-4 font-semibold text-foreground print:text-[11pt]">Model</th>
              <th className="text-left p-4 font-semibold text-foreground print:text-[11pt]">Focus</th>
              <th className="text-left p-4 font-semibold text-foreground print:text-[11pt]">Limitation</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border hover:bg-muted/50">
              <td className="p-4 print:text-[10pt]">Recall.ai</td>
              <td className="p-4 print:text-[10pt]">Closed API</td>
              <td className="p-4 print:text-[10pt]">Platform connector</td>
              <td className="p-4 text-muted-foreground print:text-[10pt]">No self-hosting</td>
            </tr>
            <tr className="border-b border-border hover:bg-muted/50">
              <td className="p-4 print:text-[10pt]">Fireflies / Otter</td>
              <td className="p-4 print:text-[10pt]">Closed SaaS</td>
              <td className="p-4 print:text-[10pt]">Note-taking</td>
              <td className="p-4 text-muted-foreground print:text-[10pt]">No dev access</td>
            </tr>
            <tr className="border-b border-border hover:bg-muted/50">
              <td className="p-4 print:text-[10pt]">DIY Whisper pipelines</td>
              <td className="p-4 print:text-[10pt]">OSS</td>
              <td className="p-4 print:text-[10pt]">Flexible</td>
              <td className="p-4 text-muted-foreground print:text-[10pt]">Hard to maintain</td>
            </tr>
            <tr className="border-b-2 border-primary bg-primary/5 font-semibold">
              <td className="p-4 text-primary print:text-[10pt]">Vexa</td>
              <td className="p-4 print:text-[10pt]">OSS + Hosted</td>
              <td className="p-4 print:text-[10pt]">Infra layer</td>
              <td className="p-4 text-primary print:text-[10pt]">Developer-first</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 print:break-inside-avoid">
        <h3 className="text-xl font-semibold mb-3 print:text-[14pt]">Vexa Advantage</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            <span className="text-base print:text-[11pt]">Same API for OSS & Cloud</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            <span className="text-base print:text-[11pt]">Fastest real-time stream (sub-second latency)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            <span className="text-base print:text-[11pt]">Self-hosting option with full control</span>
          </li>
        </ul>
      </div>
    </SlideLayout>
  );
}





