import { SlideLayout } from "./slide-layout";
import Image from "next/image";
import { Github, MCP } from '@lobehub/icons';

export function CoverSlide() {
  return (
    <SlideLayout centered className="bg-gradient-to-br from-slate-50 to-background print:bg-transparent">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <Image src="/logodark.svg" alt="Vexa" width={48} height={48} className="print:w-12 print:h-12" />
          <h1 className="text-6xl font-bold text-foreground print:text-[48pt]">Vexa.ai</h1>
        </div>
        
        <p className="text-2xl text-muted-foreground font-medium print:text-[18pt]">
          Meeting Intelligence Stack (OSS + SaaS)
        </p>
        
        <p className="text-xl text-foreground max-w-2xl print:text-[14pt]">
          Real-time transcription for Microsoft Teams and Google Meet hidden behind a simple API
        </p>
        
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Image src="/microsoft-teams-logo.png" alt="Microsoft Teams" width={32} height={32} />
            <span className="text-sm font-medium">Microsoft Teams</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/google-meet-logo.png" alt="Google Meet" width={32} height={32} />
            <span className="text-sm font-medium">Google Meet</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/n8n-logo.svg" alt="n8n" width={32} height={32} />
            <span className="text-sm font-medium">n8n</span>
          </div>
          <div className="flex items-center gap-2">
            <MCP size={32} />
            <span className="text-sm font-medium">MCP</span>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-2 text-muted-foreground">
          <p className="text-lg font-semibold">Seed Round — October 2025</p>
          <p className="text-sm">v0.6</p>
        </div>
      </div>
    </SlideLayout>
  );
}





