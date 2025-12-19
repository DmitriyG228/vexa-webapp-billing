"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import confetti from 'canvas-confetti'
import { 
  AlertCircle, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  Key, 
  Loader2, 
  CreditCard, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Edit2, 
  X, 
  Save, 
  MoreHorizontal,
  RefreshCw,
  Sparkles,
  Clock,
  Calendar,
  HelpCircle,
  ExternalLink
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageContainer, Section } from "@/components/ui/page-container"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Activity } from "lucide-react"
import { UsageChart } from "@/components/UsageChart"

interface ApiToken {
  id: number;
  token: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

interface TokensResponse {
  user_id: number;
  email: string;
  balance_minutes: number;
  tokens: ApiToken[];
}

interface UsageStats {
  balance_minutes: number;
  total_purchased_minutes: number;
  total_used_minutes: number;
  user_id: number;
  email: string;
  usage_history: Array<{ date: string; minutes: number }>;
  statistics: {
    period_days: number;
    total_minutes_last_period: number;
    average_daily_minutes: number;
    days_with_usage: number;
  };
}

export default function TranscriptionPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tokensData, setTokensData] = useState<TokensResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseAmount, setPurchaseAmount] = useState<string>("5.00");
  const [creating, setCreating] = useState(false);
  const [deletingTokenId, setDeletingTokenId] = useState<number | null>(null);
  const [editingTokenId, setEditingTokenId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newTokenName, setNewTokenName] = useState("");
  const [showTokenId, setShowTokenId] = useState<number | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const fetchTokens = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !session?.user?.email) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transcription/tokens?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || 'Failed to fetch tokens');
      }

      const data = await response.json();
      setTokensData(data);
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [sessionStatus, session]);

  const fetchUsageStats = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !session?.user?.email) {
      return;
    }

    setIsLoadingStats(true);
    try {
      const response = await fetch(`/api/transcription/usage?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to fetch usage statistics');
      }

      const data = await response.json();
      setUsageStats(data);
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      // Set a default empty stats object so the section still shows
      setUsageStats({
        balance_minutes: 0,
        total_purchased_minutes: 0,
        total_used_minutes: 0,
        user_id: 0,
        email: session?.user?.email || '',
        usage_history: [],
        statistics: {
          period_days: 30,
          total_minutes_last_period: 0,
          average_daily_minutes: 0,
          days_with_usage: 0,
        },
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [sessionStatus, session]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchTokens();
      fetchUsageStats();
    }
  }, [sessionStatus, fetchTokens, fetchUsageStats]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      signIn("google", { callbackUrl: "/dashboard/transcription" });
    }
  }, [sessionStatus]);

  // Handle payment success/cancelled from Stripe redirect
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    
    if (paymentStatus === 'success') {
      // Trigger confetti celebration
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from left
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        // Launch confetti from right
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // Show success toast
      toast({
        title: "🎉 Payment Successful!",
        description: "Your transcription minutes have been added to your account. Your balance will update shortly.",
        duration: 8000,
      });

      // Reload data from database
      fetchTokens();
      fetchUsageStats();

      // Clean up URL by removing query parameter
      router.replace('/dashboard/transcription', { scroll: false });
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. No charges were made.",
        variant: "default",
        duration: 5000,
      });

      // Clean up URL
      router.replace('/dashboard/transcription', { scroll: false });
    }
  }, [searchParams, router, fetchTokens, fetchUsageStats]);

  const quickPickAmounts = [5, 10, 20, 50, 100];
  
  const handleQuickPick = (amount: number) => {
    setPurchaseAmount(amount.toString());
  };

  const handlePurchase = async () => {
    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount < 5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum purchase is $5.00",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(true);
    try {
      // Create form data with USD amount
      const formData = new URLSearchParams();
      formData.append('amount_usd', amount.toString());
      const formDataString = formData.toString();
      console.log('💰 Creating purchase link with amount:', amount);
      console.log('💰 Form data string:', formDataString);
      
      // Use the API route which handles authentication and uses server-side env vars
      console.log('Creating purchase link via API route...');
      let response: Response;
      try {
        response = await fetch('/api/transcription/purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formDataString, // Use string instead of URLSearchParams object
        });
      } catch (networkError) {
        console.error('Network error during purchase request:', networkError);
        throw new Error(`Network error: ${networkError instanceof Error ? networkError.message : 'Failed to connect to server'}`);
      }

      // Log response details immediately
      const responseStatus = response.status;
      const responseStatusText = response.statusText;
      const contentType = response.headers.get('content-type') || 'unknown';
      
      console.log('Purchase API response:', {
        status: responseStatus,
        statusText: responseStatusText,
        contentType: contentType,
        ok: response.ok
      });

      if (!response.ok) {
        // Try to get error details - first as JSON, then as text
        let errorData: any = null;
        let errorText = '';
        
        try {
          if (contentType.includes('application/json')) {
            errorData = await response.json();
            console.log('Parsed error JSON:', errorData);
          } else {
            errorText = await response.text();
            console.log('Error response text:', errorText);
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          // Try to get text as fallback
          try {
            const text = await response.text();
            errorText = text || 'Unable to read error response';
            console.log('Fallback error text:', errorText);
          } catch (textError) {
            console.error('Failed to read error response as text:', textError);
            errorText = 'Unable to read error response';
          }
        }
        
        // Build a helpful error message
        let errorMessage = errorData?.detail || errorData?.error || errorText || `HTTP ${responseStatus}: ${responseStatusText}`;
        
        const errorInfo = {
          status: responseStatus,
          statusText: responseStatusText,
          contentType: contentType,
          errorData: errorData,
          errorText: errorText,
        };
        
        console.error('Purchase API error details:', JSON.stringify(errorInfo, null, 2));
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.payment_url) {
        console.error('Purchase response missing payment_url:', data);
        throw new Error('No payment URL received from server. Please try again or contact support.');
      }
      
      // Open Stripe checkout page in a new window
      console.log('Opening Stripe payment URL:', data.payment_url);
      const stripeWindow = window.open(data.payment_url, '_blank');
      
      if (!stripeWindow) {
        // Popup was blocked - copy URL to clipboard and show message
        try {
          await navigator.clipboard.writeText(data.payment_url);
          toast({
            title: "Popup Blocked",
            description: "Payment URL copied to clipboard. Please paste it in a new tab to complete your purchase.",
            variant: "default",
            duration: 10000,
          });
        } catch (clipboardError) {
          // Clipboard API not available - just show the URL
          toast({
            title: "Popup Blocked",
            description: `Please allow popups or manually open: ${data.payment_url}`,
            variant: "default",
            duration: 10000,
          });
        }
      } else {
        toast({
          title: "Payment link opened",
          description: "Complete your purchase in the new window. Your balance will update automatically.",
        });
      }
    } catch (err) {
      const errorDetails = {
        message: err instanceof Error ? err.message : String(err),
        name: err instanceof Error ? err.name : 'Unknown',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      };
      console.error('Error creating payment link:', errorDetails);
      console.error('Full error object:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment link';
      const isInvalidTokenError = errorMessage.includes('Invalid') || errorMessage.includes('token');
      
      // If it's an invalid token error, refresh tokens
      if (isInvalidTokenError) {
        console.log('Invalid token detected, refreshing tokens...');
        await fetchTokens();
        toast({
          title: "Token Issue",
          description: errorMessage + " Your tokens have been refreshed. Please try again or create a new API token.",
          variant: "destructive",
          duration: 8000,
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the token",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/transcription/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token_name: newTokenName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to create token');
      }

      const data = await response.json();
      toast({
        title: "Token created",
        description: `API token "${data.name}" has been created successfully.`,
      });
      
      setNewTokenName("");
      setCreateDialogOpen(false);
      await fetchTokens();
    } catch (err) {
      console.error('Error creating token:', err);
      toast({
        title: "Error creating token",
        description: err instanceof Error ? err.message : 'Could not create token.',
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteToken = async (tokenId: number) => {
    setDeletingTokenId(tokenId);
    try {
      const response = await fetch(`/api/transcription/tokens/${tokenId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to delete token');
      }

      toast({
        title: "Token deleted",
        description: "The API token has been deleted successfully.",
      });
      
      await fetchTokens();
    } catch (err) {
      console.error('Error deleting token:', err);
      toast({
        title: "Error deleting token",
        description: err instanceof Error ? err.message : 'Could not delete token.',
        variant: "destructive",
      });
    } finally {
      setDeletingTokenId(null);
    }
  };

  const handleStartEdit = (token: ApiToken) => {
    setEditingTokenId(token.id);
    setEditingName(token.name);
  };

  const handleCancelEdit = () => {
    setEditingTokenId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (tokenId: number) => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Token name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/transcription/tokens/${tokenId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token_name: editingName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to update token');
      }

      toast({
        title: "Token updated",
        description: "The token name has been updated successfully.",
      });
      
      setEditingTokenId(null);
      setEditingName("");
      await fetchTokens();
    } catch (err) {
      console.error('Error updating token:', err);
      toast({
        title: "Error updating token",
        description: err instanceof Error ? err.message : 'Could not update token.',
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const copyToClipboard = (token: string, tokenId: number) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(tokenId);
    setTimeout(() => setCopiedTokenId(null), 2000);
    toast({
      title: "API key copied",
      description: "The transcription API key has been copied to your clipboard.",
      duration: 3000,
    });
  };

  if (sessionStatus === "loading") {
    return (
      <PageContainer>
        <Section>
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Section>
      </PageContainer>
    );
  }

  if (sessionStatus !== "authenticated") {
    return (
      <PageContainer>
        <Section>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Redirecting to sign in...</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Please wait while we redirect you to the authentication page.
              </p>
            </CardContent>
          </Card>
        </Section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Section>
        {/* Header Section - Improved spacing and typography */}
        <div className="mb-8 space-y-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Transcription Service</h1>
              <p className="text-muted-foreground text-sm">
                Manage your API keys and transcription minutes. Create multiple keys for different applications.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="shrink-0"
            >
              <a 
                href="https://discord.gg/KXpwveJewr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Support
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>

        {/* Loading State - Improved skeleton */}
        {isLoading && !tokensData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full rounded-lg" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-80" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-md" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State - Improved design */}
        {error && !isLoading && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-destructive/10 p-2 shrink-0">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <strong className="text-destructive">Error loading data</strong>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTokens}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Enhanced design */}
        <div className="space-y-6">
          {/* Account Balance - Always visible */}
          {tokensData && !isLoading && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-1.5">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Account Balance</CardTitle>
                      <CardDescription className="text-xs">
                        Your current transcription minutes
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* Balance */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight">{tokensData.balance_minutes.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                  
                  {/* Purchase Section - Inline */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative w-24">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none z-10">$</span>
                      <Input
                        id="purchase-amount"
                        type="number"
                        min="5"
                        step="0.01"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        className="pl-7 pr-2 h-8 text-sm"
                        placeholder="5"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {quickPickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={purchaseAmount === amount.toString() ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleQuickPick(amount)}
                          className="h-8 px-2 text-xs"
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    <Button
                      onClick={handlePurchase}
                      disabled={purchasing || !tokensData?.tokens || tokensData.tokens.length === 0 || !purchaseAmount || parseFloat(purchaseAmount) < 5}
                      size="sm"
                      className="h-8"
                    >
                      {purchasing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                          Buy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {purchaseAmount && parseFloat(purchaseAmount) >= 5 && (
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    ≈ {Math.round(parseFloat(purchaseAmount) / 0.0015).toLocaleString()} min
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  $0.0015 per minute • Minimum: $5.00
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tabs for API Keys, Usage Statistics, and Usage Examples */}
          {tokensData && !isLoading && (
            <Tabs defaultValue="api-keys" className="w-full">
              <TabsList className="flex w-full">
                <TabsTrigger value="api-keys" className="flex-1">
                  <Key className="h-4 w-4 mr-2" />
                  API Keys
                </TabsTrigger>
                <TabsTrigger value="usage" className="flex-1">
                  <Activity className="h-4 w-4 mr-2" />
                  Usage Statistics
                </TabsTrigger>
                <TabsTrigger value="examples" className="flex-1">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Usage Examples
                </TabsTrigger>
              </TabsList>

              {/* API Keys Tab */}
              <TabsContent value="api-keys" className="mt-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">API Keys</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage your API keys for different applications and environments
                        </p>
                      </div>
                      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="h-8 px-2.5 text-xs">
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Create API Key
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Create New API Key</DialogTitle>
                            <DialogDescription>
                              Create a new API key with a descriptive name to organize your keys.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="token-name">Token Name</Label>
                              <Input
                                id="token-name"
                                placeholder="e.g., Production API, Development, CLI Tool"
                                value={newTokenName}
                                onChange={(e) => setNewTokenName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !creating && newTokenName.trim()) {
                                    handleCreateToken();
                                  }
                                }}
                              />
                              <p className="text-xs text-muted-foreground">
                                Choose a descriptive name to help identify this key later.
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateToken} disabled={creating || !newTokenName.trim()}>
                              {creating ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                'Create'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {tokensData.tokens.length === 0 ? (
                      <Empty className="border border-dashed py-12">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Key className="h-6 w-6" />
                          </EmptyMedia>
                          <EmptyTitle>No API Keys</EmptyTitle>
                          <EmptyDescription>
                            Create your first API key to start using the transcription service.
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create API Key
                          </Button>
                        </EmptyContent>
                      </Empty>
                    ) : (
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[220px]">Name</TableHead>
                              <TableHead>Token</TableHead>
                              <TableHead className="w-[100px]">Status</TableHead>
                              <TableHead className="w-[130px]">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  Created
                                </div>
                              </TableHead>
                              <TableHead className="w-[130px]">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  Last Used
                                </div>
                              </TableHead>
                              <TableHead className="text-right w-[60px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tokensData.tokens.map((token, index) => (
                              <TableRow key={token.id} className="group">
                                <TableCell className="font-medium">
                                  {editingTokenId === token.id ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSaveEdit(token.id);
                                          } else if (e.key === 'Escape') {
                                            handleCancelEdit();
                                          }
                                        }}
                                        className="h-8 w-36"
                                        autoFocus
                                      />
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        onClick={() => handleSaveEdit(token.id)}
                                      >
                                        <Save className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        onClick={handleCancelEdit}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <div className="rounded-md bg-primary/10 p-1.5">
                                        <Key className="h-3.5 w-3.5 text-primary" />
                                      </div>
                                      <span className="font-medium">{token.name}</span>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleStartEdit(token)}
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 max-w-md">
                                    <div className="relative flex-1">
                                      <Input
                                        type={showTokenId === token.id ? "text" : "password"}
                                        value={token.token}
                                        readOnly
                                        className="pr-10 font-mono text-xs bg-muted/50"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                                        onClick={() => setShowTokenId(showTokenId === token.id ? null : token.id)}
                                      >
                                        {showTokenId === token.id ? (
                                          <EyeOff className="h-3.5 w-3.5" />
                                        ) : (
                                          <Eye className="h-3.5 w-3.5" />
                                        )}
                                      </Button>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 shrink-0"
                                      onClick={() => copyToClipboard(token.token, token.id)}
                                    >
                                      {copiedTokenId === token.id ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {token.is_active ? (
                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(token.created_at).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {token.last_used_at ? (
                                    new Date(token.last_used_at).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    })
                                  ) : (
                                    <span className="text-muted-foreground/60">Never</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={() => copyToClipboard(token.token, token.id)}
                                      >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy token
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleStartEdit(token)}
                                        disabled={editingTokenId === token.id}
                                      >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete the API key <strong>"{token.name}"</strong>? This action cannot be undone. Any applications using this key will no longer be able to access the API.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                              onClick={() => handleDeleteToken(token.id)}
                                              disabled={deletingTokenId === token.id}
                                            >
                                              {deletingTokenId === token.id ? (
                                                <>
                                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                  Deleting...
                                                </>
                                              ) : (
                                                'Delete'
                                              )}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Usage Statistics Tab */}
              <TabsContent value="usage" className="mt-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {isLoadingStats ? (
                      <>
                        <div className="space-y-4">
                          <div>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                          <div className="flex items-center gap-6 py-3">
                            {[1, 2, 3, 4].map((i) => (
                              <React.Fragment key={i}>
                                <Skeleton className="flex-1 h-16" />
                                {i < 4 && <Separator orientation="vertical" className="h-12" />}
                              </React.Fragment>
                            ))}
                          </div>
                          <Skeleton className="h-[200px] w-full rounded-lg" />
                        </div>
                      </>
                    ) : usageStats ? (
                      <>
                        <div>
                          <h3 className="text-lg font-semibold">Usage Statistics</h3>
                          <p className="text-sm text-muted-foreground">
                            Your transcription usage over the last {usageStats.statistics.period_days} days
                          </p>
                        </div>
                        {/* Summary Stats - Single Line */}
                        <div className="flex items-center gap-6 py-3">
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">Total Used</div>
                            <div className="text-lg font-semibold">{usageStats.total_used_minutes.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">minutes</div>
                          </div>
                          <Separator orientation="vertical" className="h-12" />
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">Total Purchased</div>
                            <div className="text-lg font-semibold">{usageStats.total_purchased_minutes.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">minutes</div>
                          </div>
                          <Separator orientation="vertical" className="h-12" />
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">Last {usageStats.statistics.period_days} Days</div>
                            <div className="text-lg font-semibold">{usageStats.statistics.total_minutes_last_period.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">minutes</div>
                          </div>
                          <Separator orientation="vertical" className="h-12" />
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">Daily Average</div>
                            <div className="text-lg font-semibold">{usageStats.statistics.average_daily_minutes.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">minutes/day</div>
                          </div>
                        </div>

                        {/* Usage Chart */}
                        {usageStats.usage_history.length > 0 && (
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <Label className="text-sm font-medium">Daily Usage</Label>
                              <Badge variant="secondary" className="text-xs">
                                {usageStats.statistics.days_with_usage} days with usage
                              </Badge>
                            </div>
                            <UsageChart data={usageStats.usage_history} />
                          </div>
                        )}

                        {usageStats.usage_history.length === 0 && (
                          <div className="rounded-lg border border-dashed p-8 text-center">
                            <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">No usage data available yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Start using the transcription API to see statistics</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Unable to load usage statistics</p>
                        <p className="text-xs text-muted-foreground mt-1">Please try refreshing the page</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Usage Examples Tab */}
              <TabsContent value="examples" className="mt-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">API Usage Examples</h3>
                      <p className="text-sm text-muted-foreground">
                        Code examples for using your API keys with the transcription service
                      </p>
                    </div>
                    <Tabs defaultValue="curl" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="node">Node.js</TabsTrigger>
                      </TabsList>
                      <TabsContent value="curl" className="mt-4">
                        <div className="rounded-lg bg-muted p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-mono text-muted-foreground">cURL</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => {
                                const code = `curl -X POST https://transcription.vexa.ai/v1/audio/transcriptions \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "file=@audio.mp3"`
                                navigator.clipboard.writeText(code);
                                toast({
                                  title: "Code copied",
                                  description: "cURL example copied to clipboard",
                                });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <pre className="text-xs font-mono overflow-x-auto">
                            <code>{`curl -X POST https://transcription.vexa.ai/v1/audio/transcriptions \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "file=@audio.mp3"`}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="javascript" className="mt-4">
                        <div className="rounded-lg bg-muted p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-mono text-muted-foreground">JavaScript (Fetch)</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => {
                                const code = `const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('https://transcription.vexa.ai/v1/audio/transcriptions', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: formData
});

const data = await response.json();`
                                navigator.clipboard.writeText(code);
                                toast({
                                  title: "Code copied",
                                  description: "JavaScript example copied to clipboard",
                                });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <pre className="text-xs font-mono overflow-x-auto">
                            <code>{`const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(
  'https://transcription.vexa.ai/v1/audio/transcriptions',
  {
    method: 'POST',
    headers: {
      'X-API-Key': 'YOUR_API_KEY'
    },
    body: formData
  }
);

const data = await response.json();`}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="python" className="mt-4">
                        <div className="rounded-lg bg-muted p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-mono text-muted-foreground">Python (requests)</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => {
                                const code = `import requests

url = "https://transcription.vexa.ai/v1/audio/transcriptions"
headers = {"X-API-Key": "YOUR_API_KEY"}

with open("audio.mp3", "rb") as f:
    files = {"file": f}
    response = requests.post(url, headers=headers, files=files)

data = response.json()`
                                navigator.clipboard.writeText(code);
                                toast({
                                  title: "Code copied",
                                  description: "Python example copied to clipboard",
                                });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <pre className="text-xs font-mono overflow-x-auto">
                            <code>{`import requests

url = "https://transcription.vexa.ai/v1/audio/transcriptions"
headers = {"X-API-Key": "YOUR_API_KEY"}

with open("audio.mp3", "rb") as f:
    files = {"file": f}
    response = requests.post(url, headers=headers, files=files)

data = response.json()`}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="node" className="mt-4">
                        <div className="rounded-lg bg-muted p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-mono text-muted-foreground">Node.js</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => {
                                const code = `const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('audio.mp3'));

const response = await axios.post(
  'https://transcription.vexa.ai/v1/audio/transcriptions',
  form,
  {
    headers: {
      'X-API-Key': 'YOUR_API_KEY',
      ...form.getHeaders()
    }
  }
);

console.log(response.data);`
                                navigator.clipboard.writeText(code);
                                toast({
                                  title: "Code copied",
                                  description: "Node.js example copied to clipboard",
                                });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <pre className="text-xs font-mono overflow-x-auto">
                            <code>{`const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('audio.mp3'));

const response = await axios.post(
  'https://transcription.vexa.ai/v1/audio/transcriptions',
  form,
  {
    headers: {
      'X-API-Key': 'YOUR_API_KEY',
      ...form.getHeaders()
    }
  }
);

console.log(response.data);`}</code>
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 p-3 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <p className="text-xs text-blue-900 dark:text-blue-100">
                          Replace <code className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs font-mono">YOUR_API_KEY</code> with your actual API key from the API Keys tab.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Account Info Card - Refined */}
          {tokensData && !isLoading && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{tokensData.email}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <span className="text-sm font-medium font-mono">{tokensData.user_id}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Toaster />
      </Section>
    </PageContainer>
  );
}
