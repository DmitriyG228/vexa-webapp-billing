import { SlideLayout } from "./slide-layout";
import { ArrowRight } from "lucide-react";
import { Github } from '@lobehub/icons';

export function GTMSlide() {
  return (
    <SlideLayout
      eyebrow="Go-To-Market Strategy"
      title="Bottom-up developer-led growth"
    >
      <div className="mt-6 space-y-8">
        <div className="flex items-center justify-center gap-6 print:break-inside-avoid">
          <div className="p-6 bg-card border-2 border-primary rounded-xl text-center min-w-[140px]">
            <Github size={40} className="mx-auto mb-2 text-primary" />
            <p className="text-lg font-semibold print:text-[12pt]">OSS</p>
          </div>
          <ArrowRight className="h-8 w-8 text-muted-foreground" />
          <div className="p-6 bg-card border-2 border-primary rounded-xl text-center min-w-[140px]">
            <p className="text-4xl mb-2">👨‍💻</p>
            <p className="text-lg font-semibold print:text-[12pt]">Developers</p>
          </div>
          <ArrowRight className="h-8 w-8 text-muted-foreground" />
          <div className="p-6 bg-card border-2 border-primary rounded-xl text-center min-w-[140px]">
            <p className="text-4xl mb-2">👥</p>
            <p className="text-lg font-semibold print:text-[12pt]">Teams</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="print:break-inside-avoid">
            <h3 className="text-xl font-semibold mb-4 print:text-[14pt]">Channels</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base print:text-[11pt]">Product Hunt, GitHub, Discord</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base print:text-[11pt]">X (Twitter), r/selfhosted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base print:text-[11pt]">Foundation pilots: ASWF, Eclipse OCT, FINOS</span>
              </li>
            </ul>
          </div>
          
          <div className="print:break-inside-avoid">
            <h3 className="text-xl font-semibold mb-4 print:text-[14pt]">Integration-Led Growth</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base print:text-[11pt]">n8n workflow nodes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base print:text-[11pt]">MCP server for Claude Desktop</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base print:text-[11pt]">LangChain components</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}





