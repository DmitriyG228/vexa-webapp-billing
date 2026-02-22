import Link from 'next/link';

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

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 lg:py-20 border-t border-gray-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-4">
            Pricing
          </span>
          <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
            From open source to
            <br />
            <em className="not-italic font-light text-gray-400 dark:text-gray-500">enterprise scale</em>
          </h2>
          <p className="mt-4 text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-lg mx-auto">
            Self-host for free, or let us run it for you. Pay only for what you use.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ── Open Source ───────────────────────────── */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)',
            }}
          >
            <div className="mb-5">
              <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">
                Open Source
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">
                  Free
                </span>
              </div>
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">
                Apache 2.0 &middot; Self-host forever
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
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Your infrastructure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Community support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Docker Compose deploy</span>
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
                Test free &middot; No credit card
              </p>
            </div>

            <div className="mb-3 pb-3 border-b border-gray-100 dark:border-neutral-800">
              <p className="text-[13px] text-gray-500 dark:text-gray-400">
                One bot &middot; Unlimited transcription
              </p>
            </div>

            <Link
              href="#"
              className="flex items-center justify-center gap-1 h-[40px] rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[13px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors mb-6"
            >
              Start here
              <ArrowIcon />
            </Link>
            <div className="space-y-2.5 mt-auto">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-gray-900 dark:text-gray-100" />
                <span className="text-[13px] text-gray-600 dark:text-gray-300">Google Meet + Teams</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-gray-900 dark:text-gray-100" />
                <span className="text-[13px] text-gray-600 dark:text-gray-300">Real-time transcription</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-gray-900 dark:text-gray-100" />
                <span className="text-[13px] text-gray-600 dark:text-gray-300">Recording + Bot API</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-gray-900 dark:text-gray-100" />
                <span className="text-[13px] text-gray-600 dark:text-gray-300">REST API + WebSockets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-gray-900 dark:text-gray-100" />
                <span className="text-[13px] text-gray-600 dark:text-gray-300">UI Dashboard</span>
              </div>
            </div>
          </div>

          {/* ── Startup ───────────────────────────────── */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)',
            }}
          >
            <div className="mb-5">
              <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">
                Startup
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[14px] text-gray-400 dark:text-gray-500">from</span>
                <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">
                  $150
                </span>
                <span className="text-[14px] text-gray-400 dark:text-gray-500">/mo</span>
              </div>
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">Managed cloud deployment</p>
            </div>
            <Link
              href="#"
              className="flex items-center justify-center h-[40px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[13px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all mb-6"
            >
              Talk to us
            </Link>
            <div className="space-y-2.5 mt-auto">
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Everything in Individual</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">+ Zoom support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Multi-tenant deployment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Speaking bot (TTS)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Real-time AI insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Custom workflows</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">White-label customization</span>
              </div>
            </div>
          </div>

          {/* ── Enterprise ────────────────────────────── */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)',
            }}
          >
            <div className="mb-5">
              <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">
                Enterprise
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">
                  Custom
                </span>
              </div>
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">
                On-premises &middot; Your cloud
              </p>
            </div>
            <Link
              href="#"
              className="flex items-center justify-center h-[40px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[13px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all mb-6"
            >
              Contact team
            </Link>
            <div className="space-y-2.5 mt-auto">
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Everything in Startup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">OpenShift + Kubernetes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">On-premises deployment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Dedicated support engineer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">Full data sovereignty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] text-gray-500 dark:text-gray-400">SLA + monthly review</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
