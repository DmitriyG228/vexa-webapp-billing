import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vexa vs Recall.ai — Open-Source Meeting Bot API Comparison (2026)',
  description:
    'Compare Vexa and Recall.ai side by side. Vexa is open source, self-hostable, and 30% cheaper. Feature comparison, pricing breakdown, and migration guide.',
  alternates: { canonical: 'https://vexa.ai/compare/recall-ai' },
  openGraph: {
    title: 'Vexa vs Recall.ai — Which Meeting Bot API?',
    description:
      'Open source vs closed source. $0.45/hr vs $0.72/hr. Self-host option vs cloud-only. See the full comparison.',
    url: 'https://vexa.ai/compare/recall-ai',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vexa vs Recall.ai — Open-Source Meeting Bot API',
    description:
      '30% cheaper, open source, self-hostable. Compare Vexa and Recall.ai side by side.',
  },
};

const CheckIcon = ({ active = false }: { active?: boolean }) => (
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
    className={active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
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
    className="text-gray-300 dark:text-gray-600"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const comparisonRows = [
  { feature: 'Open source', vexa: true, recall: false },
  { feature: 'Self-hostable', vexa: true, recall: false },
  { feature: 'Google Meet', vexa: true, recall: true },
  { feature: 'Microsoft Teams', vexa: true, recall: true },
  { feature: 'Zoom', vexa: true, recall: true },
  { feature: 'Real-time transcription', vexa: true, recall: true },
  { feature: 'Recording + storage', vexa: true, recall: true },
  { feature: 'Interactive bots (TTS)', vexa: true, recall: false },
  { feature: 'Screenshare from bot', vexa: true, recall: false },
  { feature: 'MCP server', vexa: true, recall: false },
  { feature: 'n8n integration', vexa: true, recall: false },
  { feature: 'On-premises deployment', vexa: true, recall: false },
  { feature: 'Apache 2.0 license', vexa: true, recall: false },
  { feature: 'REST API', vexa: true, recall: true },
  { feature: 'WebSocket streaming', vexa: true, recall: true },
  { feature: 'Webhooks', vexa: true, recall: true },
];

const cardShadow =
  '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)';

export default function CompareRecallAiPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
      {/* Hero */}
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-4">
          Comparison
        </span>
        <h1 className="text-[34px] sm:text-[40px] lg:text-[48px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
          Vexa vs Recall.ai
        </h1>
        <p className="mt-4 text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-xl mx-auto">
          Open source vs closed source. Self-hostable vs cloud-only. 30%
          cheaper. See how Vexa compares to Recall.ai for meeting bot
          infrastructure.
        </p>
      </div>

      {/* Pricing comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-14">
        {/* Vexa pricing */}
        <div
          className="rounded-2xl border-2 border-gray-950 dark:border-gray-200 bg-white dark:bg-neutral-900 p-6"
          style={{ boxShadow: cardShadow }}
        >
          <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">
            Vexa
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">
              $0.45
            </span>
            <span className="text-[14px] text-gray-400 dark:text-gray-500">
              /hr
            </span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4">
            Bot + real-time transcription + 12-month audio storage
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-300">
              <CheckIcon active /> Real-time transcription included
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-300">
              <CheckIcon active /> Open source — self-host free
            </div>
          </div>
        </div>

        {/* Recall pricing */}
        <div
          className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
          style={{ boxShadow: cardShadow }}
        >
          <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">
            Recall.ai
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">
              $0.50
            </span>
            <span className="text-[14px] text-gray-400 dark:text-gray-500">
              /hr PAYG
            </span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4">
            Pay-as-you-go rate. Volume commitments ~$0.72/hr effective
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400">
              <XIcon /> No self-host option
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400">
              <XIcon /> Closed source
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400">
              <XIcon /> Vendor lock-in
            </div>
          </div>
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="mb-14">
        <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50 text-center mb-10">
          Feature
          <br />
          <em className="not-italic font-light text-gray-400 dark:text-gray-500">
            comparison
          </em>
        </h2>
        <div
          className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
          style={{ boxShadow: cardShadow }}
        >
          {/* Table header */}
          <div className="grid grid-cols-3 px-6 py-3 border-b border-gray-100 dark:border-neutral-800">
            <span className="text-[13px] font-medium text-gray-400 dark:text-gray-500">
              Feature
            </span>
            <span className="text-[13px] font-medium text-gray-950 dark:text-gray-50 text-center">
              Vexa
            </span>
            <span className="text-[13px] font-medium text-gray-400 dark:text-gray-500 text-center">
              Recall.ai
            </span>
          </div>
          {/* Table rows */}
          {comparisonRows.map((row) => (
            <div
              key={row.feature}
              className="grid grid-cols-3 px-6 py-3 border-b border-gray-100 dark:border-neutral-800 last:border-b-0"
            >
              <span className="text-[13px] text-gray-600 dark:text-gray-300">
                {row.feature}
              </span>
              <div className="flex justify-center">
                {row.vexa ? <CheckIcon active /> : <XIcon />}
              </div>
              <div className="flex justify-center">
                {row.recall ? <CheckIcon /> : <XIcon />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key differentiators */}
      <div className="mb-14">
        <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50 text-center mb-10">
          Why developers
          <br />
          <em className="not-italic font-light text-gray-400 dark:text-gray-500">
            choose Vexa
          </em>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
              ~37% cheaper
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">
              $0.45/hr all-in vs Recall.ai&apos;s ~$0.72/hr at
              volume commitments. Same capabilities, lower cost.
            </p>
          </div>
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
              Open source
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">
              Apache 2.0 licensed. Audit the code, fork it, self-host it. No
              vendor lock-in, no surprise pricing changes.
            </p>
          </div>
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
              Self-host when ready
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">
              Start with our cloud, migrate to self-hosted when you scale.
              Docker, Kubernetes, OpenShift, or bare metal.
            </p>
          </div>
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
              MCP + n8n native
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">
              First-party MCP server and n8n workflow integration. Connect AI
              agents directly to meeting data.
            </p>
          </div>
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
              Interactive bots
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">
              TTS speak, listen, respond, and screenshare from bots. Build truly
              interactive meeting experiences.
            </p>
          </div>
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
              Same API patterns
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">
              Familiar REST API patterns. If you&apos;ve used Recall.ai,
              migrating to Vexa takes hours, not weeks.
            </p>
          </div>
        </div>
      </div>

      {/* Migration section */}
      <div
        className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 lg:p-10 mb-14"
        style={{ boxShadow: cardShadow }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50 mb-3">
            Switching from Recall.ai?
          </h2>
          <p className="text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] mb-6">
            Same REST API patterns&mdash;migrate in hours. Send bots with one
            API call, get transcription via webhook or WebSocket. Your existing
            integration logic transfers directly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
            >
              Get started free
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
              href="https://docs.vexa.ai"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[14px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
            >
              Read the docs
            </Link>
          </div>
          <p className="mt-3 text-[12px] text-gray-400 dark:text-gray-500">
            No credit card required
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50 text-center mb-8">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          <div className="py-5">
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
              Is Vexa a drop-in replacement for Recall.ai?
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">
              Vexa uses similar REST API patterns for sending bots, managing
              meetings, and retrieving transcriptions. While not identical
              endpoints, the migration is straightforward&mdash;most teams
              complete it in hours.
            </p>
          </div>
          <div className="py-5">
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
              How is Vexa ~37% cheaper?
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">
              Vexa&apos;s full-service rate (bot + real-time transcription) is
              $0.45/hr compared to Recall.ai&apos;s equivalent at ~$0.72/hr at
              volume. We keep costs low with efficient infrastructure and
              open-source development.
            </p>
          </div>
          <div className="py-5">
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
              Can I start with Vexa cloud and move to self-hosted later?
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">
              Yes. Start with our managed cloud at $0.45/hr. When you&apos;re
              ready to scale or need data sovereignty, deploy the same
              open-source code on your own infrastructure with Docker,
              Kubernetes, or OpenShift.
            </p>
          </div>
        </div>
      </div>

      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Is Vexa a drop-in replacement for Recall.ai?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Vexa uses similar REST API patterns for sending bots, managing meetings, and retrieving transcriptions. While not identical endpoints, the migration is straightforward — most teams complete it in hours.',
                },
              },
              {
                '@type': 'Question',
                name: 'How is Vexa ~37% cheaper than Recall.ai?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "Vexa's full-service rate (bot + real-time transcription) is $0.45/hr compared to Recall.ai's equivalent at approximately $0.72/hr at volume. We keep costs low with efficient infrastructure and open-source development.",
                },
              },
              {
                '@type': 'Question',
                name: 'Can I start with Vexa cloud and move to self-hosted later?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Start with our managed cloud at $0.45/hr. When you are ready to scale or need data sovereignty, deploy the same open-source code on your own infrastructure with Docker, Kubernetes, or OpenShift.',
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
