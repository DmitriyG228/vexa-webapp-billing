import { ArrowRightIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import Glow from "@/components/ui/glow";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Section } from "@/components/ui/section";
import Image from "next/image";
import TranscriptionMock from "@/components/ui/transcription-mock";
import { Github } from '@lobehub/icons';
import { SocialProof } from "@/components/ui/social-proof";

interface HeroButtonProps {
  href: string;
  text: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface HeroProps {
  title?: string;
  description?: string;
  mockup?: ReactNode | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

export default function Hero({
  title = "Meeting Transcription API",
  description = "Real Time meeting transcription  for Microsoft Teams and Google Meet hidden behind a simple API",
  mockup = (
    <TranscriptionMock className="h-[333px]" />
  ),
  badge = (
    <Badge variant="outline" className="animate-pulse">
      <span className="text-muted-foreground">
        v0.6 Now with Microsoft Teams support
      </span>
      <ArrowRightIcon className="size-3 ml-1" />
    </Badge>
  ),
  buttons = [
    {
      href: "/get-started",
      text: "Quick Start",
      variant: "default",
      iconRight: <ArrowRightIcon className="size-4" />,
    },
    {
      href: "https://github.com/Vexa-ai/vexa",
      text: "View on GitHub",
      variant: "outline",
      icon: <Github className="size-4" />,
    },
  ],
  className,
}: HeroProps) {
  return (
    <Section
      className={cn(
        "overflow-hidden pb-0 sm:pb-0 md:pb-0",
        className,
      )}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-12 pt-2 sm:gap-24">
        <div className="flex flex-col items-center gap-3 text-center sm:gap-12">
          {badge !== false && badge}
          <h1 className="relative z-10 inline-block bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-4xl leading-tight font-semibold text-balance text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight appear">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground relative z-10 max-w-[740px] font-medium text-balance sm:text-xl appear">
            {description}
          </p>
          
          {/* Platform logos (non-interactive) */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Image src="/microsoft-teams-logo.png" alt="Microsoft Teams" width={24} height={24} className="h-6 w-6 object-contain" />
              <span className="text-sm font-semibold text-foreground">Microsoft Teams</span>
            </div>
            <span className="text-muted-foreground">+</span>
            <div className="flex items-center gap-2">
              <Image src="/google-meet-logo.png" alt="Google Meet" width={24} height={24} className="h-6 w-6 object-contain" />
              <span className="text-sm font-semibold text-foreground">Google Meet</span>
            </div>
          </div>
          {buttons !== false && buttons.length > 0 && (
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                {buttons.map((button, index) => (
                  <Button
                    key={index}
                    variant={button.variant || "default"}
                    size="lg"
                    className="gap-2 h-12 px-8 text-base w-full sm:w-auto"
                    asChild
                  >
                    <a href={button.href}>
                      {button.icon}
                      {button.text}
                      {button.iconRight}
                    </a>
                  </Button>
                ))}
              </div>
              {/* Social proof */}
              <SocialProof userCount="1.5k+" />
            </div>
          )}
          {mockup !== false && (
            <div className="relative w-full pt-12">
              <div className="appear-zoom">
                {mockup}
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
