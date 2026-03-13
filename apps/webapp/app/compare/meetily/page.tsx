import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vexa vs Meetily — Meeting Bot API vs Desktop Transcription (2026)',
  description:
    'Compare Vexa and Meetily side by side. Vexa is a cloud API for meeting bots with real-time transcription. Meetily is a desktop app. API access, multi-platform bots, and self-hosting options compared.',
  alternates: { canonical: 'https://vexa.ai/compare/meetily' },
  openGraph: {
    title: 'Vexa vs Meetily — Cloud API vs Desktop App',
    description:
      'Vexa: meeting bot API with REST, WebSocket, MCP. Meetily: desktop transcription app. Compare features, deployment, and use cases.',
    url: 'https://vexa.ai/compare/meetily',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vexa vs Meetily — Meeting Bot API Comparison',
    description:
      'Cloud API with bots vs desktop transcription. Open source, multi-platform, developer-first.',
  },
};

const CheckIcon = ({ active = false }: { active?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}><polyline points="20 6 9 17 4 12" /></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600"><path d="M18 6 6 18M6 6l12 12" /></svg>
);

const comparisonRows = [
  { feature: 'Open source', vexa: true, meetily: true },
  { feature: 'Cloud API', vexa: true, meetily: false },
  { feature: 'Meeting bots', vexa: true, meetily: false },
  { feature: 'Google Meet', vexa: true, meetily: false },
  { feature: 'Microsoft Teams', vexa: true, meetily: false },
  { feature: 'Zoom', vexa: true, meetily: false },
  { feature: 'REST API', vexa: true, meetily: false },
  { feature: 'WebSocket streaming', vexa: true, meetily: false },
  { feature: 'MCP server', vexa: true, meetily: false },
  { feature: 'n8n integration', vexa: true, meetily: false },
  { feature: 'Real-time transcription', vexa: true, meetily: true },
  { feature: 'Interactive bots (TTS)', vexa: true, meetily: false },
  { feature: 'Self-hostable', vexa: true, meetily: true },
  { feature: 'Desktop app', vexa: false, meetily: true },
  { feature: 'Local-only processing', vexa: false, meetily: true },
  { feature: 'Managed cloud option', vexa: true, meetily: false },
];

const cardShadow = '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)';

