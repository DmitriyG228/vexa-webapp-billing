import { ArrowRight, Check, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OptionCardProps {
  title: string;
  description: string;
  eyebrow: string;
  features: string[];
  cta: {
    text: string;
    href: string;
    variant?: "default" | "outline";
    icon?: React.ReactNode;
  };
  highlighted?: boolean;
}

function OptionCard({ title, description, eyebrow, features, cta, highlighted = false }: OptionCardProps) {
  return (
    <div className={cn(
      "relative rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md flex flex-col",
      highlighted && "border-primary shadow-lg ring-1 ring-primary/20"
    )}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            
          </Badge>
        </div>
      )}
      
      <div className="text-center space-y-6 flex-1 flex flex-col">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {eyebrow}
          </p>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <div className="space-y-3 flex-1">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 mt-auto">
          <Button 
            asChild 
            variant={cta.variant || "default"} 
            size="lg" 
            className="w-full gap-2"
          >
            <Link href={cta.href}>
              {cta.icon}
              {cta.text}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function VexaOptions() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              SaaS or Self Hosted?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start quickly with our hosted API or deploy on your own infrastructure for complete control
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <OptionCard
              eyebrow="Ready to go"
              title="Start with API key in minutes"
              description="Start using Vexa in 5 minutes with a quick tutorial in your terminal."
              features={[
                "Cloud Hosted",
                "API key in 3 clicks",
                "Starting from 12$/month",
                "Free when you build",
                "Reliable and Scalable",
              ]}
              cta={{
                text: "Quick Start",
                href: "/get-started"
              }}
              highlighted={true}
            />

            <OptionCard
              eyebrow="Enterprise-ready"
              title="Self Host Vexa Open Source"
              description="When data sovereignty is non-negotiable, self-host Vexa Open Source."
              features={[
                "Self Hosted and Managed",
                "Open Source (Apache 2.0)",
                "Complience and regulations",
                "Full Data Sovereignty",
              ]}
              cta={{
                text: "View on GitHub",
                href: "https://github.com/Vexa-ai/vexa",
                variant: "outline",
                icon: <Github className="w-4 h-4" />
              }}
            />
          </div>
          
          <div className="mt-12">
            <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm text-center">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                No vendor lock-in.
              </h3>
              <p className="text-sm text-muted-foreground">
                You can start with the hosted service and switch to open source at any time.
              </p>
            </div>
          </div>
      </div>
    </section>
  );
}
