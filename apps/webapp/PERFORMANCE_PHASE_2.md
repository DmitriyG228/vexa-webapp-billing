# Performance Optimization - Phase 2

## Current Results (Dec 4, 2025)
- Performance: 64/100 (was 58, +6 points)
- FCP: 2.2s (was 7.3s, -5.1s ✅ HUGE WIN)
- LCP: 9.5s (was 9.0s, +0.5s ❌ WORSE)
- TBT: 360ms (was 110ms, +250ms ❌ MUCH WORSE)
- Speed Index: 3.1s (was 7.3s, -4.2s ✅ HUGE WIN)

---

## Phase 1 Success Analysis

### What Worked ✅
1. **Font-display: swap** - Eliminated 5s of FCP blocking
2. **Resource preloading** - Improved initial render
3. **Deferred analytics** - Non-blocking third-party scripts
4. **Package optimization** - Tree-shaking enabled

### What Failed ❌
1. **TBT increased 227%** - JavaScript execution is blocking main thread
2. **LCP got worse** - Largest content still slow to render
3. **Unused JavaScript still high** - 514 KiB needs removal

---

## Phase 2: Critical Fixes

### 🔴 PRIORITY 1: Fix Total Blocking Time (TBT = 360ms, target <200ms)

#### Problem
JavaScript is blocking the main thread for too long. 7 long tasks found.

#### Solutions

**A. Identify Heavy Components**
```bash
# Run bundle analyzer
cd apps/webapp
npm run build:analyze
```

**B. Lazy Load Non-Critical Components**

Create `app/components/LazyComponents.tsx`:
```typescript
import dynamic from 'next/dynamic'

// Lazy load heavy components
export const Features = dynamic(() => import('@/components/sections/features'), {
  loading: () => <div className="h-96 animate-pulse bg-muted/10" />,
})

export const VideoFeature = dynamic(() => import('@/components/marketing').then(mod => ({ default: mod.VideoFeature })), {
  loading: () => <div className="h-96 animate-pulse bg-muted/10" />,
})

export const PromoCards = dynamic(() => import('@/components/marketing').then(mod => ({ default: mod.PromoCards })), {
  loading: () => <div className="h-64 animate-pulse bg-muted/10" />,
})

// Lazy load charts/heavy UI
export const DashboardCharts = dynamic(() => import('@/components/dashboard/charts'), {
  ssr: false, // Skip SSR for charts
  loading: () => <div>Loading charts...</div>,
})
```

**C. Update Homepage to Use Lazy Components**

In `app/page.tsx`:
```typescript
// OLD (loads everything immediately)
import Features from "@/components/sections/features";
import { VideoFeature, PromoCards } from "@/components/marketing";

// NEW (lazy loads below-the-fold content)
import { Features, VideoFeature, PromoCards } from "@/components/LazyComponents";
```

**D. Defer Heavy Libraries**

For any analytics, charts, or non-critical libraries:
```typescript
// Use next/script with strategy
import Script from 'next/script'

<Script
  src="https://heavy-library.com/script.js"
  strategy="lazyOnload" // Load after page interactive
/>
```

---

### 🔴 PRIORITY 2: Fix Largest Contentful Paint (LCP = 9.5s, target <2.5s)

#### Problem
Main content (likely hero section with images/text) is rendering too slowly.

#### Solutions

**A. Add Priority to Hero Image**

