import { Section } from "@/components/ui/section";

interface StatItemProps {
  label?: string;
  value: string | number;
  suffix?: string;
  description?: string;
}

interface StatsProps {
  items?: StatItemProps[] | false;
  className?: string;
}

export default function Stats({
  items = [
    {
      label: "over",
      value: "99.9",
      suffix: "%",
      description: "uptime SLA with enterprise reliability",
    },
    {
      label: "sub-second",
      value: "< 500",
      suffix: "ms",
      description: "latency for real-time WebSocket streaming",
    },
    {
      label: "supports",
      value: "50+",
      description: "languages with automatic detection",
    },
    {
      label: "trusted by",
      value: "1000+",
      description: "developers and enterprises worldwide",
    },
  ],
  className,
}: StatsProps) {
  return (
    <Section className={className}>
      <div className="container mx-auto max-w-4xl">
        {items !== false && items.length > 0 && (
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-start gap-3 text-left"
              >
                {item.label && (
                  <div className="text-muted-foreground text-sm font-semibold">
                    {item.label}
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <div className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-4xl font-medium text-transparent drop-shadow-[2px_1px_24px_var(--primary)] transition-all duration-300 sm:text-5xl md:text-6xl">
                    {item.value}
                  </div>
                  {item.suffix && (
                    <div className="text-primary text-2xl font-semibold">
                      {item.suffix}
                    </div>
                  )}
                </div>
                {item.description && (
                  <div className="text-muted-foreground text-sm font-semibold text-pretty">
                    {item.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
