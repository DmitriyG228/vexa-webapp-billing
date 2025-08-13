'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from 'next/navigation';

export function BlogRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    
    // Refresh the page data
    router.refresh();
    
    // Reset loading state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    // Set mounted state to prevent hydration mismatch
    setIsMounted(true);
    setLastRefresh(new Date());
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      handleRefresh();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <Button 
        onClick={handleRefresh} 
        disabled={isRefreshing}
        variant="outline" 
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
      {isMounted && lastRefresh && (
        <span className="text-xs text-muted-foreground">
          Last: {lastRefresh.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
