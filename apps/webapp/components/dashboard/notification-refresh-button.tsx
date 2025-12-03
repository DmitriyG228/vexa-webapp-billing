'use client';

/**
 * Admin-only notification refresh button
 *
 * - Only visible to authenticated users (admins)
 * - Manually refreshes notifications from GitHub
 * - Positioned inline with notifications
 */

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function NotificationRefreshButton() {
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
      // Call the API to revalidate blog content (which includes notifications)
      const response = await fetch('/api/blog-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh notifications');
      }

      const data = await response.json();
      console.log('Notifications refresh successful:', data);

      // Refresh the current page to show fresh content
      router.refresh();

    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <Button
        onClick={handleRefresh}
        disabled={isRefreshing}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-gray-200 shadow-sm hover:bg-white hover:shadow-md opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
        title="Refresh notifications from GitHub (Admin only)"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}

