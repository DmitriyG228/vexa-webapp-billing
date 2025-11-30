'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap } from "lucide-react";
import { ReactNode } from "react";
import { PromoCardData } from "@/lib/marketing/content";

export interface PromoCard {
  icon: ReactNode;
  title: string;
  description: string;
  flow: Array<{ type: 'image' | 'icon'; src?: string; component?: ReactNode; alt?: string }>;
  cta: {
    href: string;
    label: string;
  };
}

interface PromoCardsProps {
  cards: PromoCard[];
  className?: string;
}

type BrandBadgeType = 'n8n' | 'mcp' | 'claude';
type IconType = BrandBadgeType | 'zap';

const BRAND_ICONS: Record<BrandBadgeType, { src: string; alt: string }> = {
  n8n: { src: '/n8n-logo.svg', alt: 'n8n workflow automation platform logo' },
  mcp: { src: '/icons8-mcp-96.png', alt: 'MCP (Model Context Protocol) logo' },
  claude: { src: '/icons8-claude-ai-96.png', alt: 'Claude AI assistant logo' },
};

/**
 * Helper function to render icon based on type
 */
function renderIcon(type: IconType): ReactNode {
  if (type === 'zap') {
    return (
      <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md border bg-background">
        <Zap className="h-6 w-6" aria-hidden="true" />
      </div>
    );
  }
  const brand = BRAND_ICONS[type];
  return (
    <div className="flex h-[50px] w-[50px] items-center justify-center">
      <Image 
        src={brand.src} 
        alt={brand.alt} 
        width={50} 
        height={50} 
        className="object-contain" 
      />
    </div>
  );
}

/**
 * Helper function to render flow icon
 */
function renderFlowIcon(type?: IconType): ReactNode {
  if (!type) return null;
  if (type === 'zap') {
    return <Zap className="h-7 w-7 text-primary" />;
  }
  const brand = BRAND_ICONS[type];
  return (
    <Image 
      src={brand.src} 
      alt={brand.alt} 
      width={28} 
      height={28} 
      className="object-contain" 
    />
  );
}

/**
 * Convert PromoCardData to PromoCard (creates JSX from data)
 */
export function convertPromoCardData(data: PromoCardData): PromoCard {
  return {
    icon: renderIcon(data.iconType),
    title: data.title,
    description: data.description,
    flow: data.flow.map(item => {
      if (item.type === 'image') {
        return {
          type: 'image' as const,
          src: item.src,
          alt: item.alt,
        };
      } else {
        return {
          type: 'icon' as const,
          component: renderFlowIcon(item.iconType),
        };
      }
    }),
    cta: data.cta,
  };
}

/**
 * Reusable promo cards section for showcasing integrations and use cases.
 * Used on homepage and feature pages to highlight different ways to use Vexa.
 */
export function PromoCards({ cards, className = "" }: PromoCardsProps) {
  return (
    <section className={`py-12 sm:py-16 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card, index) => (
            <div key={index} className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="text-center space-y-4 flex-1">
                <div className="flex justify-center">
                  {card.icon}
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">{card.title}</h4>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {card.flow.map((item, flowIndex) => (
                    <div key={flowIndex} className="flex items-center gap-2">
                      {item.type === 'image' && item.src && (
                        <Image 
                          src={item.src} 
                          alt={item.alt || ''} 
                          width={28} 
                          height={28} 
                          className="object-contain" 
                        />
                      )}
                      {item.type === 'icon' && item.component}
                      {flowIndex < card.flow.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-auto pt-4">
                <Link href={card.cta.href} className="inline-flex items-center gap-1 text-primary hover:underline">
                  <span>{card.cta.label}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
