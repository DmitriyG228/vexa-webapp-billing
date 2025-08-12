"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
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
import { Bot, Calendar, AlertCircle, Key, ArrowRight, Settings, Loader2 } from "lucide-react"
import { PageContainer, Section } from "@/components/ui/page-container"
import { Metric } from "@/components/ui/metric"

interface UserData {
  id: number
  email: string
  name?: string
  max_concurrent_bots: number
  data?: {
    subscription_end_date?: number | string
    subscription_status?: string
    subscription_tier?: string
    stripe_subscription_id?: string
    original_bot_count?: number
    subscription_scheduled_to_cancel?: boolean
    subscription_cancellation_date?: number | string
    subscription_current_period_end?: number | string
  }
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (sessionStatus !== "authenticated" || !(session?.user as any)?.id) {
        setIsLoading(false)
        return
      }

      // Check if this is a new user and redirect to trial checkout
      if ((session?.user as any)?.isNewUser) {
        console.log('[Dashboard] New user detected, redirecting to trial checkout')
        window.location.href = '/trial-checkout'
        return
      }

      try {
        const response = await fetch(`/api/admin/tokens?userId=${(session?.user as any).id}&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Dashboard API error:", response.status, errorData);
          throw new Error(errorData.detail || errorData.error || 'Failed to fetch user data')
        }
        
        const data = await response.json()
        console.log(`[Dashboard] Admin API returned:`, JSON.stringify(data, null, 2))
        setUserData(data)
        // No longer need to set bot count since we're using Stripe portal
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError(err instanceof Error ? err.message : 'Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [sessionStatus, session])

  // Pricing calculation functions (same as in DynamicPricingCard)
  const calculatePrice = (bots: number): number => {
    const perBotCost = 10 + 14 * Math.exp(-bots / 100);
    let basePrice = Math.round(bots * Math.max(10, perBotCost));
    basePrice = Math.max(120, basePrice);
    
    if (bots >= 180) {
      basePrice = Math.round(basePrice * 0.85);
    } else if (bots >= 30) {
      basePrice = Math.round(basePrice * 0.90);
    } else if (bots >= 5) {
      basePrice = Math.round(basePrice * 0.95);
    }
    
    return Math.max(120, Math.max(bots * 10, basePrice));
  }

  const getPricingTier = (bots: number): 'startup' | 'growth' | 'scale' => {
    if (bots < 30) return 'startup'
    if (bots < 180) return 'growth'
    return 'scale'
  }



  const handleOpenStripePortal = async () => {
    console.log('[Dashboard] Opening Stripe portal...')
    setIsOpeningPortal(true)
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      console.log('[Dashboard] Portal response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      console.log('[Dashboard] Redirecting to:', data.url)
      // Redirect to Stripe Customer Portal
      window.location.href = data.url
    } catch (error) {
      console.error('Error opening portal:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to open billing portal. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsOpeningPortal(false)
    }
  }

  const formatDate = (value?: number | string) => {
    if (value === undefined || value === null) return 'N/A'
    try {
      let ms: number
      if (typeof value === 'number') {
        // Treat as seconds if clearly a UNIX seconds value
        ms = value < 1e12 ? value * 1000 : value
      } else if (/^\d+$/.test(value)) {
        const num = Number(value)
        ms = num < 1e12 ? num * 1000 : num
      } else {
        ms = new Date(value).getTime()
      }
      if (Number.isNaN(ms)) return 'Invalid date'
      const date = new Date(ms)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return 'Invalid date'
    }
  }

  const formatDateTime = (value?: number | string) => {
    if (value === undefined || value === null) return 'N/A'
    try {
      let ms: number
      if (typeof value === 'number') {
        ms = value < 1e12 ? value * 1000 : value
      } else if (/^\d+$/.test(value)) {
        const num = Number(value)
        ms = num < 1e12 ? num * 1000 : num
      } else {
        ms = new Date(value).getTime()
      }
      if (Number.isNaN(ms)) return 'Invalid date'
      const date = new Date(ms)
      return date.toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'UTC', timeZoneName: 'short'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getSubscriptionStatus = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'scheduled_to_cancel':
        return <Badge className="bg-orange-100 text-orange-800">Scheduled to Cancel</Badge>
      case 'cancelling':
        return <Badge className="bg-yellow-100 text-yellow-800">Cancelling</Badge>
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>
      default:
        return <Badge variant="secondary">Free Plan</Badge>
    }
  }

  const isInGracePeriod = (status?: string) => {
    return status === 'cancelling' || status === 'scheduled_to_cancel'
  }

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Your current plan and usage</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-24" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-48" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (sessionStatus !== "authenticated") {
    return (
      <PageContainer>
        <Section>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to view your dashboard.
            </AlertDescription>
          </Alert>
        </Section>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <Section>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Your current plan and usage</p>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </Section>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Section>
        <Toaster />
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userData?.name || userData?.email || 'User'}
          </p>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Bot Limit */}
        <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
            <CardTitle className="text-sm font-medium">Current Bot Limit</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <Metric 
              value={(() => {
                const count = (userData?.max_concurrent_bots ?? 0)
                console.log(`[Dashboard] Bot count display: max_concurrent=${userData?.max_concurrent_bots}, status=${userData?.data?.subscription_status}, final=${count}`)
                return count
              })()} 
              unit={`bot${((userData?.max_concurrent_bots ?? 0) > 1) ? 's' : ''}`}
              size="lg"
            />
            <p className="text-xs text-muted-foreground">
              {userData?.data?.subscription_status === 'cancelling' ? (
                <>
                  Grace period - access until {userData?.data?.subscription_end_date ? formatDate(userData.data.subscription_end_date) : 'billing period ends'}
                </>
              ) : userData?.data?.subscription_status === 'trialing' ? (
                <>
                  Trial ends on {formatDateTime((userData?.data?.subscription_trial_end ?? userData?.data?.subscription_current_period_end) as any)}
                </>
              ) : userData?.data?.subscription_tier ? (
                `${userData.data.subscription_tier.charAt(0).toUpperCase() + userData.data.subscription_tier.slice(1)} Plan`
              ) : (
                'Free Plan'
              )}
            </p>
                  </CardContent>
                </Card>

        {/* Next Payment Due */}
        <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
            <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
              <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getSubscriptionStatus(userData?.data?.subscription_status)}
              </div>
              <div className="text-sm text-muted-foreground">
                {userData?.data?.subscription_status === 'active' || userData?.data?.subscription_status === 'cancelling' ? (
                  <>
                    {(userData?.data?.subscription_current_period_end ?? userData?.data?.subscription_end_date) ? (
                      `Next payment due: ${formatDate((userData?.data?.subscription_current_period_end ?? userData?.data?.subscription_end_date) as any)}`
                    ) : (
                      "Active subscription"
                    )}
                  </>
                ) : userData?.data?.subscription_status === 'trialing' ? (
                  <>Trial ends on {formatDateTime((userData?.data?.subscription_trial_end ?? userData?.data?.subscription_current_period_end) as any)}</>
                ) : userData?.data?.subscription_status === 'canceled' ? (
                  "Subscription canceled"
                ) : (
                  "No active subscription"
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Quick Access */}
        <Card className="lg:col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Manage your API keys for bot integration
              </p>
              <Link href="/dashboard/api-keys">
                <Button className="w-full" variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Manage API Keys
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Management Section - Always show manage subscription button */}
      <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Subscription Management</h2>
            <p className="text-muted-foreground text-sm">
              {userData?.data?.subscription_status === 'scheduled_to_cancel'
                ? "Your subscription is scheduled to cancel at the end of your current billing period. You can still manage it until then."
                : userData?.data?.subscription_status === 'cancelling' 
                ? "Your subscription is being cancelled. You can still manage it until the end of your billing period."
                : userData?.data?.subscription_status === 'trialing'
                ? "You're currently on a trial. Add a payment method to continue after your trial ends."
                : "Manage your subscription, payment methods, and billing information through Stripe's secure customer portal."
              }
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {userData?.data?.subscription_status === 'trialing' ? 'Manage Trial & Payment' : 'Manage Subscription'}
              </CardTitle>
              <CardDescription>
                {userData?.data?.subscription_status === 'scheduled_to_cancel'
                  ? "Your subscription will end soon. You can still manage your billing information and cancel the scheduled cancellation if needed."
                  : userData?.data?.subscription_status === 'trialing' 
                  ? "Add a payment method to continue using Vexa after your trial ends, or upgrade your plan through Stripe's secure customer portal."
                  : "Update your subscription, payment methods, and billing information through Stripe's secure customer portal."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={handleOpenStripePortal} 
                  disabled={isOpeningPortal}
                  className="w-full"
                >
                  {isOpeningPortal ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Opening Portal...
                    </>
                  ) : (
                    'Manage Subscription'
                  )}
                </Button>
                

              </div>
            </CardContent>
          </Card>
      </div>

      {/* Subscription Info */}
      {userData?.data?.stripe_subscription_id && (
        <div className="mt-6">
        <Card>
          <CardHeader>
              <CardTitle className="text-lg">Subscription Details</CardTitle>
          </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subscription ID:</span>
                <span className="text-sm font-mono">{userData.data.stripe_subscription_id}</span>
              </div>
              {userData.data.subscription_tier && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plan:</span>
                  <span className="text-sm">{userData.data.subscription_tier}</span>
                </div>
              )}
              {userData.data.subscription_status && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2">
                    {getSubscriptionStatus(userData.data.subscription_status)}
                  </div>
                </div>
              )}
              {/* Show cancellation information for scheduled cancellations */}
              {userData.data.subscription_scheduled_to_cancel && userData.data.subscription_cancellation_date && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cancellation Date:</span>
                    <span className="text-sm text-orange-600 font-medium">
                      {formatDate(userData.data.subscription_cancellation_date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Period End:</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(userData.data.subscription_current_period_end)}
                    </span>
                  </div>
                </>
              )}
          </CardContent>
        </Card>
        </div>
      )}
      </Section>
    </PageContainer>
  )
}

