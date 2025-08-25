'use client';

import { useEffect, useRef } from 'react';
import { trackPageView, trackUmamiPageView } from '@/lib/analytics';

/**
 * Component that tracks page views in Google Analytics and Umami
 * Can be included on any page to ensure tracking works correctly
 * Redesigned to avoid useSearchParams() which requires Suspense boundaries
 */
export function PageViewTracker({ title, path }: { title?: string; path?: string }) {
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    // Get the current path from window.location if not provided
    const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
    
    // Skip if the path hasn't changed and we've already tracked it
    if (currentPath === prevPathname.current) return;
    
    // Track the page view in both GA and Umami
    console.log(`📊 PageViewTracker: Tracking page view for ${currentPath}`);
    trackPageView(currentPath, title);
    trackUmamiPageView(currentPath, title);
    
    // Update the previous pathname
    prevPathname.current = currentPath;
  }, [path, title]);

  // This component doesn't render anything
  return null;
}

export default PageViewTracker; 