Find the hero image in homepage and add:
```typescript
<Image
  src="/hero-image.jpg"
  alt="Hero"
  priority  // ← Add this
  quality={85}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**B. Preload Hero Background**

In `app/layout.tsx` head:
```typescript
<link rel="preload" as="image" href="/hero-bg.jpg" />
```

**C. Optimize Hero Section**

Make hero section a Server Component (remove 'use client'):
```typescript
// app/components/sections/hero.tsx
// Remove 'use client' if present
export default function Hero() {
  // ... server-rendered hero
}
```

**D. Split Code for Homepage**

In `next.config.mjs`, add:
```javascript
experimental: {
  optimizePackageImports: [...existing],
  serverComponentsExternalPackages: ['recharts'], // If using charts
},
webpack: (config) => {
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // Vendor chunk
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20,
        },
        // Common chunk
        common: {
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  };
  return config;
},
```

---

### 🟡 PRIORITY 3: Remove Unused JavaScript (514 KiB)

#### Problem
Too much JavaScript being loaded that isn't used.

#### Solutions

**A. Analyze Bundle**
```bash
npm run build:analyze
```

**B. Remove Unused Dependencies**

Check `package.json` for unused packages:
```bash
npx depcheck
```

**C. Use Lighter Alternatives**

Common heavy packages and lighter alternatives:
- `moment.js` → Use `date-fns` (already installed ✓)
- `lodash` → Use native JavaScript or `lodash-es`
- Heavy icon libraries → Use only needed icons from `lucide-react`

**D. Import Only What You Need**

Bad:
```typescript
import * as icons from 'lucide-react'
```

Good:
```typescript
import { Github, Star, Menu } from 'lucide-react'
```

---

### 🟡 PRIORITY 4: Remove Unused CSS (106 KiB)

#### Solutions

**A. Verify Tailwind Purge Config**

In `tailwind.config.ts`:
```typescript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Ensure this covers ALL your files
}
```

**B. Remove Unused CSS Variables**

Check `app/globals.css` and remove any unused custom CSS.

**C. Use CSS Modules for Component-Specific Styles**

Instead of global styles, use scoped CSS modules.

---

### 🟢 PRIORITY 5: Reduce Long Main-Thread Tasks (7 tasks)

#### Solutions

**A. Break Up JavaScript Execution**

Use `requestIdleCallback` for non-critical work:
```typescript
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Non-critical initialization
    initializeAnalytics()
    loadNonCriticalFeatures()
  })
}
```

**B. Use Web Workers for Heavy Processing**

For any data processing or computations:
```typescript
const worker = new Worker(new URL('./worker.ts', import.meta.url))
worker.postMessage(heavyData)
```

---

## Implementation Order

### Week 1: Critical Fixes (Target: Performance 75+)
1. ✅ Add lazy loading to Features, VideoFeature, PromoCards
2. ✅ Add `priority` to hero image
3. ✅ Run bundle analyzer and remove top 3 unused packages
4. ✅ Deploy and test

### Week 2: JavaScript Optimization (Target: Performance 80+)
1. ✅ Implement code splitting
2. ✅ Move analytics to `requestIdleCallback`
3. ✅ Convert heavy components to Server Components where possible
4. ✅ Deploy and test

### Week 3: Polish (Target: Performance 85+)
1. ✅ Remove all unused CSS
2. ✅ Optimize all images
3. ✅ Fine-tune bundle splitting
4. ✅ Final deployment and monitoring

---

## Quick Win: Lazy Load Homepage Sections

**Immediate action** - Update `app/page.tsx`:

```typescript
'use client';

import dynamic from 'next/dynamic';
import { ArrowRight, Github, Star } from "lucide-react";
import { SplitFeature, CodePane } from "@/components/ui/split-feature"
import { trackEvent } from '@/lib/analytics'
import { useEffect, useState } from "react";
import Hero from "@/components/sections/hero"; // Keep hero immediate

// Lazy load below-the-fold sections
const Features = dynamic(() => import("@/components/sections/features"), {
  loading: () => <div className="h-96 animate-pulse bg-muted/10 rounded-lg" />
});

const VideoFeature = dynamic(() => import("@/components/marketing").then(m => ({ default: m.VideoFeature })), {
  loading: () => <div className="h-96 animate-pulse bg-muted/10 rounded-lg" />
});

const PromoCards = dynamic(() => import("@/components/marketing").then(m => ({ default: m.PromoCards })), {
  loading: () => <div className="h-64 animate-pulse bg-muted/10 rounded-lg" />
});

const VexaOptions = dynamic(() => import("@/components/ui/vexa-options").then(m => ({ default: m.VexaOptions })), {
  loading: () => <div className="h-48 animate-pulse bg-muted/10 rounded-lg" />
});

export default function LandingPage() {
  // ... rest of your code
}
```

**Expected Impact:**
- TBT: 360ms → ~180ms (-50%)
- Performance: 64 → ~72 (+8 points)
- Deployment time: ~5 minutes

---

## Testing After Each Change

After deploying each optimization:
```bash
# Deploy
make deploy-dev-fast

# Wait 2 minutes, then test
open "https://pagespeed.web.dev/analysis/https-dev-webapp-leav4o4omq-uc-a-run-app/"
```

---

## Success Metrics

### Phase 2 Goals
- ✅ Performance Score: 75+ (currently 64)
- ✅ TBT: <200ms (currently 360ms)
- ✅ LCP: <4s (currently 9.5s)
- ✅ Unused JS: <300 KiB (currently 514 KiB)

### Phase 3 Goals (Future)
- ✅ Performance Score: 85+
- ✅ LCP: <2.5s
- ✅ TBT: <100ms
- ✅ All metrics green

---

## Next Step: Implement Quick Win

The fastest improvement right now is lazy loading. Let me know if you want me to implement the lazy loading changes to `app/page.tsx`!

Expected improvement: **+8-10 performance points** in ~5 minutes of deployment.

