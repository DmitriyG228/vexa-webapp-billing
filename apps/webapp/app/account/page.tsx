"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Check, Copy, Eye, EyeOff, Key, Loader2, Plus, Trash2 } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApiKey {
  id: number
  token: string
  user_id: number
  created_at: string
  name?: string
  prefix?: string
  active?: boolean
  is_active?: boolean
  lastUsed?: string | null
  last_used_at?: string | null
}

interface UserData {
  id: number
  email: string
  name?: string
  max_concurrent_bots: number
  api_tokens?: ApiKey[]
  data?: {
    subscription_end_date?: number | string
    subscription_status?: string
    subscription_tier?: string
    stripe_subscription_id?: string
    subscription_scheduled_to_cancel?: boolean
    subscription_cancellation_date?: number | string
    subscription_current_period_end?: number | string
  }
}

interface UsageData {
  user_id: string
  email: string
  balance_minutes: number
  total_purchased_minutes: number
  total_used_minutes: number
  usage_history: { date: string; minutes: number }[]
  statistics: {
    period_days: number
    total_minutes: number
    average_daily_minutes: number
    days_with_usage: number
  }
}

interface BalanceData {
  balance_minutes: number
  remaining_minutes: number
  total_purchased_minutes: number
  total_used_minutes: number
}

interface MeetingsData {
  meeting_stats?: {
    total: number
    completed: number
    failed: number
  }
  usage_patterns?: {
    platforms: Record<string, number>
    peak_hours: number[]
  }
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "api-keys", label: "API Keys" },
  { id: "usage", label: "Usage" },
  { id: "billing", label: "Billing" },
] as const

type TabId = (typeof TABS)[number]["id"]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(value?: number | string) {
  if (value === undefined || value === null) return "N/A"
  try {
    let ms: number
    if (typeof value === "number") {
      ms = value < 1e12 ? value * 1000 : value
    } else if (/^\d+$/.test(value)) {
      const num = Number(value)
      ms = num < 1e12 ? num * 1000 : num
    } else {
      ms = new Date(value).getTime()
    }
    if (Number.isNaN(ms)) return "Invalid date"
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "Invalid date"
  }
}

