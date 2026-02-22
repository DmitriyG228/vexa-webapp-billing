"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
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

// ─── Tabs (service-based) ───────────────────────────────────────────────────

const TABS = [
  { id: "bots", label: "Bots" },
  { id: "transcription", label: "Transcription" },
  { id: "api-keys", label: "API Keys" },
] as const

type TabId = (typeof TABS)[number]["id"]

// ─── Bot pricing tiers (graduated) ─────────────────────────────────────────

const BOT_TIERS = [
  { up_to: 1, unit_amount: 1200, label: "1 bot" },
  { up_to: 2, unit_amount: 3600, label: "2 bots" },
  { up_to: 5, unit_amount: 2400, label: "3–5 bots" },
  { up_to: 50, unit_amount: 2000, label: "6–50 bots" },
  { up_to: 200, unit_amount: 1500, label: "51–200 bots" },
  { up_to: Infinity, unit_amount: 1000, label: "200+ bots" },
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

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

function getCurrentTierIndex(botCount: number): number {
  for (let i = 0; i < BOT_TIERS.length; i++) {
    if (botCount <= BOT_TIERS[i].up_to) return i
  }
  return BOT_TIERS.length - 1
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
  const [activeTab, setActiveTab] = useState<TabId>("bots")

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

  const fetchMeetings = useCallback(async () => {
    try {
      const resp = await fetch("/api/account/meetings", { cache: "no-store" })
      if (resp.ok) setMeetingsData(await resp.json())
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
      // Active subscribers go straight to the Stripe Customer Portal;
      // everyone else goes through the resolve-url flow (→ pricing / checkout).
      const hasActiveSub = userData?.data?.subscription_status &&
        ["active", "trialing", "scheduled_to_cancel"].includes(userData.data.subscription_status)

      const endpoint = hasActiveSub
        ? "/api/stripe/create-portal-session"
        : "/api/stripe/resolve-url"

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hasActiveSub ? {} : { context: "dashboard" }),
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

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <section className="py-10 lg:py-14">
      <div className="max-w-5xl mx-auto px-6">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950">Account</h1>
          <p className="mt-1 text-[14px] text-gray-500">
            Manage your services, usage, and billing.
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
        {activeTab === "bots" && (
          <BotsTab
            userData={userData}
            meetingsData={meetingsData}
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
          />
        )}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Bots
// ═══════════════════════════════════════════════════════════════════════════════

function BotsTab({
  userData,
  meetingsData,
  onOpenPortal,
  isOpeningPortal,
}: {
  userData: UserData | null
  meetingsData: MeetingsData | null
  onOpenPortal: () => void
  isOpeningPortal: boolean
}) {
  const subStatus = userData?.data?.subscription_status
  const subTier = userData?.data?.subscription_tier
  const periodEnd = userData?.data?.subscription_current_period_end ?? userData?.data?.subscription_end_date
  const botCount = userData?.max_concurrent_bots ?? 0
  const currentTierIdx = getCurrentTierIndex(botCount)

  return (
    <div className="space-y-6">
      {/* Subscription + Bot limit row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="flex justify-between">
              <span className="text-gray-400">Bot limit</span>
              <span className="text-gray-700">{botCount} concurrent</span>
            </div>
            {periodEnd && (
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

        {/* Meeting stats card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <h3 className="text-[17px] font-semibold text-gray-950 mb-4">Meeting Stats</h3>
          {meetingsData?.meeting_stats ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total", value: meetingsData.meeting_stats.total },
                  { label: "Completed", value: meetingsData.meeting_stats.completed },
                  { label: "Failed", value: meetingsData.meeting_stats.failed },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[12px] text-gray-400 mb-0.5">{label}</p>
                    <p className="text-[22px] font-semibold tracking-[-0.02em] text-gray-950">{value}</p>
                  </div>
                ))}
              </div>
              {meetingsData.usage_patterns?.platforms && Object.keys(meetingsData.usage_patterns.platforms).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[12px] text-gray-400 mb-2">Platforms</p>
                  <div className="flex gap-2 flex-wrap">
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
            </>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-[13px] text-gray-300">No meeting data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing tiers */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[17px] font-semibold text-gray-950">Your Pricing Tier</h3>
            <p className="text-[13px] text-gray-400 mt-0.5">
              Graduated pricing — each tier applies to bots in that range
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {BOT_TIERS.map((tier, i) => {
            const isCurrent = i === currentTierIdx && botCount > 0
            const isNext = i === currentTierIdx + 1 && botCount > 0
            return (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                  isCurrent
                    ? "border-gray-950 bg-gray-950/[0.02]"
                    : "border-gray-100 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[14px] font-medium ${isCurrent ? "text-gray-950" : "text-gray-600"}`}>
                    {tier.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-950 text-white">
                      Current
                    </span>
                  )}
                  {isNext && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      Next tier
                    </span>
                  )}
                </div>
                <span className={`text-[14px] font-semibold ${isCurrent ? "text-gray-950" : "text-gray-500"}`}>
                  {formatUsd(tier.unit_amount)}/bot/mo
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Subscription ID */}
      {userData?.data?.stripe_subscription_id && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5" style={{ boxShadow: cardShadow }}>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-400">Subscription ID</span>
            <span className="text-gray-500 font-mono text-[12px]">{userData.data.stripe_subscription_id}</span>
          </div>
        </div>
      )}
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
      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <p className="text-[13px] text-gray-400 mb-1">Balance</p>
          <p className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950">
            {balanceData?.balance_minutes != null ? `${Math.round(balanceData.balance_minutes)}` : "--"}
          </p>
          <p className="text-[13px] text-gray-400">minutes remaining</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <p className="text-[13px] text-gray-400 mb-1">Total Purchased</p>
          <p className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950">
            {balanceData?.total_purchased_minutes != null ? `${Math.round(balanceData.total_purchased_minutes)}` : "--"}
          </p>
          <p className="text-[13px] text-gray-400">minutes all time</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <p className="text-[13px] text-gray-400 mb-1">Total Used</p>
          <p className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950">
            {balanceData?.total_used_minutes != null ? `${Math.round(balanceData.total_used_minutes)}` : "--"}
          </p>
          <p className="text-[13px] text-gray-400">minutes all time</p>
        </div>
      </div>

      {/* Balance bar */}
      {balanceData?.total_purchased_minutes != null && balanceData.total_purchased_minutes > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-semibold text-gray-950">Balance</h3>
            <span className="text-[13px] text-gray-400">
              {Math.round(((balanceData.remaining_minutes ?? 0) / balanceData.total_purchased_minutes) * 100)}% remaining
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gray-950 transition-all"
              style={{
                width: `${Math.min(((balanceData.remaining_minutes ?? 0) / balanceData.total_purchased_minutes) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Usage chart (last 30 days) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
        <h3 className="text-[15px] font-semibold text-gray-950 mb-1">Daily Usage</h3>
        <p className="text-[13px] text-gray-400 mb-4">Minutes transcribed per day</p>
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

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Minutes", value: stats.total_minutes != null ? `${stats.total_minutes.toFixed(1)}` : "--" },
            { label: "Avg Daily", value: stats.average_daily_minutes != null ? `${stats.average_daily_minutes.toFixed(1)}` : "--" },
            { label: "Active Days", value: stats.days_with_usage != null ? `${stats.days_with_usage}` : "--" },
            { label: "Period", value: stats.period_days != null ? `${stats.period_days} days` : "--" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5" style={{ boxShadow: cardShadow }}>
              <p className="text-[12px] text-gray-400 mb-1">{label}</p>
              <p className="text-[22px] font-semibold tracking-[-0.02em] text-gray-950">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pricing info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: cardShadow }}>
        <h3 className="text-[17px] font-semibold text-gray-950 mb-4">Pricing</h3>
        <div className="space-y-3 text-[14px]">
          <div className="flex justify-between">
            <span className="text-gray-400">Rate</span>
            <span className="text-gray-950 font-semibold">$0.0015 / minute</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Minimum purchase</span>
            <span className="text-gray-700">$5.00 (3,333 minutes)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Free credit</span>
            <span className="text-gray-700">$20.00 (13,333 minutes)</span>
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
          <p className="text-[14px] text-gray-500">Your API keys work across all Vexa services.</p>
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

      {/* Create dialog */}
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
