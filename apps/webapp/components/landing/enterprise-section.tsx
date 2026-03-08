import Link from 'next/link';

const cardShadow =
  '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)';

const CheckIcon = () => (
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
    className="text-gray-900 dark:text-gray-100 flex-shrink-0"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function EnterpriseSection() {
  return (
    <section className="py-16 lg:py-20 border-t border-gray-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: copy */}
          <div className="flex flex-col gap-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm w-fit">
              Enterprise
            </span>
            <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
              Meeting intelligence you
              <br />
              <em className="not-italic font-light text-gray-400 dark:text-gray-500">
                control completely
              </em>
            </h2>
            <p className="text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-[480px]">
              The only open-source meeting bot infrastructure you can deploy on
              your own servers. Full source code access, on-premises deployment,
              and complete data sovereignty&mdash;meeting data never leaves your
              network.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={
                  process.env.NEXT_PUBLIC_CAL_URL ||
                  'https://cal.com/dmitrygrankin/30-min'
                }
                target="_blank"
                className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
              >
                Book a call
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="https://github.com/Vexa-ai/vexa"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[14px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
                </svg>
                View on GitHub
              </Link>
            </div>
          </div>

          {/* Right: feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Self-hosted */}
            <div
              className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
              style={{ boxShadow: cardShadow }}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500 dark:text-gray-400"
                >
                  <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                  <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                  <line x1="6" x2="6.01" y1="6" y2="6" />
                  <line x1="6" x2="6.01" y1="18" y2="18" />
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
                Self-hosted deployment
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.6]">
                Docker, Kubernetes, OpenShift, or bare metal. Deploy wherever
                your compliance requires.
              </p>
            </div>

            {/* Data sovereignty */}
            <div
              className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
              style={{ boxShadow: cardShadow }}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500 dark:text-gray-400"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
                Data sovereignty
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.6]">
                Meeting data never leaves your network. GDPR, HIPAA-ready, full
                audit trail.
              </p>
            </div>

            {/* Apache 2.0 */}
            <div
              className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
              style={{ boxShadow: cardShadow }}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500 dark:text-gray-400"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
                Apache 2.0 licensed
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.6]">
                Audit every line of code. No vendor lock-in, no surprise license
                changes.
              </p>
            </div>

            {/* Community credibility */}
            <div
              className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
              style={{ boxShadow: cardShadow }}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500 dark:text-gray-400"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
                Trusted communities
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.6]">
                Trusted in ASWF and FINOS open source communities&mdash;film
                studios and banks.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom feature list */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2">
            <CheckIcon />
            <span className="text-[13px] text-gray-600 dark:text-gray-300">
              Google Meet + Teams + Zoom
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon />
            <span className="text-[13px] text-gray-600 dark:text-gray-300">
              Real-time transcription
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon />
            <span className="text-[13px] text-gray-600 dark:text-gray-300">
              Dedicated support engineer
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon />
            <span className="text-[13px] text-gray-600 dark:text-gray-300">
              SLA + monthly review
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
