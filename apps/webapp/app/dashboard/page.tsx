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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Bot, Calendar, AlertCircle, Key, ArrowRight, Settings, Loader2, Shield, Mail, BarChart3, Eye, EyeOff, Copy, Check, Plus, Trash2, HelpCircle, ExternalLink } from "lucide-react"
import { PageContainer, Section } from "@/components/ui/page-container"
import { Metric } from "@/components/ui/metric"
import { NotificationBanner, NotificationItem } from "@/components/ui/notification-banner"
import { NotificationRefreshButton } from "@/components/dashboard/notification-refresh-button"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { Separator } from "@/components/ui/separator"

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

interface ApiKey {
  id: number
  token: string
  user_id: number
  created_at: string
  name?: string
  prefix?: string
  active?: boolean
  lastUsed?: string | null
  expiredAt?: string | null
  type?: 'live' | 'test'
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({})
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<number | "new" | null>(null)
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false)



  useEffect(() => {
    const fetchUserData = async () => {
      if (sessionStatus !== "authenticated" || !(session?.user as any)?.id) {
        setIsLoading(false)
        return
      }

      // New users can access the dashboard directly - no trial checkout redirect needed

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

  // Fetch system notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications')
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        }
      } catch (err) {
        console.error("Error fetching notifications:", err)
        // Silently fail - don't show errors to users
      }
    }

    fetchNotifications()
  }, [])

  // Fetch API keys
  const fetchApiKeys = async () => {
    if (sessionStatus !== "authenticated" || !(session?.user as any)?.id) {
      setApiKeys([])
      return
    }
    
    const userId = (session?.user as any)?.id
    if (!userId) return

    setIsLoadingApiKeys(true)
    try {
      const response = await fetch(`/api/admin/tokens?userId=${encodeURIComponent(userId)}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.error || 'Failed to fetch API keys')
      }
      
      const data = await response.json()
      setApiKeys(data.api_tokens || [])
    } catch (err) {
      console.error("Error fetching API keys:", err)
      setApiKeys([])
    } finally {
      setIsLoadingApiKeys(false)
    }
  }

  // Fetch API keys when session is loaded
  useEffect(() => {
    fetchApiKeys()
  }, [sessionStatus, session])

  // Format API key date
  const formatApiKeyDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Toggle key visibility
  const toggleKeyVisibility = (keyId: number) => {
    setVisibleKeys((prev: Record<number, boolean>) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  // Copy key to clipboard
  const copyToClipboard = (keyId: number | "new", fullKey: string) => {
    if (!fullKey) return
    navigator.clipboard.writeText(fullKey)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)

    toast({
      title: "API key copied",
      description: "The API key has been copied to your clipboard.",
      duration: 3000,
    })
  }

  // Create new API key
  const createNewApiKey = async () => {
    if (sessionStatus !== "authenticated" || !(session?.user as any)?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create an API key.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const userId = (session?.user as any)?.id
    setError(null)

    try {
      const response = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: Number(userId) }),
      })

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}))
        throw new Error(errorResult.detail || errorResult.error || 'Failed to create API key')
      }

      const result = await response.json()

      // Re-fetch keys after successful creation
      await fetchApiKeys()

      setNewKeyDialogOpen(false)

      toast({
        title: "API key created",
        description: result.message || "Your new API key has been successfully created.",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      toast({
        title: "Error creating key",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Revoke API key
  const revokeApiKey = async (keyId: number) => {
    const userId = (session?.user as any)?.id
    if (!userId) {
      toast({ title: "Error", description: "User session not found.", variant: "destructive" })
      return
    }

    try {
      const response = await fetch(`/api/admin/tokens/${keyId}`, {
        method: 'DELETE',
      })

      if (response.status === 204 || response.ok) {
        await fetchApiKeys()
        toast({
          title: "API key revoked",
          description: "The API key has been revoked.",
        })
      } else {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.detail || result.error || 'Failed to revoke API key')
      }
    } catch (err) {
      toast({
        title: "Error revoking key",
        description: err instanceof Error ? err.message : 'Could not revoke API key.',
        variant: "destructive",
      })
    }
  }

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
      const response = await fetch('/api/stripe/resolve-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context: 'dashboard' }),
      })

      const data = await response.json()
      console.log('[Dashboard] Portal response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve billing URL')
      }

      console.log('[Dashboard] Redirecting to:', data.url)
      window.location.href = data.url
    } catch (error) {
      console.error('Error resolving billing URL:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to continue. Please try again.',
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
            <p className="text-sm text-muted-foreground">Bots dashboard</p>
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
        <div className="space-y-8">
          {/* Dashboard Tabs */}
          <DashboardTabs />
          
          {/* Header Section - Improved spacing and typography */}
          <div className="mb-8 space-y-4 relative">
            <NotificationRefreshButton />
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <p className="text-sm text-muted-foreground">
                  Bots dashboard
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

          {/* System Notifications */}
          <NotificationBanner notifications={notifications} />

          {/* First Row: Current Bot Limit + Subscription Status + Manage Subscription */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Current Bot Limit */}
                <div className="flex items-baseline gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Current Bot Limit</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <Metric 
                        value={(() => {
                          const count = (userData?.max_concurrent_bots ?? 0)
                          console.log(`[Dashboard] Bot count display: max_concurrent=${userData?.max_concurrent_bots}, status=${userData?.data?.subscription_status}, final=${count}`)
                          return count
                        })()} 
                        unit={`bot${((userData?.max_concurrent_bots ?? 0) > 1) ? 's' : ''}`}
                        size="lg"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userData?.data?.subscription_status === 'cancelling' ? (
                        <>
                          Grace period - access until {userData?.data?.subscription_end_date ? formatDate(userData.data.subscription_end_date) : 'billing period ends'}
                        </>
                      ) : userData?.data?.subscription_status === 'trialing' ? (
                        <>
                          Trial ends on {formatDateTime((userData?.data?.subscription_current_period_end ?? userData?.data?.subscription_end_date) as any)}
                        </>
                      ) : userData?.data?.subscription_tier ? (
                        `${userData.data.subscription_tier.charAt(0).toUpperCase() + userData.data.subscription_tier.slice(1)} Plan`
                      ) : (
                        'Free Plan'
                      )}
                    </p>
                  </div>
                </div>

                {/* Subscription Status */}
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Subscription Status</span>
                    </div>
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
                          <>Trial ends on {formatDateTime((userData?.data?.subscription_current_period_end ?? userData?.data?.subscription_end_date) as any)}</>
                        ) : userData?.data?.subscription_status === 'canceled' ? (
                          "Subscription canceled"
                        ) : (
                          "No active subscription"
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manage Subscription Button */}
                <div className="flex items-center">
                  <Button 
                    onClick={handleOpenStripePortal} 
                    disabled={isOpeningPortal}
                    size="sm"
                    className="h-8"
                  >
                    {isOpeningPortal ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <Settings className="h-3.5 w-3.5 mr-1.5" />
                        Manage Subscription
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Keys Management */}
          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage your API keys for bot integration
              </p>
              
              {isLoadingApiKeys ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Loading API keys...</span>
                </div>
              ) : apiKeys.filter((key: ApiKey) => key.active !== false).length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">No API keys yet. Create your first key to get started.</p>
                  <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Create API Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create new API key</DialogTitle>
                        <DialogDescription>
                          Click create to generate a new API key. You will only be able to view the key once.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setNewKeyDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            createNewApiKey()
                          }} 
                          disabled={sessionStatus !== 'authenticated'}
                        >
                          Create API key
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys
                    .filter((key: ApiKey) => key.active !== false)
                    .map((key: ApiKey) => (
                      <div key={key.id} className="space-y-3 pb-3 border-b last:border-b-0 last:pb-0">
                        {/* First row: Label and masked key with delete button */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Your API key</p>
                            <p className="text-xs text-muted-foreground">
                              {key.prefix || "sk_"}...{key.token.slice(-4)}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" disabled={sessionStatus !== 'authenticated'}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Revoke key</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke API key</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to revoke this API key? This action cannot be undone, and any
                                  applications using this key will no longer be able to access the API.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => revokeApiKey(key.id)}
                                  disabled={sessionStatus !== 'authenticated'}
                                >
                                  Revoke
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        {/* Second row: Full API key input with visibility toggle and copy button - Always displayed */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              type={visibleKeys[key.id] ? "text" : "password"}
                              value={key.token}
                              readOnly
                              className="pr-10 font-mono text-xs"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-1"
                              onClick={() => toggleKeyVisibility(key.id)}
                            >
                              {visibleKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              <span className="sr-only">{visibleKeys[key.id] ? "Hide key" : "Show key"}</span>
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => copyToClipboard(key.id, key.token)}
                          >
                            {copiedKey === key.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            <span className="sr-only">Copy key</span>
                          </Button>
                        </div>
                        {/* Third row: Created date */}
                        <div className="text-xs text-muted-foreground">Created: {formatApiKeyDate(key.created_at)}</div>
                      </div>
                    ))}
                  <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create API Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create new API key</DialogTitle>
                        <DialogDescription>
                          Click create to generate a new API key. You will only be able to view the key once.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setNewKeyDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            createNewApiKey()
                          }} 
                          disabled={sessionStatus !== 'authenticated'}
                        >
                          Create API key
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

          {/* Subscription Info */}
          {userData?.data?.stripe_subscription_id && (
            <>
              <Separator className="my-8" />
              <div>
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
            </>
          )}
        </div>
      </Section>
    </PageContainer>
  )
}

