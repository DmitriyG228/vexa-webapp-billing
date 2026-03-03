"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

const HOURLY_RATE = 240
const MIN_HOURS = 1
const MAX_HOURS = 50
const CAL_URL = process.env.NEXT_PUBLIC_CAL_URL || "https://cal.com/dmitrygrankin/30-min"

const cardShadow = "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)"

export default function SupportPage() {
  const { data: session } = useSession()
  const [hours, setHours] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const total = hours * HOURLY_RATE

  const handleCheckout = async () => {
    if (!session) {
      signIn("google", { callbackUrl: "/support" })
      return
    }

    setIsLoading(true)
    try {
      const resp = await fetch("/api/stripe/resolve-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: "pricing",
          plan_type: "consultation",
          quantity: hours,
        }),
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || "Failed to start checkout")

      if (data.url) window.location.href = data.url
      else throw new Error("No checkout URL returned")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start checkout")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-4">
            Priority Support
          </span>
          <h1 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
            Get dedicated help
            <br />
            <em className="not-italic font-light text-gray-400 dark:text-gray-500">building with Vexa</em>
          </h1>
          <p className="mt-4 text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-lg mx-auto">
            Prioritize your features, get hands-on build help, and influence the open source roadmap.
          </p>
        </div>

        {/* Main card */}
        <div
          className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8"
          style={{ boxShadow: cardShadow }}
        >
          {/* What's included */}
          <div className="mb-8">
            <h2 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-4">What&apos;s included</h2>
            <div className="space-y-3">
              {[
                "Prioritize YOUR feature delivery in the open source project",
                "Get help building your integration with Vexa",
                "Direct access to the founding team",
                "Influence the open source project trajectory",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900 dark:text-gray-100 mt-0.5 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[14px] text-gray-600 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-neutral-800 mb-8" />

          {/* Hours picker */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="hours" className="text-[14px] font-medium text-gray-950 dark:text-gray-50">
                Hours per month
              </label>
              <span className="text-[14px] text-gray-400">${HOURLY_RATE}/hr</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setHours(Math.max(MIN_HOURS, hours - 1))}
                disabled={hours <= MIN_HOURS}
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" x2="19" y1="12" y2="12" /></svg>
              </button>

              <input
                id="hours"
                type="number"
                min={MIN_HOURS}
                max={MAX_HOURS}
                value={hours}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!isNaN(v)) setHours(Math.min(MAX_HOURS, Math.max(MIN_HOURS, v)))
                }}
                className="flex-1 h-12 text-center text-[24px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl outline-none focus:border-gray-400 dark:focus:border-neutral-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                onClick={() => setHours(Math.min(MAX_HOURS, hours + 1))}
                disabled={hours >= MAX_HOURS}
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
              </button>
            </div>

            <input
              type="range"
              min={MIN_HOURS}
              max={MAX_HOURS}
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value, 10))}
              className="w-full mt-4 accent-gray-950 dark:accent-gray-200"
            />
            <div className="flex justify-between text-[12px] text-gray-400 mt-1">
              <span>{MIN_HOURS} hr</span>
              <span>{MAX_HOURS} hrs</span>
            </div>
          </div>

          {/* Total */}
          <div className="rounded-xl bg-gray-50 dark:bg-neutral-800 p-5 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-gray-500">Monthly total</span>
              <span className="text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50">
                ${total.toLocaleString()}
                <span className="text-[14px] font-normal text-gray-400">/mo</span>
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="flex-1 h-12 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                `Subscribe — $${total.toLocaleString()}/mo`
              )}
            </button>

            <Link
              href={CAL_URL}
              target="_blank"
              className="flex-1 h-12 rounded-full border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 text-[14px] font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              Book a free intro call
            </Link>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-[13px] text-gray-400 dark:text-gray-500 mt-6">
          Billed monthly. Cancel or adjust hours anytime via your{" "}
          <Link href="/account" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300">
            account page
          </Link>.
        </p>
      </div>
    </section>
  )
}
