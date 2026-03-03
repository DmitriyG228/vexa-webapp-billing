import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Open-Source Meeting Dashboard — Self-Hosted Transcription UI | Vexa',
  description:
    'Free, open-source meeting dashboard built with Next.js. View transcriptions, control bots, and explore the API. Self-host or use vexa.ai. Apache 2.0 licensed.',
  alternates: { canonical: 'https://vexa.ai/open-source-dashboard' },
  openGraph: {
    title: 'Open-Source Meeting Dashboard — Vexa',
    description:
      'A full meeting dashboard you can clone, run, and customize. Transcription viewer, bot control, API tutorial mode. Next.js, Apache 2.0.',
    url: 'https://vexa.ai/open-source-dashboard',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Open-Source Meeting Dashboard — Vexa',
    description:
      'Clone, run, vibe code. A full meeting dashboard built with Next.js. Apache 2.0 licensed.',
  },
};

const dashboardJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Vexa Dashboard',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web, Self-hosted',
  description:
    'Open-source meeting dashboard built with Next.js. Transcription viewer, bot control panel, and API tutorial mode. Apache 2.0 licensed.',
  url: 'https://vexa.ai/open-source-dashboard',
  downloadUrl: 'https://github.com/Vexa-ai/vexa-webapp',
  license: 'https://www.apache.org/licenses/LICENSE-2.0',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free and open source under Apache 2.0',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Vexa',
    url: 'https://vexa.ai',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://vexa.ai',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Open-Source Dashboard',
      item: 'https://vexa.ai/open-source-dashboard',
    },
  ],
};

const cardShadow =
  '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)';

const features = [
  {
    title: 'Transcription viewer',
    description:
      'Real-time and post-meeting transcripts with speaker diarization, timestamps, and full-text search.',
  },
  {
    title: 'Bot control panel',
    description:
      'Send bots to Google Meet, Teams, or Zoom. Monitor status, start/stop recording, view live transcription.',
  },
  {
    title: 'API tutorial mode',
    description:
      'Interactive walkthrough of the Vexa API. See requests and responses as you use the dashboard.',
  },
  {
    title: 'Built with Next.js',
    description:
      'Modern React stack with App Router, server components, and Tailwind CSS. Easy to understand and extend.',
  },
  {
    title: 'Self-host in minutes',
    description:
      'git clone, npm install, npm run dev. Point at any Vexa API instance — cloud or self-hosted.',
  },
  {
    title: 'Vibe code friendly',
    description:
      'Thin UI layer over the Vexa API. Add features, restyle, integrate with your existing tools. No black boxes.',
  },
];

export default function OpenSourceDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dashboardJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-4">
          Open Source
        </span>
        <h1 className="text-[34px] sm:text-[40px] lg:text-[48px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
          Open-source
          <br />
          <em className="not-italic font-light text-gray-400 dark:text-gray-500">
            meeting dashboard
          </em>
        </h1>
        <p className="mt-4 text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-xl mx-auto">
          A full meeting app you can clone, run, and customize. Transcription
          viewer, bot control, API tutorial mode&mdash;built with Next.js,
          Apache&nbsp;2.0 licensed.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="https://github.com/Vexa-ai/vexa-webapp"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </Link>
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[14px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
          >
            Try hosted version
          </Link>
        </div>
      </div>

      {/* Quick start */}
      <div
        className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden mb-14"
        style={{ boxShadow: cardShadow }}
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50">
            Quick start
          </h2>
        </div>
        <div className="bg-[#111111] p-6 font-mono text-[13px] leading-[1.9]">
          <div className="text-gray-500"># Clone and run</div>
          <div>
            <span className="text-[#6ee7b7]">git clone</span>{' '}
            <span className="text-gray-300">
              https://github.com/Vexa-ai/vexa-webapp.git
            </span>
          </div>
          <div>
            <span className="text-[#6ee7b7]">cd</span>{' '}
            <span className="text-gray-300">vexa-webapp</span>
          </div>
          <div>
            <span className="text-[#6ee7b7]">npm install</span>
          </div>
          <div>
            <span className="text-[#6ee7b7]">npm run dev</span>
          </div>
          <div className="mt-3 text-gray-500">
            # Open http://localhost:3000
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="mb-14">
        <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50 text-center mb-10">
          What&apos;s
          <br />
          <em className="not-italic font-light text-gray-400 dark:text-gray-500">
            included
          </em>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
              style={{ boxShadow: cardShadow }}
            >
              <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
                {feature.title}
              </h3>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison section */}
      <div
        className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden mb-14"
        style={{ boxShadow: cardShadow }}
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50">
            Open source vs closed alternatives
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          {[
            ['Full source code', 'Fork, audit, extend. No black boxes.'],
            [
              'Self-host anywhere',
              'Docker, Kubernetes, or npm run dev. Your infrastructure, your data.',
            ],
            [
              'No vendor lock-in',
              'Apache 2.0 license. Use it commercially, modify it freely.',
            ],
            [
              'Vibe code ready',
              'Thin UI layer. Add your own features, integrate your own tools.',
            ],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-3 px-6 py-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-900 dark:text-gray-100 shrink-0 mt-0.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <span className="text-[14px] font-medium text-gray-950 dark:text-gray-50">
                  {title}
                </span>
                <span className="text-[14px] text-gray-500 dark:text-gray-400">
                  {' '}
                  &mdash; {desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 lg:p-10 text-center"
        style={{ boxShadow: cardShadow }}
      >
        <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50 mb-3">
          Get started in minutes
        </h2>
        <p className="text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] mb-6 max-w-lg mx-auto">
          Clone the repo and run locally, or use the hosted version at vexa.ai
          with zero setup. Same dashboard, your choice.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="https://github.com/Vexa-ai/vexa-webapp"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
          >
            Clone from GitHub
          </Link>
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[14px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
          >
            Try hosted version
          </Link>
          <Link
            href="https://docs.vexa.ai"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[14px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
          >
            Read the docs
          </Link>
        </div>
      </div>
    </div>
  );
}
