'use client';

/**
 * Admin-only blog refresh button
 *
 * - Only visible to authenticated users (admins)
 * - Manually refreshes blog content and notifications from GitHub
 * - Positioned in top-right corner with subtle styling
 * - No automatic refresh to avoid bothering regular users
 */

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, Settings } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function BlogRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Only show button for authenticated users (admins)
  if (!session?.user) {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // Call the API to revalidate blog content
      const response = await fetch('/api/blog-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh blog content');
      }

      const data = await response.json();
      console.log('Blog refresh successful:', data);

      // Refresh the current page to show fresh content
      router.refresh();

    } catch (error) {
      console.error('Error refreshing blog:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-gray-200 shadow-sm hover:bg-white hover:shadow-md opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <Settings className="h-3 w-3 opacity-50" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refresh blog content and notifications (Admin only)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
