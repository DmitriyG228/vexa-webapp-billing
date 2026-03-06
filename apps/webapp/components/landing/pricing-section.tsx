'use client'

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { GetStartedButton } from '@/app/pricing/components/GetStartedButton';

const CheckIcon = ({ className = 'text-gray-400 dark:text-gray-500' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
  </svg>
);


export function PricingSection() {
  const { data: session } = useSession()
  const [currentTier, setCurrentTier] = useState<string | undefined>()
  const [currentStatus, setCurrentStatus] = useState<string | undefined>()

  const userId = (session?.user as any)?.id

  // Fetch subscription state when user is signed in
  useEffect(() => {
    if (!userId) return
    const fetchSub = async () => {
      try {
        const resp = await fetch(`/api/admin/tokens?userId=${encodeURIComponent(userId)}`)
        if (!resp.ok) return
        const data = await resp.json()
        setCurrentTier(data?.data?.subscription_tier)
        setCurrentStatus(data?.data?.subscription_status)
      } catch {
        // Ignore — subscription data is optional for pricing display
      }
    }
    fetchSub()
  }, [userId])

  return (
    <section id="pricing" className="py-16 lg:py-20 border-t border-gray-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-4">
            Pricing
          </span>
          <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
            Pay only for
            <br />
            <em className="not-italic font-light text-gray-400 dark:text-gray-500">what you use</em>
          </h2>
          <p className="mt-4 text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-lg mx-auto">
            Self-host for free, or let us run it for you. Simple usage-based pricing&mdash;no per-seat tax.
          </p>
        </div>

        {/* Main pricing cards — 3 equal-height columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* ── Free (Open Source) ────────────────────── */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)',
            }}
          >
            <div className="mb-5">
              <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">
                Free
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">
                  $0
                </span>
              </div>
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">
                Apache 2.0 &middot; Self-host forever
              </p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 italic mt-1">
                Best for teams who need full control
              </p>
            </div>
            <Link
              href="https://github.com/Vexa-ai/vexa"
              target="_blank"
              className="flex items-center justify-center gap-2 h-[40px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[13px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all mb-6"
            >
              <GitHubIcon />
              View on GitHub
            </Link>
            <div className="space-y-2.5 mt-auto">
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Full platform &mdash; no limits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Your infrastructure, your data</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Google Meet + Teams + Zoom</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Docker Compose / K8s deploy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">REST API + WebSockets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Community support</span>
              </div>
            </div>
          </div>

          {/* ── Individual ────────────────────────────── */}
          <div
            className="rounded-2xl border-2 border-gray-950 dark:border-gray-200 bg-white dark:bg-neutral-900 p-6 relative flex flex-col"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.10)',
            }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-block px-3 py-0.5 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[11px] font-medium tracking-wide">
                START HERE
              </span>
            </div>
            <div className="mb-5">
              <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">
                Individual
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">
                  $12
                </span>
                <span className="text-[14px] text-gray-400 dark:text-gray-500">/mo</span>
              </div>
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">
                1 bot &middot; Flat monthly &middot; Everything included
              </p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 italic mt-1">
                Best for personal use &mdash; 1 meeting at a time
              </p>
            </div>

            <div className="mb-1">
              <GetStartedButton buttonText="Start here" planType="individual" botCount={1} currentTier={currentTier} currentStatus={currentStatus} />
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mb-4">No credit card required</p>
            <div className="space-y-2.5 mt-auto">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-gray-900 dark:text-gray-100" />
                <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">1 concurrent bot</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-gray-900 dark:text-gray-100" />
                <span className="text-[13px] text-gray-600 dark:text-gray-300">
                  Google Meet + Teams
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-1">&middot; Zoom coming soon</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-gray-900 dark:text-gray-100" />
                <span className="text-[13px] text-gray-600 dark:text-gray-300">Real-time transcription included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-gray-900 dark:text-gray-100" />
                <span className="text-[13px] text-gray-600 dark:text-gray-300">Recording + storage included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-gray-900 dark:text-gray-100" />
                <span className="text-[13px] text-gray-600 dark:text-gray-300">Recording + Bot API</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-gray-900 dark:text-gray-100" />
                <span className="text-[13px] text-gray-600 dark:text-gray-300">REST API + WebSockets + Dashboard</span>
              </div>
            </div>
          </div>

          {/* ── Pay-as-you-go (Bot Service) ──────────── */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)',
            }}
          >
            <div className="mb-5">
              <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">
                Pay-as-you-go
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">
                  $0.45
                </span>
                <span className="text-[14px] text-gray-400 dark:text-gray-500">/hr</span>
              </div>
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">
                Per bot hour &middot; Scale without limits
              </p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 italic mt-1">
                Best for teams &amp; API builders
              </p>
            </div>
            <div className="mb-1">
              <GetStartedButton buttonText="Get started" planType="bot_service" currentTier={currentTier} currentStatus={currentStatus} />
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mb-4">No credit card required</p>
            <div className="space-y-2.5 mt-auto">
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">Unlimited concurrent bots</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">
                  Google Meet + Teams
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-1">&middot; Zoom coming soon</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Real-time transcription</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">12-month audio storage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Recording + Bot API</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">REST API + WebSockets</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Enterprise + Transcription API + Priority Support ── */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Enterprise */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-4 flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                    Enterprise
                  </div>
                  <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                    On-premises, OpenShift, Kubernetes. Dedicated support + SLA.
                  </p>
                </div>
                <Link
                  href={process.env.NEXT_PUBLIC_CAL_URL || "https://cal.com/dmitrygrankin/30-min"}
                  target="_blank"
                  className="flex-shrink-0 ml-4 inline-flex items-center h-[32px] px-4 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[12px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
                >
                  Book a call
                </Link>
              </div>
            </div>
          </div>

          {/* Transcription API */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-4 flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                  <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                  <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                    Transcription API
                  </div>
                  <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                    For self-hosted Vexa bot users. Transcription only &mdash; <span className="font-semibold text-gray-950 dark:text-gray-50">$0.0015</span>/min.
                  </p>
                </div>
                <Link
                  href="/account?tab=transcription"
                  className="flex-shrink-0 ml-4 inline-flex items-center h-[32px] px-4 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[12px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>

          {/* Priority Support */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-4 flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                  <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                    Priority Support
                  </div>
                  <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Dedicated help building with Vexa &mdash; from <span className="font-semibold text-gray-950 dark:text-gray-50">$240</span>/hr.
                  </p>
                </div>
                <Link
                  href="/support"
                  className="flex-shrink-0 ml-4 inline-flex items-center h-[32px] px-4 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[12px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Competitive comparison ────────────────── */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
            <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">
              Vexa full-service: $0.45/hr vs Recall.ai $0.72/hr &mdash;
            </span>
            <span className="text-[13px] text-gray-950 dark:text-gray-50 font-semibold">
              ~37% cheaper
            </span>
          </div>
        </div>

        {/* ── FAQ ────────────────────────────────────── */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h3 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50 text-center mb-8">
            Frequently asked questions
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            <div className="py-5">
              <h4 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
                What&apos;s included in the $0.45/hr Bot Service?
              </h4>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">
                The Bot Service includes a meeting bot, real-time transcription, and 12 months of audio storage. It covers Google Meet, Microsoft Teams, and Zoom.
              </p>
            </div>
            <div className="py-5">
              <h4 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
                Which plan is right for me?
              </h4>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">
                Choose Individual ($12/mo) if you need one bot for personal use&mdash;it includes real-time transcription, storage, and the Dashboard. Choose Pay-as-you-go ($0.45/hr) if you need multiple simultaneous bots or want to pay only for what you use&mdash;ideal for teams and API integrations. Both plans include Google Meet and Microsoft Teams support. Self-host for free from GitHub if you need full data control.
              </p>
            </div>
            <div className="py-5">
              <h4 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
                How does the free trial work?
              </h4>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">
                Every new account gets 1 hour of free bot time&mdash;no credit card required. The trial includes all features: transcription, recording, real-time data, and full API access. The clock starts on your first API call, not on signup.
              </p>
            </div>
            <div className="py-5">
              <h4 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
                Can I self-host Vexa?
              </h4>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">
                Yes. Vexa is Apache 2.0 licensed and fully self-hostable. Deploy with Docker Compose, Kubernetes, or OpenShift on your own infrastructure with complete data sovereignty.
              </p>
            </div>
            <div className="py-5">
              <h4 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
                How does Vexa compare to Recall.ai?
              </h4>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">
                Vexa is open source, self-hostable, and ~37% cheaper. Full-service Vexa costs $0.45/hr vs Recall.ai&apos;s ~$0.72/hr at scale. See our{' '}
                <Link href="/compare/recall-ai" className="text-gray-700 dark:text-gray-300 underline underline-offset-2">
                  detailed comparison
                </Link>.
              </p>
            </div>
            <div className="py-5">
              <h4 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
                What&apos;s the Individual plan for?
              </h4>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">
                The Individual plan ($12/mo) is for single users who need one concurrent bot with unlimited meetings. It includes real-time transcription, recording, storage, REST API, WebSockets, and the UI Dashboard&mdash;everything you need for personal meeting intelligence. It supports Google Meet and Microsoft Teams, with Zoom coming soon.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: "What's included in the $0.45/hr Bot Service?",
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The Bot Service includes a meeting bot, real-time transcription, and 12 months of audio storage. It covers Google Meet, Microsoft Teams, and Zoom.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Which plan is right for me?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Choose Individual ($12/mo) if you need one bot for personal use — it includes real-time transcription, storage, and the Dashboard. Choose Pay-as-you-go ($0.45/hr) if you need multiple simultaneous bots or want to pay only for what you use — ideal for teams and API integrations. Both plans include Google Meet and Microsoft Teams support. Self-host for free from GitHub if you need full data control.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does the free trial work?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Every new account gets 1 hour of free bot time — no credit card required. The trial includes all features: transcription, recording, real-time data, and full API access. The clock starts on your first API call, not on signup.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can I self-host Vexa?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. Vexa is Apache 2.0 licensed and fully self-hostable. Deploy with Docker Compose, Kubernetes, or OpenShift on your own infrastructure with complete data sovereignty.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does Vexa compare to Recall.ai?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: "Vexa is open source, self-hostable, and ~37% cheaper. Full-service Vexa costs $0.45/hr vs Recall.ai's approximately $0.72/hr at scale. See the detailed comparison at vexa.ai/compare/recall-ai.",
                  },
                },
                {
                  '@type': 'Question',
                  name: "What's the Individual plan for?",
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The Individual plan ($12/mo) is for single users who need one concurrent bot with unlimited meetings. It includes real-time transcription, recording, storage, REST API, WebSockets, and the UI Dashboard — everything you need for personal meeting intelligence. It supports Google Meet and Microsoft Teams, with Zoom coming soon.',
                  },
                },
              ],
            }),
          }}
        />
      </div>
    </section>
  );
}