export default function CompareMeetilyPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
      {/* Hero */}
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-4">
          Comparison
        </span>
        <h1 className="text-[34px] sm:text-[40px] lg:text-[48px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
          Vexa vs Meetily
        </h1>
        <p className="mt-4 text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-xl mx-auto">
          Cloud meeting bot API vs desktop transcription app. Vexa sends bots to meetings via API. Meetily records locally on your desktop.
        </p>
      </div>

      {/* Pricing comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-14">
        <div className="rounded-2xl border-2 border-gray-950 dark:border-gray-200 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
          <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">Vexa</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">$0.30</span>
            <span className="text-[14px] text-gray-400 dark:text-gray-500">/hr</span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4">
            Cloud API + meeting bots + storage. Transcription: +$0.20/hr. Self-host free.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-300"><CheckIcon active /> REST API, WebSocket, MCP, n8n</div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-300"><CheckIcon active /> Bots for Meet, Teams, Zoom</div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
          <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">Meetily</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">Free</span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4">
            Desktop app. Pro $10/user/mo. Organizations $1,999/yr.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400"><XIcon /> No API access</div>
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400"><XIcon /> No meeting bots</div>
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400"><XIcon /> Desktop only</div>
          </div>
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="mb-14">
        <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50 text-center mb-10">
          Feature<br /><em className="not-italic font-light text-gray-400 dark:text-gray-500">comparison</em>
        </h2>
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden" style={{ boxShadow: cardShadow }}>
          <div className="grid grid-cols-3 px-6 py-3 border-b border-gray-100 dark:border-neutral-800">
            <span className="text-[13px] font-medium text-gray-400 dark:text-gray-500">Feature</span>
            <span className="text-[13px] font-medium text-gray-950 dark:text-gray-50 text-center">Vexa</span>
            <span className="text-[13px] font-medium text-gray-400 dark:text-gray-500 text-center">Meetily</span>
          </div>
          {comparisonRows.map((row) => (
            <div key={row.feature} className="grid grid-cols-3 px-6 py-3 border-b border-gray-100 dark:border-neutral-800 last:border-b-0">
              <span className="text-[13px] text-gray-600 dark:text-gray-300">{row.feature}</span>
              <div className="flex justify-center">{row.vexa ? <CheckIcon active /> : <XIcon />}</div>
              <div className="flex justify-center">{row.meetily ? <CheckIcon /> : <XIcon />}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key differentiators */}
      <div className="mb-14">
        <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50 text-center mb-10">
          Why developers<br /><em className="not-italic font-light text-gray-400 dark:text-gray-500">choose Vexa</em>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Cloud API, not desktop</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">Vexa sends bots to any meeting via a single API call. No desktop app needed. Integrate meeting data into any backend, workflow, or AI agent.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">3-platform bots</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">Google Meet, Microsoft Teams, and Zoom with one unified API. Meetily only records from your local desktop audio.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">MCP + n8n native</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">First-party MCP server and n8n workflow integration. Connect AI agents directly to meeting data.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Interactive bots</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">TTS speak, listen, respond, and screenshare from bots. Build truly interactive meeting experiences.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Real-time streaming</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">WebSocket streaming for live transcription data. Get speaker-labeled text as the meeting happens, not after.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Both open source</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">Both Vexa (Apache 2.0) and Meetily (MIT) are open source. Vexa adds cloud infrastructure, API access, and multi-platform bot support.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 lg:p-10 mb-14" style={{ boxShadow: cardShadow }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50 mb-3">
            Need an API, not a desktop app?
          </h2>
          <p className="text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] mb-6">
            Vexa gives you meeting bot infrastructure as an API. Send bots to meetings, get real-time transcription, recordings, and structured data via REST, WebSocket, or MCP.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/get-started" className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm">
              Get started free
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="https://docs.vexa.ai" target="_blank" className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[14px] font-medium hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all">
              Read the docs
            </Link>
          </div>
          <p className="mt-3 text-[12px] text-gray-400 dark:text-gray-500">No credit card required</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50 text-center mb-8">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          <div className="py-5">
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">What is the main difference between Vexa and Meetily?</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">Vexa is a cloud API that sends meeting bots to Google Meet, Teams, and Zoom. Meetily is a desktop app that captures audio from your local machine. Vexa is built for developers who need programmatic access to meeting data; Meetily is built for individuals who want local transcription.</p>
          </div>
          <div className="py-5">
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Does Vexa require a desktop app?</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">No. Vexa is entirely API-driven. Send a meeting URL via REST API, and Vexa deploys a bot that joins, records, and transcribes the meeting. No desktop installation needed.</p>
          </div>
          <div className="py-5">
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Are both Vexa and Meetily open source?</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">Yes. Vexa is Apache 2.0 licensed and Meetily is MIT licensed. Both can be self-hosted. Vexa adds cloud infrastructure, meeting bots, API access, and multi-platform support on top of the open-source core.</p>
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
                name: 'What is the main difference between Vexa and Meetily?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Vexa is a cloud API that sends meeting bots to Google Meet, Teams, and Zoom. Meetily is a desktop app that captures audio from your local machine. Vexa is built for developers who need programmatic access to meeting data; Meetily is built for individuals who want local transcription.',
                },
              },
              {
                '@type': 'Question',
                name: 'Does Vexa require a desktop app?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No. Vexa is entirely API-driven. Send a meeting URL via REST API, and Vexa deploys a bot that joins, records, and transcribes the meeting. No desktop installation needed.',
                },
              },
              {
                '@type': 'Question',
                name: 'Are both Vexa and Meetily open source?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Vexa is Apache 2.0 licensed and Meetily is MIT licensed. Both can be self-hosted. Vexa adds cloud infrastructure, meeting bots, API access, and multi-platform support on top of the open-source core.',
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
