"use client"

import { useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"

interface SubscriptionPopupProps {
  subscriptionStatus?: string
}

const isCloudDeployment = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE !== "self-hosted"

export function SubscriptionPopup({ subscriptionStatus }: SubscriptionPopupProps) {
  const [dismissed, setDismissed] = useState(false)

  if (!isCloudDeployment) return null
  if (dismissed) return null

  const hasActiveSub = subscriptionStatus &&
    ["active", "trialing", "scheduled_to_cancel"].includes(subscriptionStatus)
  if (hasActiveSub) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-8 shadow-xl relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
          </div>

          <h2 className="text-[20px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
            Subscribe to use Vexa Cloud
          </h2>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
            Choose a plan to start using the Bot Service, or self-host for free.
            Your account and settings are safe — pick up right where you left off.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/pricing"
              className="h-11 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
            >
              View Plans
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="h-11 rounded-full border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 text-[14px] font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
