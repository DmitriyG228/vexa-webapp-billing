import Link from 'next/link';
import { getDashboardUrl } from '@/lib/utils';

const cardShadow =
  '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)';

export function OpenSourceSection() {
  return (
    <section className="py-16 lg:py-20 border-t border-gray-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: copy */}
          <div className="flex flex-col gap-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm w-fit">
              Open Source
            </span>
            <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
              Your meeting app,{' '}
              <br />
              <em className="not-italic font-light text-gray-400 dark:text-gray-500">
                your way
              </em>
            </h2>
            <p className="text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-[480px]">
              A thin Next.js dashboard you can clone, customize, and
              self-host&mdash;or use our hosted version instantly. Manage
              meeting bots, view transcripts, and track usage from one clean
              interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={getDashboardUrl()}
                className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
              >
                Try hosted
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
                Clone &amp; customize
              </Link>
            </div>
          </div>

          {/* Right: feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Thin Next.js UI */}
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
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
                Thin Next.js UI
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.6]">
                Clean React codebase, easy to read and extend. Add features,
                restyle, or vibe code your own workflows.
              </p>
            </div>

            {/* Clone and run */}
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
                  <path d="M4 17l6-6-6-6" />
                  <path d="M12 19h8" />
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
                Clone and run
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.6]">
                <code className="text-[12px] bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">git clone</code>,{' '}
                <code className="text-[12px] bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">npm install</code>,{' '}
                <code className="text-[12px] bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">npm run dev</code>.
                Running in under a minute.
              </p>
            </div>

            {/* Hosted option */}
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
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
                Or use hosted
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.6]">
                Skip setup entirely. Sign in with Google and start managing
                meeting bots in seconds.
              </p>
            </div>

            {/* Vibe code */}
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
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
                Vibe code it
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.6]">
                Feed the codebase to your AI coding assistant. Add custom
                views, integrations, or a whole new UX.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
