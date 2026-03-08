import { ArrowRightIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

interface CTAButtonProps {
  href: string;
  text: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface CTAProps {
  title?: string;
  description?: string;
  buttons?: CTAButtonProps[] | false;
  className?: string;
}

export default function CTA({
  title = "Ready to get started?",
  description = "From signup to your first API call in just 5 minutes. Start transcribing meetings today with our professional-grade transcription API.",
  buttons = [
    {
      href: "/signin",
      text: "Get Started Free",
      variant: "default",
      iconRight: <ArrowRightIcon className="size-4" />,
    },
    {
      href: "https://github.com/Vexa-ai/vexa",
      text: "View on GitHub",
      variant: "outline",
    },
  ],
  className,
}: CTAProps) {
  return (
    <Section className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-[600px] font-medium">
            {description}
          </p>
          {buttons !== false && buttons.length > 0 && (
            <div className="flex justify-center gap-4">
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant || "default"}
                  size="lg"
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
          )}
        </div>
      </div>
    </Section>
  );
}
