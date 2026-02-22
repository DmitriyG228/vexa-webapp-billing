import Link from 'next/link';

export function BlogPostFooter() {
  return (
    <footer className="mt-16 pt-12 border-t border-gray-100 dark:border-neutral-800">
      {/* CTA cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary CTA */}
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950 p-8 flex flex-col justify-between min-h-[200px]">
          <div>
            <h3 className="text-[20px] font-semibold text-gray-950 dark:text-gray-50 leading-tight mb-2">
              Ready to get started?
            </h3>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Deploy meeting bots, capture transcriptions, and build meeting intelligence — in minutes.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Start for free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center px-5 py-2.5 rounded-full text-gray-500 dark:text-gray-400 text-[14px] font-medium hover:text-gray-950 dark:hover:text-gray-200 transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950 p-8 flex flex-col justify-between min-h-[200px]">
          <div>
            <h3 className="text-[20px] font-semibold text-gray-950 dark:text-gray-50 leading-tight mb-2">
              Explore the docs
            </h3>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Open-source meeting bot API. Self-host on your infrastructure or use our cloud.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Link
              href="/documentation_new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Read docs
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="https://github.com/Vexa-ai/vexa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-gray-500 dark:text-gray-400 text-[14px] font-medium hover:text-gray-950 dark:hover:text-gray-200 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
