"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useSession, signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check, Copy, Eye, EyeOff, Key, Loader2, Plus, Trash2, ExternalLink, HelpCircle } from "lucide-react"
import { getDashboardUrl } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  balance_cents?: number
  balance_usd?: string
  topup_enabled?: boolean
  topup_threshold_cents?: number
  topup_amount_cents?: number
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

// ─── Tabs (service-based) ───────────────────────────────────────────────────

const TABS = [
  { id: "bots", label: "Bots" },
  { id: "transcription", label: "Transcription" },
  { id: "api-keys", label: "API Keys" },
] as const

type TabId = (typeof TABS)[number]["id"]

// ─── Pricing plans ──────────────────────────────────────────────────────────

// Plans imported from product catalog (product/products.ts = source of truth)
const BOT_PLANS = [
  { id: "individual", name: "Individual", price: "$12/mo", detail: "1 bot included" },
  { id: "bot_service", name: "Pay-as-you-go", price: "$0.30/hr", detail: "Usage-based, unlimited bots" },
]

// Add-on products — can be added alongside any bot plan
const ADDON_PRODUCTS = [
  { id: "transcription_addon", name: "Real-time transcription", price: "+$0.10/hr", detail: "Enabled per meeting via API" },
]

// All plans for display in getPlanLabel
const PRICING_PLANS = [
  ...BOT_PLANS,
  ...ADDON_PRODUCTS,
  { id: "enterprise", name: "Enterprise", price: "Custom", detail: "On-premises" },
]

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

function getPlanLabel(tier?: string): string {
  const plan = PRICING_PLANS.find(p => p.id === tier)
  return plan ? `${plan.name} (${plan.price})` : "Free Plan"
}

const cardShadow = "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)"

// ─── Shared components ──────────────────────────────────────────────────────

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

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AccountPageWrapper() {
  return (
    <Suspense fallback={
      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="text-[15px] text-gray-400">Loading account...</span>
        </div>
      </section>
    }>
      <AccountPage />
    </Suspense>
  )
}