function formatRelativeTime(dateString: string | null | undefined) {
  if (!dateString) return "-"
  const diffInSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const cardShadow = "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)"

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { data: session, status: sessionStatus } = useSession()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  // Data states
  const [userData, setUserData] = useState<UserData | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [meetingsData, setMeetingsData] = useState<MeetingsData | null>(null)

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API Keys states
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<number | null>(null)
  const [isCreatingKey, setIsCreatingKey] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState<number | null>(null)

  // Billing states
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)

  const userId = (session?.user as any)?.id

  // ─── SSO: handle returnUrl query param ──────────────────────────────────

  useEffect(() => {
    const returnUrl = searchParams?.get("returnUrl")
    if (!returnUrl) return

    if (sessionStatus === "authenticated") {
      // Validate returnUrl against trusted domains
      let ok = false
      try {
        const parsed = new URL(returnUrl)
        const trusted = ["vexa.ai", "localhost"]
        ok = trusted.some(d => parsed.hostname === d || parsed.hostname.endsWith("." + d))
      } catch {}
      if (!ok) return

      // Ensure SSO cookies are set before redirecting to the Dashboard
      fetch("/api/sso/prepare", { method: "POST" })
        .then(() => {
          window.location.href = returnUrl
        })
        .catch(() => {
          // Redirect anyway — cookies may have been set in signIn callback
          window.location.href = returnUrl
        })
    } else if (sessionStatus === "unauthenticated") {
      // Not signed in — kick off OAuth, preserving returnUrl through the flow
      const callbackUrl = `${window.location.pathname}?returnUrl=${encodeURIComponent(returnUrl)}`
      signIn(undefined, { callbackUrl })
    }
  }, [sessionStatus, searchParams])

  // ─── Fetch data ──────────────────────────────────────────────────────────

  const fetchUserData = useCallback(async () => {
    if (!userId) return
    try {
      const resp = await fetch(`/api/admin/tokens?userId=${encodeURIComponent(userId)}&_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      if (!resp.ok) throw new Error("Failed to fetch user data")
      const data = await resp.json()
      setUserData(data)
      setApiKeys(data.api_tokens || [])
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
    }
  }, [userId])

  const fetchUsage = useCallback(async () => {
    try {
      const resp = await fetch("/api/account/usage", { cache: "no-store" })
      if (resp.ok) {
        setUsageData(await resp.json())
      }
    } catch (err) {
      console.error("Error fetching usage:", err)
    }
  }, [])

  const fetchBalance = useCallback(async () => {
    try {
      const resp = await fetch("/api/account/balance", { cache: "no-store" })
      if (resp.ok) {
        setBalanceData(await resp.json())
      }
    } catch (err) {
      console.error("Error fetching balance:", err)
    }
  }, [])

  const fetchMeetings = useCallback(async () => {
    try {
      const resp = await fetch("/api/account/meetings", { cache: "no-store" })
      if (resp.ok) {
        setMeetingsData(await resp.json())
      }
    } catch (err) {
      console.error("Error fetching meetings:", err)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !userId) {
      setIsLoading(false)
      return
    }

    const loadAll = async () => {
      setIsLoading(true)
      await Promise.all([fetchUserData(), fetchUsage(), fetchBalance(), fetchMeetings()])
      setIsLoading(false)
    }
    loadAll()
  }, [sessionStatus, userId, fetchUserData, fetchUsage, fetchBalance, fetchMeetings])

  // ─── API Key actions ─────────────────────────────────────────────────────

  const createApiKey = async () => {
    if (!userId) return
    setIsCreatingKey(true)
    try {
      const resp = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId) }),
      })
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}))
        throw new Error(errData.detail || errData.error || "Failed to create API key")
      }
      await fetchUserData()
      setShowCreateDialog(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create key")
    } finally {
      setIsCreatingKey(false)
    }
  }

  const revokeApiKey = async (keyId: number) => {
    try {
      const resp = await fetch(`/api/admin/tokens/${keyId}`, { method: "DELETE" })
      if (resp.status === 204 || resp.ok) {
        await fetchUserData()
        setShowRevokeDialog(null)
      } else {
        throw new Error("Failed to revoke key")
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke key")
    }
  }

  const copyToClipboard = (keyId: number, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const toggleKeyVisibility = (keyId: number) => {
    setVisibleKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  // ─── Stripe portal ──────────────────────────────────────────────────────

  const handleOpenStripePortal = async () => {
    setIsOpeningPortal(true)
    try {
      const resp = await fetch("/api/stripe/resolve-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: "dashboard" }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || "Failed to open billing portal")
      window.location.href = data.url
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to open portal")
    } finally {
      setIsOpeningPortal(false)
    }
  }

  // ─── Loading / auth states ───────────────────────────────────────────────

  if (sessionStatus === "loading" || isLoading) {
    return (
      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="text-[15px] text-gray-400">Loading account...</span>
        </div>
      </section>
    )
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[15px] text-gray-500">Please sign in to view your account.</p>
        </div>
      </section>
    )
  }

  // ─── Subscription helpers ────────────────────────────────────────────────

  const subStatus = userData?.data?.subscription_status
  const subTier = userData?.data?.subscription_tier
  const periodEnd = userData?.data?.subscription_current_period_end ?? userData?.data?.subscription_end_date

  function StatusBadge({ status }: { status?: string }) {
    const styles: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      trialing: "bg-blue-50 text-blue-700 border-blue-200",
      cancelling: "bg-amber-50 text-amber-700 border-amber-200",
      scheduled_to_cancel: "bg-amber-50 text-amber-700 border-amber-200",
      canceled: "bg-red-50 text-red-700 border-red-200",
      past_due: "bg-red-50 text-red-700 border-red-200",
    }
    const labels: Record<string, string> = {
      active: "Active",
      trialing: "Trial",
      cancelling: "Cancelling",
      scheduled_to_cancel: "Cancelling",
      canceled: "Canceled",
      past_due: "Past Due",
    }
    const s = status || "free"
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
          styles[s] || "bg-gray-50 text-gray-500 border-gray-200"
        }`}
      >
        {labels[s] || "Free Plan"}
      </span>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <section className="py-10 lg:py-14">
      <div className="max-w-5xl mx-auto px-6">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950">Account</h1>
          <p className="mt-1 text-[14px] text-gray-500">
            Manage your API keys, usage, and billing.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-gray-950 border border-gray-200 shadow-sm"
                  : "bg-transparent text-gray-400 border border-transparent hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-[14px] text-red-700">
            {error}
          </div>
        )}

        {/* Tab content */}
        {activeTab === "overview" && (
          <OverviewTab
            userData={userData}
            balanceData={balanceData}
            usageData={usageData}
            subStatus={subStatus}
            subTier={subTier}
            periodEnd={periodEnd}
            StatusBadge={StatusBadge}
            onTabSwitch={setActiveTab}
            onOpenPortal={handleOpenStripePortal}
            isOpeningPortal={isOpeningPortal}
          />
        )}

        {activeTab === "api-keys" && (
          <ApiKeysTab
            apiKeys={apiKeys}
            visibleKeys={visibleKeys}
            copiedKey={copiedKey}
            isCreatingKey={isCreatingKey}
            showCreateDialog={showCreateDialog}
            showRevokeDialog={showRevokeDialog}
            onToggleVisibility={toggleKeyVisibility}
            onCopy={copyToClipboard}
            onCreate={createApiKey}
            onRevoke={revokeApiKey}
            onShowCreateDialog={setShowCreateDialog}
            onShowRevokeDialog={setShowRevokeDialog}
          />
        )}

        {activeTab === "usage" && (
          <UsageTab usageData={usageData} meetingsData={meetingsData} />
        )}

        {activeTab === "billing" && (
          <BillingTab
            userData={userData}
            balanceData={balanceData}
            subStatus={subStatus}
            subTier={subTier}
            periodEnd={periodEnd}
            StatusBadge={StatusBadge}
            onOpenPortal={handleOpenStripePortal}
            isOpeningPortal={isOpeningPortal}
          />
        )}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Overview
// ═══════════════════════════════════════════════════════════════════════════════

function OverviewTab({
  userData,
  balanceData,
  usageData,
  subStatus,
  subTier,
  periodEnd,
  StatusBadge,
  onTabSwitch,
  onOpenPortal,
  isOpeningPortal,
}: {
  userData: UserData | null
  balanceData: BalanceData | null
  usageData: UsageData | null
  subStatus?: string
  subTier?: string
  periodEnd?: number | string
  StatusBadge: React.ComponentType<{ status?: string }>
  onTabSwitch: (tab: TabId) => void
  onOpenPortal: () => void
  isOpeningPortal: boolean
}) {
  // Mini bar chart for last 14 days
  const last14 = usageData?.usage_history?.slice(-14) || []
  const maxMinutes = Math.max(...last14.map((d) => d.minutes), 1)

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <p className="text-[13px] text-gray-400 mb-1">Balance</p>
          <p className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950">
            {balanceData?.balance_minutes != null ? `${Math.round(balanceData.balance_minutes)}` : "--"}
          </p>
          <p className="text-[13px] text-gray-400">minutes remaining</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <p className="text-[13px] text-gray-400 mb-1">Total Used</p>
          <p className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950">
            {balanceData?.total_used_minutes != null ? `${Math.round(balanceData.total_used_minutes)}` : "--"}
          </p>
          <p className="text-[13px] text-gray-400">minutes all time</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <p className="text-[13px] text-gray-400 mb-1">Bot Limit</p>
          <p className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950">
            {userData?.max_concurrent_bots ?? "--"}
          </p>
          <p className="text-[13px] text-gray-400">concurrent bots</p>
        </div>
      </div>

      {/* Usage chart (last 14 days) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-950">Usage (last 14 days)</h3>
            <p className="text-[13px] text-gray-400">Minutes transcribed per day</p>
          </div>
          <button
            onClick={() => onTabSwitch("usage")}
            className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
          >
            View details &rarr;
          </button>
        </div>
        {last14.length > 0 ? (
          <div className="flex items-end gap-1 h-32">
            {last14.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-gray-950 min-h-[2px] transition-all"
                  style={{ height: `${Math.max((day.minutes / maxMinutes) * 100, 2)}%` }}
                  title={`${day.date}: ${day.minutes.toFixed(1)} min`}
                />
                {i % 2 === 0 && (
                  <span className="text-[10px] text-gray-300">
                    {new Date(day.date).getDate()}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <p className="text-[13px] text-gray-300">No usage data yet</p>
          </div>
        )}
      </div>

      {/* Subscription + Quick links row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-gray-950">Subscription</h3>
            <StatusBadge status={subStatus} />
          </div>
          <div className="space-y-2 text-[14px]">
            {subTier && (
              <div className="flex justify-between">
                <span className="text-gray-400">Plan</span>
                <span className="text-gray-950 font-medium capitalize">{subTier}</span>
              </div>
            )}
            {periodEnd && (
              <div className="flex justify-between">
                <span className="text-gray-400">Period ends</span>
                <span className="text-gray-700">{formatDate(periodEnd)}</span>
              </div>
            )}
          </div>
          <button
            onClick={onOpenPortal}
            disabled={isOpeningPortal}
            className="mt-4 w-full h-9 rounded-full border border-gray-200 text-[13.5px] font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isOpeningPortal ? "Opening..." : "Manage Subscription"}
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <h3 className="text-[15px] font-semibold text-gray-950 mb-3">Quick Links</h3>
          <div className="space-y-2">
            <button
              onClick={() => onTabSwitch("api-keys")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                Manage API Keys
              </span>
              <span className="text-gray-300">&rarr;</span>
            </button>
            <button
              onClick={() => onTabSwitch("usage")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Usage Details
              </span>
              <span className="text-gray-300">&rarr;</span>
            </button>
            <button
              onClick={() => onTabSwitch("billing")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Billing &amp; Subscription
              </span>
              <span className="text-gray-300">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: API Keys
// ═══════════════════════════════════════════════════════════════════════════════

function ApiKeysTab({
  apiKeys,
  visibleKeys,
  copiedKey,
  isCreatingKey,
  showCreateDialog,
  showRevokeDialog,
  onToggleVisibility,
  onCopy,
  onCreate,
  onRevoke,
  onShowCreateDialog,
  onShowRevokeDialog,
}: {
  apiKeys: ApiKey[]
  visibleKeys: Record<number, boolean>
  copiedKey: number | null
  isCreatingKey: boolean
  showCreateDialog: boolean
  showRevokeDialog: number | null
  onToggleVisibility: (id: number) => void
  onCopy: (id: number, value: string) => void
  onCreate: () => void
  onRevoke: (id: number) => void
  onShowCreateDialog: (v: boolean) => void
  onShowRevokeDialog: (v: number | null) => void
}) {
  const activeKeys = apiKeys.filter((k) => k.active !== false && k.is_active !== false)

  return (
    <div className="space-y-6">
      {/* Header + Create */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-gray-950">API Keys</h2>
          <p className="text-[14px] text-gray-500">Create and manage your API keys.</p>
        </div>
        <button
          onClick={() => onShowCreateDialog(true)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-gray-950 text-white text-[13.5px] font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Key
        </button>
      </div>

      {/* Trial banner */}
      <div className="p-5 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white" style={{ boxShadow: cardShadow }}>
        <p className="text-[14px] font-medium text-gray-950">Start 1-hour trial by issuing a new API key</p>
        <p className="text-[13px] text-gray-400 mt-1">
          Each new API key includes a fresh 1-hour trial with 1 bot access. Create another key anytime for a new trial.
        </p>
      </div>

      {/* Key list */}
      {activeKeys.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center" style={{ boxShadow: cardShadow }}>
          <Key className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[15px] font-medium text-gray-950 mb-1">No active API keys</p>
          <p className="text-[13px] text-gray-400 mb-4">Create your first API key to get started.</p>
          <button
            onClick={() => onShowCreateDialog(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-gray-950 text-white text-[13.5px] font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Create API Key
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeKeys.map((key) => (
            <div
              key={key.id}
              className="rounded-2xl border border-gray-200 bg-white p-5"
              style={{ boxShadow: cardShadow }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[15px] font-medium text-gray-950">
                    {key.name || `API Key ${key.id}`}
                  </p>
                  <p className="text-[13px] text-gray-400 font-mono">
                    {key.prefix || "sk_"}...{key.token.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={() => onShowRevokeDialog(key.id)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Revoke key"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Token input with show/copy */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={visibleKeys[key.id] ? "text" : "password"}
                    value={key.token}
                    readOnly
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-gray-200 bg-gray-50 font-mono text-[13px] text-gray-700 outline-none focus:border-gray-300"
                  />
                  <button
                    onClick={() => onToggleVisibility(key.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {visibleKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => onCopy(key.id, key.token)}
                  className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {copiedKey === key.id ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Trial badge for recently created keys */}
              {key.created_at && new Date(key.created_at).getTime() > Date.now() - 5 * 60 * 1000 && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-[12px] font-medium text-amber-800">1-Hour Trial Active</p>
                  <p className="text-[12px] text-amber-600 mt-0.5">
                    This key works for 1 hour with 1 bot. Add a payment method to continue.
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-[12px] text-gray-400">Created {formatDate(key.created_at)}</span>
                <span className="text-[12px] text-gray-400">
                  Last used {formatRelativeTime(key.last_used_at || key.lastUsed)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog (modal overlay) */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-[17px] font-semibold text-gray-950 mb-1">Create new API key</h3>
            <p className="text-[14px] text-gray-500 mb-6">
              Click create to generate a new API key. You will only be able to view the key once.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onShowCreateDialog(false)}
                className="h-9 px-4 rounded-full border border-gray-200 text-[13.5px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onCreate}
                disabled={isCreatingKey}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-gray-950 text-white text-[13.5px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isCreatingKey && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Create API key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke confirmation dialog */}
      {showRevokeDialog !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-[17px] font-semibold text-gray-950 mb-1">Revoke API key</h3>
            <p className="text-[14px] text-gray-500 mb-6">
              Are you sure? This action cannot be undone, and any applications using this key will lose access.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onShowRevokeDialog(null)}
                className="h-9 px-4 rounded-full border border-gray-200 text-[13.5px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onRevoke(showRevokeDialog)}
                className="h-9 px-4 rounded-full bg-red-600 text-white text-[13.5px] font-medium hover:bg-red-500 transition-colors"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Usage
// ═══════════════════════════════════════════════════════════════════════════════

function UsageTab({
  usageData,
  meetingsData,
}: {
  usageData: UsageData | null
  meetingsData: MeetingsData | null
}) {
  const history = usageData?.usage_history || []
  const maxMinutes = Math.max(...history.map((d) => d.minutes), 1)
  const stats = usageData?.statistics

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Minutes", value: stats?.total_minutes != null ? `${stats.total_minutes.toFixed(1)}` : "--" },
          { label: "Avg Daily", value: stats?.average_daily_minutes != null ? `${stats.average_daily_minutes.toFixed(1)}` : "--" },
          { label: "Active Days", value: stats?.days_with_usage != null ? `${stats.days_with_usage}` : "--" },
          { label: "Period", value: stats?.period_days != null ? `${stats.period_days} days` : "--" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5" style={{ boxShadow: cardShadow }}>
            <p className="text-[12px] text-gray-400 mb-1">{label}</p>
            <p className="text-[22px] font-semibold tracking-[-0.02em] text-gray-950">{value}</p>
          </div>
        ))}
      </div>

      {/* Large chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
        <h3 className="text-[15px] font-semibold text-gray-950 mb-1">Daily Usage</h3>
        <p className="text-[13px] text-gray-400 mb-4">Minutes transcribed per day over the last 30 days</p>
        {history.length > 0 ? (
          <div className="flex items-end gap-[3px] h-48">
            {history.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-gray-950 min-h-[2px] transition-all hover:bg-gray-700"
                  style={{ height: `${Math.max((day.minutes / maxMinutes) * 100, 1)}%` }}
                  title={`${day.date}: ${day.minutes.toFixed(1)} min`}
                />
                {i % 5 === 0 && (
                  <span className="text-[9px] text-gray-300 whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-[14px] text-gray-300">No usage data available</p>
          </div>
        )}
      </div>

      {/* Meeting analytics */}
      {meetingsData?.meeting_stats && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <h3 className="text-[15px] font-semibold text-gray-950 mb-4">Meeting Analytics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Meetings", value: meetingsData.meeting_stats.total },
              { label: "Completed", value: meetingsData.meeting_stats.completed },
              { label: "Failed", value: meetingsData.meeting_stats.failed },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[12px] text-gray-400 mb-0.5">{label}</p>
                <p className="text-[20px] font-semibold text-gray-950">{value}</p>
              </div>
            ))}
          </div>

          {meetingsData.usage_patterns?.platforms && Object.keys(meetingsData.usage_patterns.platforms).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[13px] text-gray-400 mb-2">Platforms</p>
              <div className="flex gap-2">
                {Object.entries(meetingsData.usage_patterns.platforms).map(([platform, count]) => (
                  <span
                    key={platform}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-gray-50 text-gray-700 border border-gray-200"
                  >
                    {platform} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Billing
// ═══════════════════════════════════════════════════════════════════════════════

function BillingTab({
  userData,
  balanceData,
  subStatus,
  subTier,
  periodEnd,
  StatusBadge,
  onOpenPortal,
  isOpeningPortal,
}: {
  userData: UserData | null
  balanceData: BalanceData | null
  subStatus?: string
  subTier?: string
  periodEnd?: number | string
  StatusBadge: React.ComponentType<{ status?: string }>
  onOpenPortal: () => void
  isOpeningPortal: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Subscription card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-semibold text-gray-950">Subscription</h3>
          <StatusBadge status={subStatus} />
        </div>
        <div className="space-y-3 text-[14px]">
          {subTier && (
            <div className="flex justify-between">
              <span className="text-gray-400">Plan</span>
              <span className="text-gray-950 font-medium capitalize">{subTier}</span>
            </div>
          )}
          {userData?.max_concurrent_bots != null && (
            <div className="flex justify-between">
              <span className="text-gray-400">Bot limit</span>
              <span className="text-gray-700">{userData.max_concurrent_bots} concurrent</span>
            </div>
          )}
          {periodEnd && (
            <div className="flex justify-between">
              <span className="text-gray-400">Period ends</span>
              <span className="text-gray-700">{formatDate(periodEnd)}</span>
            </div>
          )}
          {userData?.data?.subscription_scheduled_to_cancel && userData?.data?.subscription_cancellation_date && (
            <div className="flex justify-between">
              <span className="text-gray-400">Cancellation date</span>
              <span className="text-amber-600 font-medium">
                {formatDate(userData.data.subscription_cancellation_date)}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onOpenPortal}
          disabled={isOpeningPortal}
          className="mt-5 w-full h-10 rounded-full bg-gray-950 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {isOpeningPortal ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening...
            </>
          ) : (
            "Manage Subscription"
          )}
        </button>
      </div>

      {/* Balance card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
        <h3 className="text-[17px] font-semibold text-gray-950 mb-4">Transcription Balance</h3>
        <div className="space-y-3 text-[14px]">
          <div className="flex justify-between">
            <span className="text-gray-400">Remaining</span>
            <span className="text-gray-950 font-semibold">
              {balanceData?.remaining_minutes != null ? `${Math.round(balanceData.remaining_minutes)} min` : "--"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total purchased</span>
            <span className="text-gray-700">
              {balanceData?.total_purchased_minutes != null ? `${Math.round(balanceData.total_purchased_minutes)} min` : "--"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total used</span>
            <span className="text-gray-700">
              {balanceData?.total_used_minutes != null ? `${Math.round(balanceData.total_used_minutes)} min` : "--"}
            </span>
          </div>
        </div>

        {/* Balance bar */}
        {balanceData?.total_purchased_minutes != null && balanceData.total_purchased_minutes > 0 && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gray-950 transition-all"
                style={{
                  width: `${Math.min(((balanceData.remaining_minutes ?? 0) / balanceData.total_purchased_minutes) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-[12px] text-gray-400 mt-1">
              {Math.round(((balanceData.remaining_minutes ?? 0) / balanceData.total_purchased_minutes) * 100)}% remaining
            </p>
          </div>
        )}
      </div>

      {/* Subscription details */}
      {userData?.data?.stripe_subscription_id && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <h3 className="text-[15px] font-semibold text-gray-950 mb-3">Details</h3>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-gray-400">Subscription ID</span>
              <span className="text-gray-500 font-mono text-[12px]">{userData.data.stripe_subscription_id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
