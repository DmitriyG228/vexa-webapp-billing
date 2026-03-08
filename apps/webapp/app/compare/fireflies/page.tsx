import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vexa vs Fireflies.ai — Open-Source Meeting Bot API Comparison (2026)',
  description:
    'Compare Vexa and Fireflies.ai side by side. Vexa is open source, self-hostable, and developer-first. Fireflies is a closed-source consumer notetaker. Feature comparison and pricing breakdown.',
  alternates: { canonical: 'https://vexa.ai/compare/fireflies' },
  openGraph: {
    title: 'Vexa vs Fireflies.ai — Open Source vs Consumer Notetaker',
    description:
      'Open source API vs closed SaaS. Self-hostable vs cloud-only. Developer-first vs consumer product. See the full comparison.',
    url: 'https://vexa.ai/compare/fireflies',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vexa vs Fireflies.ai — Meeting Bot API Comparison',
    description:
      'Open source, self-hostable, developer-first. Compare Vexa and Fireflies.ai side by side.',
  },
};

const CheckIcon = ({ active = false }: { active?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}><polyline points="20 6 9 17 4 12" /></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600"><path d="M18 6 6 18M6 6l12 12" /></svg>
);

const comparisonRows = [
  { feature: 'Open source', vexa: true, competitor: false },
  { feature: 'Self-hostable', vexa: true, competitor: false },
  { feature: 'Developer API', vexa: true, competitor: false },
  { feature: 'Google Meet', vexa: true, competitor: true },
  { feature: 'Microsoft Teams', vexa: true, competitor: true },
  { feature: 'Zoom', vexa: true, competitor: true },
  { feature: 'Real-time transcription', vexa: true, competitor: true },
  { feature: 'Recording + storage', vexa: true, competitor: true },
  { feature: 'Interactive bots (TTS)', vexa: true, competitor: false },
  { feature: 'Screenshare from bot', vexa: true, competitor: false },
  { feature: 'MCP server', vexa: true, competitor: true },
  { feature: 'n8n integration', vexa: true, competitor: false },
  { feature: 'On-premises deployment', vexa: true, competitor: false },
  { feature: 'Apache 2.0 license', vexa: true, competitor: false },
  { feature: 'REST API', vexa: true, competitor: false },
  { feature: 'WebSocket streaming', vexa: true, competitor: false },
  { feature: 'Meeting summaries', vexa: false, competitor: true },
  { feature: 'Consumer dashboard', vexa: false, competitor: true },
];

const cardShadow = '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)';

export default function CompareFirefliesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
      {/* Hero */}
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-4">
          Comparison
        </span>
        <h1 className="text-[34px] sm:text-[40px] lg:text-[48px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
          Vexa vs Fireflies.ai
        </h1>
        <p className="mt-4 text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-xl mx-auto">
          Open-source developer API vs closed-source consumer notetaker. Vexa gives you the infrastructure. Fireflies gives you the product.
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
            Bot infrastructure + storage. Transcription: +$0.10/hr. Self-host free.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-300"><CheckIcon active /> Open source (Apache 2.0)</div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-300"><CheckIcon active /> Full API: REST, WebSocket, MCP</div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
          <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">Fireflies.ai</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">$18</span>
            <span className="text-[14px] text-gray-400 dark:text-gray-500">/user/mo</span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4">
            Pro plan. Unlimited transcription, AI summaries, integrations.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400"><XIcon /> Closed source</div>
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400"><XIcon /> No self-host option</div>
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400"><XIcon /> No developer API</div>
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
            <span className="text-[13px] font-medium text-gray-400 dark:text-gray-500 text-center">Fireflies.ai</span>
          </div>
          {comparisonRows.map((row) => (
            <div key={row.feature} className="grid grid-cols-3 px-6 py-3 border-b border-gray-100 dark:border-neutral-800 last:border-b-0">
              <span className="text-[13px] text-gray-600 dark:text-gray-300">{row.feature}</span>
              <div className="flex justify-center">{row.vexa ? <CheckIcon active /> : <XIcon />}</div>
              <div className="flex justify-center">{row.competitor ? <CheckIcon /> : <XIcon />}</div>
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
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Developer-first API</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">REST API, WebSocket streaming, webhooks, and MCP server. Build meeting-aware applications, not just take notes.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Open source</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">Apache 2.0 licensed. Audit the code, fork it, self-host it. Fireflies is closed source with no self-host option.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Data sovereignty</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">Deploy on your own infrastructure. Meeting data never leaves your network. Critical for regulated industries.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Interactive bots</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">TTS speak, listen, respond, and screenshare from bots. Build truly interactive meeting experiences.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Usage-based pricing</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">Pay $0.30/hr per bot, not per seat. Scale from 1 to 1,000 bots without per-user fees eating your margin.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">n8n + MCP native</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">First-party MCP server and n8n workflow integration. Connect AI agents directly to meeting data.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 lg:p-10 mb-14" style={{ boxShadow: cardShadow }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50 mb-3">
            Build with meeting data, not just capture it
          </h2>
          <p className="text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] mb-6">
            Fireflies is great for teams who need meeting notes. Vexa is for developers who need meeting infrastructure&mdash;bots, transcription, and data via API.
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
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Is Vexa a competitor to Fireflies.ai?</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">They serve different audiences. Fireflies is a consumer notetaker for teams who want meeting summaries. Vexa is developer infrastructure for building meeting-aware applications. If you need an API, choose Vexa. If you need a ready-made notetaker, choose Fireflies.</p>
          </div>
          <div className="py-5">
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Can I self-host Vexa like Fireflies?</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">Vexa is fully self-hostable (Apache 2.0). Fireflies is cloud-only with no self-host option. Deploy Vexa on your infrastructure with Docker, Kubernetes, or OpenShift.</p>
          </div>
          <div className="py-5">
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Does Vexa have AI meeting summaries like Fireflies?</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">Vexa provides the raw infrastructure: bots, transcription, and real-time data via API. You bring your own AI for summaries, analysis, or any custom processing. This gives you full control over the AI stack.</p>
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
                name: 'Is Vexa a competitor to Fireflies.ai?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'They serve different audiences. Fireflies is a consumer notetaker for teams who want meeting summaries. Vexa is developer infrastructure for building meeting-aware applications. If you need an API, choose Vexa. If you need a ready-made notetaker, choose Fireflies.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I self-host Vexa like Fireflies?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Vexa is fully self-hostable (Apache 2.0). Fireflies is cloud-only with no self-host option. Deploy Vexa on your infrastructure with Docker, Kubernetes, or OpenShift.',
                },
              },
              {
                '@type': 'Question',
                name: 'Does Vexa have AI meeting summaries like Fireflies?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Vexa provides the raw infrastructure: bots, transcription, and real-time data via API. You bring your own AI for summaries, analysis, or any custom processing. This gives you full control over the AI stack.',
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
