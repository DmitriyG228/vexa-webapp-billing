/**
 * Lazy-loaded components for homepage optimization
 * 
 * These components are loaded only when needed (below the fold),
 * reducing initial JavaScript bundle size and improving TBT.
 */

'use client';

import dynamic from 'next/dynamic';

// Loading placeholder component
const LoadingPlaceholder = ({ className = "h-96" }: { className?: string }) => (
  <div className={`${className} animate-pulse bg-muted/10 rounded-lg`} />
);

/**
 * Features section - Below the fold, lazy load
 */
export const Features = dynamic(() => import("@/components/sections/features"), {
  loading: () => <LoadingPlaceholder className="h-96" />,
});

/**
 * VideoFeature component - Heavy video component, lazy load
 */
export const VideoFeature = dynamic(
  () => import("@/components/marketing").then((mod) => ({ default: mod.VideoFeature })),
  {
    loading: () => <LoadingPlaceholder className="h-96" />,
  }
);

/**
 * PromoCards component - Marketing cards, lazy load
 */
export const PromoCards = dynamic(
  () => import("@/components/marketing").then((mod) => ({ default: mod.PromoCards })),
  {
    loading: () => <LoadingPlaceholder className="h-64" />,
  }
);

/**
 * VexaOptions component - Interactive options, lazy load
 */
export const VexaOptions = dynamic(
  () => import("@/components/ui/vexa-options").then((mod) => ({ default: mod.VexaOptions })),
  {
    loading: () => <LoadingPlaceholder className="h-48" />,
  }
);

/**
 * SplitFeature component - Can be lazy loaded if not critical
 * Keeping it immediate for now as it's part of the main content flow
 */
export const SplitFeature = dynamic(() => import("@/components/ui/split-feature").then((mod) => ({ default: mod.SplitFeature })), {
  loading: () => <LoadingPlaceholder className="h-96" />,
});

