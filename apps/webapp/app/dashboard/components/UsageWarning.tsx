"use client"

import Link from "next/link"

interface UsageWarningProps {
  subscriptionTier?: string
  subscriptionStatus?: string
  /** Current usage in dollars for pay-as-you-go */
  currentUsageDollars?: number
  /** Spending limit in dollars for pay-as-you-go */
  spendingLimitDollars?: number
  /** Remaining transcription minutes */
  transcriptionBalanceMinutes?: number
  /** Threshold below which to warn (transcription) */
  transcriptionThresholdMinutes?: number
}

const isCloudDeployment = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE !== "self-hosted"

export function UsageWarning({
  subscriptionTier,
  subscriptionStatus,
  currentUsageDollars = 0,
  spendingLimitDollars = 5,
  transcriptionBalanceMinutes,
  transcriptionThresholdMinutes = 100,
}: UsageWarningProps) {
  if (!isCloudDeployment) return null

  const hasActiveSub = subscriptionStatus &&
    ["active", "trialing", "scheduled_to_cancel"].includes(subscriptionStatus)
  if (!hasActiveSub) return null

  const warnings: { type: "warning" | "critical"; message: string; action: string; href: string }[] = []

  // Pay-as-you-go: spending limit warnings
  if (subscriptionTier === "bot_service" && spendingLimitDollars > 0) {
    const usagePercent = (currentUsageDollars / spendingLimitDollars) * 100
    if (usagePercent >= 100) {
      warnings.push({
        type: "critical",
        message: `Spending limit reached ($${currentUsageDollars.toFixed(2)} / $${spendingLimitDollars}). Bots are paused.`,
        action: "Increase limit",
        href: "/account?tab=bots",
      })
    } else if (usagePercent >= 80) {
      warnings.push({
        type: "warning",
        message: `Usage at ${Math.round(usagePercent)}% of spending limit ($${currentUsageDollars.toFixed(2)} / $${spendingLimitDollars}).`,
        action: "Review usage",
        href: "/account?tab=bots",
      })
    }
  }

  // Transcription: balance warnings
  if (transcriptionBalanceMinutes !== undefined) {
    if (transcriptionBalanceMinutes <= 0) {
      warnings.push({
        type: "critical",
        message: "Transcription balance depleted. Add funds to continue.",
        action: "Add funds",
        href: "/account?tab=transcription",
      })
    } else if (transcriptionBalanceMinutes < transcriptionThresholdMinutes) {
      warnings.push({
        type: "warning",
        message: `Transcription balance low: ${Math.round(transcriptionBalanceMinutes)} minutes remaining.`,
        action: "Add funds",
        href: "/account?tab=transcription",
      })
    }
  }

  if (warnings.length === 0) return null

  return (
    <div className="space-y-3 mb-6">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border ${
            w.type === "critical"
              ? "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30"
              : "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={w.type === "critical" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}>
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <span className={`text-[13px] font-medium ${w.type === "critical" ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300"}`}>
              {w.message}
            </span>
          </div>
          <Link
            href={w.href}
            className={`flex-shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors ${
              w.type === "critical"
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-amber-600 text-white hover:bg-amber-500"
            }`}
          >
            {w.action}
          </Link>
        </div>
      ))}
    </div>
  )
}