function AccountPage() {
  const { data: session, status: sessionStatus } = useSession()
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get("tab")
  const initialTab: TabId = tabParam && TABS.some(t => t.id === tabParam) ? tabParam as TabId : "bots"
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)

  // Data states
  const [userData, setUserData] = useState<UserData | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [botBalanceData, setBotBalanceData] = useState<{ balance_cents: number; initial_credit_cents: number; usage_cents: number; balance_usd: string; usage_usd: string; initial_credit_usd: string; has_subscription: boolean; cancel_at_period_end?: boolean; topup_enabled?: boolean; topup_threshold_cents?: number; topup_amount_cents?: number; bot_minutes?: number; tx_minutes?: number } | null>(null)
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

  // Shared usage controls state (shown on Bots + Transcription tabs)
  const [autoTopup, setAutoTopup] = useState(true)
  const [topupThresholdStr, setTopupThresholdStr] = useState("1")
  const [topupAmountStr, setTopupAmountStr] = useState("5")
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [isAddingFunds, setIsAddingFunds] = useState(false)
  const [showAddFundsConfirm, setShowAddFundsConfirm] = useState(false)
  const [addFundsAmountStr, setAddFundsAmountStr] = useState("5")

  const userId = (session?.user as any)?.id

  // ─── SSO: handle returnUrl query param ──────────────────────────────────

  useEffect(() => {
    const returnUrl = searchParams?.get("returnUrl")
    if (!returnUrl) return

    if (sessionStatus === "authenticated") {
      let ok = false
      try {
        const parsed = new URL(returnUrl)
        const trusted = ["vexa.ai", "localhost"]
        ok = trusted.some(d => parsed.hostname === d || parsed.hostname.endsWith("." + d))
      } catch {}
      if (!ok) return

      fetch("/api/sso/prepare", { method: "POST" })
        .then(() => { window.location.href = returnUrl })
        .catch(() => { window.location.href = returnUrl })
    } else if (sessionStatus === "unauthenticated") {
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
      if (resp.ok) setUsageData(await resp.json())
    } catch (err) {
      console.error("Error fetching usage:", err)
    }
  }, [])

  const fetchBalance = useCallback(async () => {
    try {
      const resp = await fetch("/api/account/balance", { cache: "no-store" })
      if (resp.ok) setBalanceData(await resp.json())
    } catch (err) {
      console.error("Error fetching balance:", err)
    }
  }, [])

  const fetchBotBalance = useCallback(async () => {
    try {
      const resp = await fetch("/api/stripe/bot-balance", { cache: "no-store" })
      if (resp.ok) setBotBalanceData(await resp.json())
    } catch (err) {
      console.error("Error fetching bot balance:", err)
    }
  }, [])

  const fetchMeetings = useCallback(async () => {
    try {
      const resp = await fetch("/api/account/meetings", { cache: "no-store" })
      if (resp.ok) setMeetingsData(await resp.json())
    } catch (err) {
      console.error("Error fetching meetings:", err)
    }
  }, [])

  const [hasAutoProvisioned, setHasAutoProvisioned] = useState(false)

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !userId) {
      setIsLoading(false)
      return
    }
    const loadAll = async () => {
      setIsLoading(true)
      await Promise.all([fetchUserData(), fetchUsage(), fetchBalance(), fetchBotBalance(), fetchMeetings()])
      setIsLoading(false)
    }
    loadAll()
  }, [sessionStatus, userId, fetchUserData, fetchUsage, fetchBalance, fetchBotBalance, fetchMeetings])

  // Auto-provision: if user has no subscription, create PAYG + $5 credit
  useEffect(() => {
    if (!userData || hasAutoProvisioned) return
    const subStatus = userData.data?.subscription_status as string | undefined
    if (subStatus && ["active", "trialing", "past_due", "scheduled_to_cancel"].includes(subStatus)) return
    // No active subscription — auto-provision
    setHasAutoProvisioned(true)
    const provision = async () => {
      try {
        const resp = await fetch("/api/stripe/auto-provision", { method: "POST" })
        if (resp.ok) {
          // Reload all data to reflect new subscription
          await Promise.all([fetchUserData(), fetchBotBalance()])
        }
      } catch (err) {
        console.error("Auto-provision failed:", err)
      }
    }
    provision()
  }, [userData, hasAutoProvisioned, fetchUserData, fetchBotBalance])

  // ─── Shared usage controls (synced from botBalanceData) ─────────────────

  useEffect(() => {
    if (botBalanceData) {
      setAutoTopup(botBalanceData.topup_enabled ?? true)
      setTopupThresholdStr(String(Math.round((botBalanceData.topup_threshold_cents ?? 100) / 100)))
      setTopupAmountStr(String(Math.round((botBalanceData.topup_amount_cents ?? 500) / 100)))
    }
  }, [botBalanceData])

  const addFundsAmount = parseInt(addFundsAmountStr, 10) || 0

  const handleSaveSettings = async () => {
    const threshold = parseInt(topupThresholdStr, 10) || 0
    const amount = parseInt(topupAmountStr, 10) || 0
    if (autoTopup && threshold < 1) { alert("Threshold must be at least $1."); return }
    if (autoTopup && amount < 2) { alert("Top-up amount must be at least $2."); return }
    setIsSavingSettings(true)
    setSettingsSaved(false)
    try {
      const resp = await fetch("/api/stripe/topup-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "bot", enabled: autoTopup, threshold: threshold * 100, amount_cents: amount * 100 }),
      })
      if (!resp.ok) { const data = await resp.json().catch(() => ({})); throw new Error(data.detail || data.error || "Failed to save settings") }
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 2000)
      await fetchBotBalance()
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to save settings") }
    finally { setIsSavingSettings(false) }
  }

  const handleAddFundsConfirmed = async () => {
    setShowAddFundsConfirm(false)
    setIsAddingFunds(true)
    try {
      const resp = await fetch("/api/stripe/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "bot", amount_cents: addFundsAmount * 100 }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.detail || data.error || "Failed to add funds")
      if (data.url) { window.location.href = data.url; return }
      await fetchBotBalance()
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to add funds") }
    finally { setIsAddingFunds(false) }
  }

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
      // resolve-url handles all cases: active sub → portal, no sub → pricing/checkout
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

  // ─── Switched plan success banner (hooks must be before early returns) ──
  const switchedPlan = searchParams?.get("switched")
  const switchCredit = searchParams?.get("credit")
  const [showSwitchedBanner, setShowSwitchedBanner] = useState(!!switchedPlan)

  useEffect(() => {
    if (switchedPlan) {
      // Clean URL without reload
      window.history.replaceState({}, "", "/account")
    }
  }, [switchedPlan])

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

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <section className="py-10 lg:py-14">
      <div className="max-w-5xl mx-auto px-6">
        {/* Success banner after plan switch */}
        {showSwitchedBanner && (
          <div className="mb-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <p className="text-[14px] text-emerald-800 dark:text-emerald-300 font-medium">
                Plan switched successfully!{switchedPlan ? ` You're now on the ${getPlanLabel(switchedPlan)} plan.` : ""}{switchCredit ? ` You've been credited $${switchCredit} for remaining days on your previous plan.` : ""}
              </p>
            </div>
            <button onClick={() => setShowSwitchedBanner(false)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 text-[18px] leading-none px-2">×</button>
          </div>
        )}

        {/* Page heading */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50">Account</h1>
            <p className="mt-1 text-[14px] text-gray-500">
              Manage your services, usage, and billing.
            </p>
          </div>
          <a
            href={getDashboardUrl()}
            className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-full border border-gray-200 dark:border-neutral-700 text-[13.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Go to Dashboard
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white dark:bg-neutral-900 text-gray-950 dark:text-gray-50 border border-gray-200 dark:border-neutral-700 shadow-sm"
                  : "bg-transparent text-gray-400 dark:text-gray-500 border border-transparent hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-[14px] text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Tab content */}
        {activeTab === "bots" && (
          <BotsTab
            userData={userData}
            meetingsData={meetingsData}
            botBalanceData={botBalanceData}
            onOpenPortal={handleOpenStripePortal}
            isOpeningPortal={isOpeningPortal}
          />
        )}

        {activeTab === "transcription" && (
          <TranscriptionTab
            balanceData={balanceData}
            usageData={usageData}
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
            hasActiveSubscription={!!userData?.data?.subscription_status && ["active", "trialing", "scheduled_to_cancel"].includes(userData.data.subscription_status)}
          />
        )}

        {/* Shared Usage Controls — shown on Bots + Transcription tabs, not Individual or API Keys */}
        {(activeTab === "bots" || activeTab === "transcription") && userData?.data?.subscription_tier !== "individual" && (
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 mt-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">Usage Controls</h3>
            <p className="text-[13px] text-gray-400 mb-5">Manage spending limits and auto-topup for usage-based billing.</p>

            {/* Balance & usage display */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-[14px] mb-2">
                <span className="text-gray-400">Balance</span>
                <span className="text-gray-950 dark:text-gray-50 font-semibold text-[16px]">
                  {botBalanceData?.has_subscription ? botBalanceData.balance_usd : "$0.00"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="text-gray-400">Initial credit</span>
                <span className="text-gray-500">{botBalanceData?.has_subscription ? botBalanceData.initial_credit_usd : "$5.00"}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-400">Usage this period</span>
                <span className="text-gray-500">{botBalanceData?.has_subscription ? botBalanceData.usage_usd : "$0.00"}</span>
              </div>
              {botBalanceData?.has_subscription && (botBalanceData.bot_minutes || botBalanceData.tx_minutes) ? (
                <div className="mt-2 space-y-0.5">
                  {(botBalanceData.bot_minutes ?? 0) > 0 && (
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-400 pl-2">Bot minutes</span>
                      <span className="text-gray-400">{botBalanceData.bot_minutes} min</span>
                    </div>
                  )}
                  {(botBalanceData.tx_minutes ?? 0) > 0 && (
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-400 pl-2">Transcription minutes</span>
                      <span className="text-gray-400">{botBalanceData.tx_minutes} min</span>
                    </div>
                  )}
                </div>
              ) : null}
              {botBalanceData?.has_subscription && (
                <div className="h-2 rounded-full bg-gray-100 dark:bg-neutral-800 mt-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gray-950 dark:bg-gray-200"
                    style={{ width: `${(botBalanceData.usage_cents + botBalanceData.balance_cents) > 0 ? Math.min((botBalanceData.usage_cents / (botBalanceData.usage_cents + botBalanceData.balance_cents)) * 100, 100) : 0}%` }}
                  />
                </div>
              )}
            </div>

            {/* Add Funds */}
            <div className="border-t border-gray-100 dark:border-neutral-800 pt-5 mb-5">
              <label className="text-[13px] text-gray-500 mb-1.5 block">Add funds amount</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-gray-400">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={addFundsAmountStr}
                    onChange={(e) => setAddFundsAmountStr(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="5"
                    className="w-24 h-10 px-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-[14px] text-gray-950 dark:text-gray-50 font-medium outline-none focus:border-gray-400 dark:focus:border-neutral-500"
                  />
                </div>
                <button
                  onClick={() => addFundsAmount >= 2 && setShowAddFundsConfirm(true)}
                  disabled={isAddingFunds || addFundsAmount < 2}
                  className="h-10 px-6 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {isAddingFunds ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Add Funds"
                  )}
                </button>
              </div>
              <p className="text-[12px] text-gray-400 mt-2">Minimum $2. Charges your saved payment method.</p>
            </div>

            {/* Auto-topup toggle */}
            <div className="border-t border-gray-100 dark:border-neutral-800 pt-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[14px] font-medium text-gray-950 dark:text-gray-50">Auto-topup</p>
                  <p className="text-[13px] text-gray-400">Automatically charge your payment method as usage accrues.</p>
                </div>
                <button
                  onClick={() => setAutoTopup(!autoTopup)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${autoTopup ? "bg-gray-950 dark:bg-white" : "bg-gray-200 dark:bg-neutral-700"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-neutral-900 shadow transition-transform ${autoTopup ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {/* Auto-topup settings */}
              {autoTopup && (
                <div className="border-t border-gray-100 dark:border-neutral-800 pt-5 space-y-4">
                  <div>
                    <label className="text-[13px] text-gray-500 mb-1.5 block">Top up when balance drops below</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-gray-400">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={topupThresholdStr}
                        onChange={(e) => setTopupThresholdStr(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="1"
                        className="w-24 h-10 px-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-[14px] text-gray-950 dark:text-gray-50 font-medium outline-none focus:border-gray-400 dark:focus:border-neutral-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] text-gray-500 mb-1.5 block">Top-up amount</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-gray-400">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={topupAmountStr}
                        onChange={(e) => setTopupAmountStr(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="5"
                        className="w-24 h-10 px-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-[14px] text-gray-950 dark:text-gray-50 font-medium outline-none focus:border-gray-400 dark:focus:border-neutral-500"
                      />
                      <span className="text-[13px] text-gray-400">min $2</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="mt-3 h-9 px-5 rounded-full border border-gray-200 dark:border-neutral-700 text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isSavingSettings ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>
                    ) : settingsSaved ? (
                      <><Check className="h-3 w-3" /> Saved</>
                    ) : (
                      "Save Settings"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Add Funds confirmation dialog */}
            {showAddFundsConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl">
                  <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">Add Funds</h3>
                  <p className="text-[14px] text-gray-500 mb-4">
                    This will charge <span className="font-medium text-gray-950 dark:text-gray-50">${addFundsAmount}.00</span> to your saved payment method.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddFundsConfirm(false)}
                      className="h-9 px-4 rounded-full border border-gray-200 dark:border-neutral-700 text-[13.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddFundsConfirmed}
                      className="h-9 px-4 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[13.5px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      Confirm — ${addFundsAmount}.00
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Priority Support — shown on Bots + Transcription tabs */}
        {(activeTab === "bots" || activeTab === "transcription") && (
          <Link
            href="/support"
            className="flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors group"
            style={{ boxShadow: cardShadow }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-gray-950 dark:text-gray-50">Priority Support</p>
              <p className="text-[13px] text-gray-400 dark:text-gray-500">
                Get dedicated help building with Vexa — $240/hr
              </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        )}
      </div>
    </section>
  )
}

function CancelToPAYGButton() {
  const [isCanceling, setIsCanceling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleConfirm = async () => {
    setShowConfirm(false)
    setIsCanceling(true)
    try {
      const resp = await fetch("/api/stripe/resolve-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: "pricing", plan_type: "bot_service", quantity: 1 }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || data.detail || "Failed to switch plan")
      if (data.url) window.location.href = data.url
      else throw new Error("No URL returned")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel subscription")
    } finally {
      setIsCanceling(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isCanceling}
        className="mt-4 text-[13px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-2 disabled:opacity-50"
      >
        {isCanceling ? "Canceling..." : "Cancel subscription"}
      </button>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl">
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">Cancel subscription</h3>
            <p className="text-[14px] text-gray-500 mb-2">
              Your Individual subscription will be canceled immediately and you&apos;ll be switched to the Pay-as-you-go plan.
            </p>
            <p className="text-[13px] text-gray-400 mb-4">
              Any remaining balance from your subscription will be prorated as credit on your account.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="h-9 px-4 rounded-full border border-gray-200 dark:border-neutral-700 text-[13.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Keep subscription
              </button>
              <button
                onClick={handleConfirm}
                className="h-9 px-4 rounded-full bg-red-600 text-white text-[13.5px] font-medium hover:bg-red-700 transition-colors"
              >
                Cancel &amp; switch to PAYG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Bots
// ═══════════════════════════════════════════════════════════════════════════════

function BotsTab({
  userData,
  meetingsData,
  botBalanceData,
  onOpenPortal,
  isOpeningPortal,
}: {
  userData: UserData | null
  meetingsData: MeetingsData | null
  botBalanceData: { balance_cents: number; initial_credit_cents: number; usage_cents: number; balance_usd: string; usage_usd: string; initial_credit_usd: string; has_subscription: boolean; cancel_at_period_end?: boolean; topup_enabled?: boolean; topup_threshold_cents?: number; topup_amount_cents?: number; bot_minutes?: number; tx_minutes?: number } | null
  onOpenPortal: () => void
  isOpeningPortal: boolean
}) {
  const subStatus = userData?.data?.subscription_status
  const subTier = userData?.data?.subscription_tier
  const periodEnd = userData?.data?.subscription_current_period_end ?? userData?.data?.subscription_end_date
  const botCount = userData?.max_concurrent_bots ?? 0

  // Plan switching state
  const [isSwitching, setIsSwitching] = useState(false)
  const [showSwitchConfirm, setShowSwitchConfirm] = useState<string | null>(null)
  const [isReactivating, setIsReactivating] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleReactivate = async () => {
    setIsReactivating(true)
    try {
      const resp = await fetch("/api/stripe/reactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || data.detail || "Failed to reactivate")
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reactivate subscription")
    } finally {
      setIsReactivating(false)
    }
  }

  const handleSubscribe = async (planType: string) => {
    setIsSubscribing(true)
    try {
      const resp = await fetch("/api/stripe/resolve-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: "pricing",
          plan_type: planType,
          quantity: 1,
        }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || "Failed to start checkout")
      if (data.url) window.location.href = data.url
      else throw new Error("No checkout URL returned")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to subscribe")
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleSwitchPlan = async (targetPlanType: string) => {
    setShowSwitchConfirm(null)
    setIsSwitching(true)
    try {
      // resolve-url detects plan switch: cancels old sub, creates checkout for new one
      const resp = await fetch("/api/stripe/resolve-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: "pricing",
          plan_type: targetPlanType,
          quantity: 1,
        }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || data.detail || "Failed to start plan switch")
      if (data.url) window.location.href = data.url
      else throw new Error("No URL returned")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to switch plan")
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Subscription + Bot limit row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50">Subscription</h3>
            <StatusBadge status={botBalanceData?.cancel_at_period_end ? 'scheduled_to_cancel' : subStatus} />
          </div>
          <div className="space-y-3 text-[14px]">
            <div className="flex justify-between">
              <span className="text-gray-400">Plan</span>
              <span className="text-gray-950 dark:text-gray-50 font-medium">{getPlanLabel(subTier)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Bot limit</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300">
                  {subTier === 'bot_service' ? `${botCount} concurrent` : subTier === 'individual' ? `${botCount} concurrent` : `${botCount} with API key`}
                </span>
                {subTier === 'bot_service' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline">
                        Request more
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-64 p-4">
                      <p className="text-[13px] font-medium text-gray-950 dark:text-gray-50 mb-3">Request bot limit increase</p>
                      <p className="text-[12px] text-gray-500 mb-3">Current limit: {botCount} concurrent bots</p>
                      <a
                        href={`mailto:dmitry@vexa.ai?subject=Bot%20Limit%20Increase%20Request&body=Hi%2C%0A%0AI'd%20like%20to%20request%20an%20increase%20to%20my%20concurrent%20bot%20limit.%0A%0ACurrent%20limit%3A%20${botCount}%0ARequested%20limit%3A%20%0ACompany%3A%20%0A%0AThanks`}
                        className="inline-flex items-center justify-center w-full h-8 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[12px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                      >
                        Contact us
                      </a>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
            {periodEnd && subTier !== 'bot_service' && (
              <div className="flex justify-between">
                <span className="text-gray-400">Period ends</span>
                <span className="text-gray-700">{formatDate(periodEnd)}</span>
              </div>
            )}
            {userData?.data?.subscription_scheduled_to_cancel && userData?.data?.subscription_cancellation_date && (
              <div className="flex justify-between">
                <span className="text-gray-400">Cancellation</span>
                <span className="text-amber-600 font-medium">
                  {formatDate(userData.data.subscription_cancellation_date)}
                </span>
              </div>
            )}
            {botBalanceData && subTier === 'bot_service' && (
              <div className="flex justify-between">
                <span className="text-gray-400">Credit balance</span>
                <span className="text-gray-950 dark:text-gray-50 font-medium">
                  {botBalanceData.has_subscription ? botBalanceData.balance_usd : "$0.00"}
                </span>
              </div>
            )}
          </div>
          {/* Re-activate — when scheduled to cancel (Individual only) */}
          {subTier !== 'bot_service' && (subStatus === "scheduled_to_cancel" || userData?.data?.subscription_scheduled_to_cancel || botBalanceData?.cancel_at_period_end) && (
            <button
              onClick={handleReactivate}
              disabled={isReactivating}
              className="mt-4 h-9 px-4 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[13px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isReactivating ? "Reactivating..." : "Re-activate subscription"}
            </button>
          )}
          {/* Cancel link — Individual only. Cancels sub immediately → auto-provision creates PAYG on reload */}
          {subTier !== 'bot_service' && subStatus && ["active", "trialing"].includes(subStatus) && !userData?.data?.subscription_scheduled_to_cancel && !botBalanceData?.cancel_at_period_end && (
            <CancelToPAYGButton />
          )}
          {/* Past due — update payment method CTA */}
          {subStatus === "past_due" && (
            <button
              onClick={onOpenPortal}
              disabled={isOpeningPortal}
              className="mt-4 h-9 px-4 rounded-full bg-red-600 text-white text-[13px] font-medium hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {isOpeningPortal ? "Opening..." : "Update Payment Method"}
            </button>
          )}
          {/* Canceled — re-subscribe CTA */}
          {subStatus === "canceled" && (
            <a
              href="/account"
              className="mt-4 inline-flex h-9 px-4 items-center rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[13px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Re-subscribe
            </a>
          )}
        </div>

        {/* Meeting stats card — only show when there's actual data */}
        {meetingsData?.meeting_stats && (meetingsData.meeting_stats.total > 0) ? (
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-4">Meeting Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total", value: meetingsData.meeting_stats.total },
                { label: "Completed", value: meetingsData.meeting_stats.completed ?? 0 },
                { label: "Failed", value: meetingsData.meeting_stats.failed ?? 0 },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[12px] text-gray-400 mb-0.5">{label}</p>
                  <p className="text-[22px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50">{value}</p>
                </div>
              ))}
            </div>
            {meetingsData?.usage_patterns?.platforms && Object.keys(meetingsData.usage_patterns.platforms).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <p className="text-[12px] text-gray-400 mb-2">Platforms</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(meetingsData.usage_patterns.platforms).map(([platform, count]) => (
                    <span
                      key={platform}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700"
                    >
                      {platform} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50 p-6 text-center" style={{ boxShadow: cardShadow }}>
            <p className="text-[14px] text-gray-400">No meetings yet. Send a bot to a meeting to see stats here.</p>
          </div>
        )}
      </div>

      {/* Bot plans — mutually exclusive */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
        <div className="mb-4">
          <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50">Bot Plans</h3>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Choose one — switch anytime
          </p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          {BOT_PLANS.map((plan) => {
            const hasActiveSub = subStatus && ["active", "trialing", "scheduled_to_cancel"].includes(subStatus)
            const isCurrent = plan.id === subTier && hasActiveSub
            const canSwitch = hasActiveSub && !isCurrent
            const canSubscribe = !hasActiveSub
            return (
              <div key={plan.id}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-[14px] font-medium ${isCurrent ? "text-gray-950 dark:text-gray-50" : "text-gray-500 dark:text-gray-400"}`}>
                      {plan.name}
                    </span>
                    <span className="text-[12px] text-gray-400 dark:text-gray-500">{plan.detail}</span>
                    {isCurrent && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[14px] font-semibold ${isCurrent ? "text-gray-950 dark:text-gray-50" : "text-gray-400 dark:text-gray-500"}`}>
                      {plan.price}
                    </span>
                    {canSwitch && (
                      <button
                        onClick={() => setShowSwitchConfirm(plan.id)}
                        disabled={isSwitching}
                        className="text-[12px] font-medium px-3 py-1 rounded-full border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50"
                      >
                        {isSwitching ? "Switching..." : "Switch"}
                      </button>
                    )}
                    {canSubscribe && (
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isSubscribing}
                        className="text-[12px] font-medium px-3 py-1 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all disabled:opacity-50"
                      >
                        {isSubscribing ? "Loading..." : "Subscribe"}
                      </button>
                    )}
                  </div>
                </div>
                {/* Show usage credit under PAYG row when user is on a non-PAYG plan */}
                {plan.id === 'bot_service' && !isCurrent && botBalanceData && botBalanceData.balance_cents > 0 && (
                  <div className="flex items-center justify-between pb-3 -mt-1">
                    <span className="text-[12px] text-gray-400 pl-0">Usage credit available</span>
                    <span className="text-[12px] font-medium text-gray-500">{botBalanceData.balance_usd}</span>
                  </div>
                )}
              </div>
            )
          })}
          {/* Add-on: transcription — inline row, hidden for Individual (included) */}
          {subTier !== 'individual' && ADDON_PRODUCTS.map((product) => (
            <div key={product.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-medium text-gray-500 dark:text-gray-400">{product.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-semibold text-gray-400 dark:text-gray-500">{product.price}</span>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[200px]">
                      {product.detail}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>

        {/* Switch plan confirmation dialog */}
        {showSwitchConfirm && (() => {
          const currentPlan = BOT_PLANS.find(p => p.id === subTier)
          const targetPlan = BOT_PLANS.find(p => p.id === showSwitchConfirm)
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl">
                <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">Switch Plan</h3>
                <p className="text-[14px] text-gray-500 mb-1">
                  Switch from <span className="font-medium text-gray-950 dark:text-gray-50">{currentPlan?.name || "current plan"}</span> to <span className="font-medium text-gray-950 dark:text-gray-50">{targetPlan?.name || showSwitchConfirm}</span>?
                </p>
                <p className="text-[13px] text-gray-400 mb-4">
                  You&apos;ll be credited for any remaining time on your current plan.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowSwitchConfirm(null)}
                    className="h-9 px-4 rounded-full border border-gray-200 dark:border-neutral-700 text-[13.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSwitchPlan(showSwitchConfirm)}
                    disabled={isSwitching}
                    className="h-9 px-4 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[13.5px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isSwitching ? "Switching..." : "Confirm Switch"}
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>


    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Transcription
// ═══════════════════════════════════════════════════════════════════════════════

function TranscriptionTab({
  balanceData,
  usageData,
}: {
  balanceData: BalanceData | null
  usageData: UsageData | null
}) {
  const history = usageData?.usage_history || []
  const maxMinutes = Math.max(...history.map((d) => d.minutes), 1)
  const stats = usageData?.statistics

  return (
    <div className="space-y-6">
      {/* Product explanation */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
        <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Transcription API</h3>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
          Offload transcription to Vexa&apos;s cloud — no need to self-host GPU infrastructure.
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
          <p className="text-[13px] text-gray-400 mb-1">Credit balance</p>
          <p className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50">
            {balanceData?.balance_usd ?? '$0.00'}
          </p>
          <p className="text-[13px] text-gray-400">~{Math.round(balanceData?.balance_minutes ?? 0).toLocaleString()} minutes at $0.002/min</p>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
          <p className="text-[13px] text-gray-400 mb-1">TX minutes used</p>
          <p className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50">
            {(Math.round((balanceData?.total_used_minutes ?? 0) * 100) / 100).toLocaleString()}
          </p>
          <p className="text-[13px] text-gray-400">this billing period</p>
        </div>
      </div>


      {/* Usage chart (last 30 days) */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
        <h3 className="text-[15px] font-semibold text-gray-950 dark:text-gray-50 mb-1">Daily Usage</h3>
        <p className="text-[13px] text-gray-400 mb-4">Minutes transcribed per day</p>
        {history.length > 0 ? (
          <div className="flex items-end gap-[3px] h-48">
            {history.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-gray-950 dark:bg-gray-200 min-h-[2px] transition-all hover:bg-gray-700 dark:hover:bg-gray-400"
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

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Minutes", value: stats.total_minutes != null ? `${stats.total_minutes.toFixed(1)}` : "--" },
            { label: "Avg Daily", value: stats.average_daily_minutes != null ? `${stats.average_daily_minutes.toFixed(1)}` : "--" },
            { label: "Active Days", value: stats.days_with_usage != null ? `${stats.days_with_usage}` : "--" },
            { label: "Period", value: stats.period_days != null ? `${stats.period_days} days` : "--" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5" style={{ boxShadow: cardShadow }}>
              <p className="text-[12px] text-gray-400 mb-1">{label}</p>
              <p className="text-[22px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pricing info */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
        <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-4">Pricing</h3>
        <div className="space-y-3 text-[14px]">
          <div className="flex justify-between">
            <span className="text-gray-400">Rate</span>
            <span className="text-gray-950 dark:text-gray-50 font-semibold">$0.002 / minute</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Minimum purchase</span>
            <span className="text-gray-700">$5.00 (2,500 minutes)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Free credit</span>
            <span className="text-gray-700">10,000 minutes</span>
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
  hasActiveSubscription,
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
  hasActiveSubscription?: boolean
}) {
  const activeKeys = apiKeys.filter((k) => k.active !== false && k.is_active !== false)

  return (
    <div className="space-y-6">
      {/* Header + Create */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50">API Keys</h2>
          <p className="text-[14px] text-gray-500">Your API keys work across all Vexa services.</p>
        </div>
        <button
          onClick={() => onShowCreateDialog(true)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[13.5px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Key
        </button>
      </div>

      {/* Trial banner — hidden for users with active subscriptions */}
      {!hasActiveSubscription && (
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gradient-to-r from-gray-50 dark:from-neutral-800 to-white dark:to-neutral-900" style={{ boxShadow: cardShadow }}>
          <p className="text-[14px] font-medium text-gray-950 dark:text-gray-50">Get started with $5 free credit</p>
          <p className="text-[13px] text-gray-400 mt-1">
            Create an API key and start using bots immediately. Your $5 free credit covers ~16 hours of bot time — no credit card required.
          </p>
        </div>
      )}

      {/* Key list */}
      {activeKeys.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-10 text-center" style={{ boxShadow: cardShadow }}>
          <Key className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[15px] font-medium text-gray-950 dark:text-gray-50 mb-1">No active API keys</p>
          <p className="text-[13px] text-gray-400 mb-4">Create your first API key to get started.</p>
          <button
            onClick={() => onShowCreateDialog(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[13.5px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
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
              className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
              style={{ boxShadow: cardShadow }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[15px] font-medium text-gray-950 dark:text-gray-50">
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
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 font-mono text-[13px] text-gray-700 dark:text-gray-300 outline-none focus:border-gray-300"
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
                  className="h-10 w-10 rounded-lg border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
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
                <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="text-[12px] font-medium text-emerald-800">Free Credit Active</p>
                  <p className="text-[12px] text-emerald-600 mt-0.5">
                    Your $5 free credit is ready to use. Add a payment method to continue after it runs out.
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
                <span className="text-[12px] text-gray-400">Created {formatDate(key.created_at)}</span>
                <span className="text-[12px] text-gray-400">
                  Last used {formatRelativeTime(key.last_used_at || key.lastUsed)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl">
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">Create new API key</h3>
            <p className="text-[14px] text-gray-500 mb-6">
              Click create to generate a new API key. You will only be able to view the key once.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onShowCreateDialog(false)}
                className="h-9 px-4 rounded-full border border-gray-200 dark:border-neutral-700 text-[13.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onCreate}
                disabled={isCreatingKey}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[13.5px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
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
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl">
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">Revoke API key</h3>
            <p className="text-[14px] text-gray-500 mb-6">
              Are you sure? This action cannot be undone, and any applications using this key will lose access.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onShowRevokeDialog(null)}
                className="h-9 px-4 rounded-full border border-gray-200 dark:border-neutral-700 text-[13.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
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
