import {
  Bot,
  Zap,
  Server,
  Globe,
  Shield,
  Clock,
  Code,
  Cloud,
  Github,
} from "lucide-react";
import { ReactNode } from "react";
import { Item, ItemDescription, ItemIcon, ItemTitle } from "@/components/ui/item";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface ItemProps {
  title: string;
  description: string;
  icon: ReactNode;
}

interface FeaturesProps {
  title?: string;
  items?: ItemProps[] | false;
  className?: string;
}

export default function Features({
  title = "AI RUNS ON DATA, Vexa is the API that plugs your AI into live meetings.",
  items = [
    {
      title: "Auto-join bots",
      description: "Bots that join your meetings automatically",
      icon: <Bot className="size-5 stroke-1" />,
    },
    {
      title: "Real-time transcription",
      description: "Sub-second latency for live transcripts",
      icon: <Zap className="size-5 stroke-1" />,
    },
    {
      title: "Simple API",
      description: "POST bot, then GET transcript",
      icon: <Server className="size-5 stroke-1" />,
    },





  ],
  className,
}: FeaturesProps) {
  return (
    <Section className={className}>
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm p-8 sm:p-12">
          <div className="flex flex-col items-center gap-2 sm:gap-6">
            <div className="max-w-[560px] text-center space-y-2">
              <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl sm:leading-tight">
                AI runs on data.
              </h2>
              <h3 className="text-xl leading-tight font-medium tracking-tight text-balance text-muted-foreground sm:text-2xl sm:leading-tight">
                Vexa is the API that plugs your AI into live meetings.
              </h3>
            </div>
            
            {/* Input Logos with Pipeline Visualization */}
            <div className="relative w-full">
              {/* Input Logos */}
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mb-8">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
                  <Image src="/microsoft-teams-logo.png" alt="Microsoft Teams" width={20} height={20} className="h-5 w-5 object-contain" />
                  <span className="text-xs font-medium">Teams</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
                  <Image src="/google-meet-logo.png" alt="Google Meet" width={20} height={20} className="h-5 w-5 object-contain" />
                  <span className="text-xs font-medium">Meet</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
                  <Image src="/n8n-logo.svg" alt="N8N" width={20} height={20} className="h-5 w-5 object-contain" />
                  <span className="text-xs font-medium">N8N</span>
                </div>
              </div>
              
              {/* Pipeline Flow Lines */}
              <div className="relative flex justify-center items-center mb-8">
                <div className="absolute left-1/2 -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-primary/40 via-primary/30 to-transparent opacity-50"></div>
                <div className="relative z-10 px-4 py-2 bg-card border border-primary/20 rounded-lg">
                  <span className="text-xs font-medium text-primary">Vexa API</span>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-1 h-12 bg-gradient-to-b from-transparent via-primary/30 to-primary/40 opacity-50"></div>
              </div>
              
              {/* Output Cards */}
              {items !== false && items.length > 0 && (
                <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item, index) => (
                    <div key={index} className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-all">
                      <h3 className="text-lg font-semibold mb-3 text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
