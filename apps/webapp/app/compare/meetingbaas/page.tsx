import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vexa vs Meeting BaaS — Open-Source Meeting Bot API Comparison (2026)',
  description:
    'Compare Vexa and Meeting BaaS side by side. Both offer meeting bot APIs. Vexa is Apache 2.0 (true open source), Meeting BaaS uses BSL. Pricing, features, and licensing compared.',
  alternates: { canonical: 'https://vexa.ai/compare/meetingbaas' },
  openGraph: {
    title: 'Vexa vs Meeting BaaS — Which Meeting Bot API?',
    description:
      'Apache 2.0 vs Business Source License. True open source vs source-available. Compare meeting bot APIs side by side.',
    url: 'https://vexa.ai/compare/meetingbaas',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vexa vs Meeting BaaS — Meeting Bot API Comparison',
    description:
      'True open source (Apache 2.0) vs source-available (BSL). Compare meeting bot APIs.',
  },
};

const CheckIcon = ({ active = false }: { active?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}><polyline points="20 6 9 17 4 12" /></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600"><path d="M18 6 6 18M6 6l12 12" /></svg>
);

const PartialIcon = () => (
  <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">BSL</span>
);

const comparisonRows = [
  { feature: 'Open source (OSI-approved)', vexa: true, competitor: false, competitorLabel: 'BSL' },
  { feature: 'Self-hostable', vexa: true, competitor: true, competitorLabel: null },
  { feature: 'Apache 2.0 license', vexa: true, competitor: false, competitorLabel: 'BSL' },
  { feature: 'Google Meet', vexa: true, competitor: true, competitorLabel: null },
  { feature: 'Microsoft Teams', vexa: true, competitor: true, competitorLabel: null },
  { feature: 'Zoom', vexa: true, competitor: true, competitorLabel: null },
  { feature: 'Real-time transcription', vexa: true, competitor: true, competitorLabel: null },
  { feature: 'Recording + storage', vexa: true, competitor: true, competitorLabel: null },
  { feature: 'Interactive bots (TTS)', vexa: true, competitor: false, competitorLabel: null },
  { feature: 'Screenshare from bot', vexa: true, competitor: false, competitorLabel: null },
  { feature: 'MCP server', vexa: true, competitor: false, competitorLabel: null },
  { feature: 'n8n integration', vexa: true, competitor: false, competitorLabel: null },
  { feature: 'REST API', vexa: true, competitor: true, competitorLabel: null },
  { feature: 'WebSocket streaming', vexa: true, competitor: true, competitorLabel: null },
  { feature: 'Webhooks', vexa: true, competitor: true, competitorLabel: null },
  { feature: 'Community Helm charts', vexa: true, competitor: false, competitorLabel: null },
];

const cardShadow = '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)';

export default function CompareMeetingBaasPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
      {/* Hero */}
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-4">
          Comparison
        </span>
        <h1 className="text-[34px] sm:text-[40px] lg:text-[48px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
          Vexa vs Meeting BaaS
        </h1>
        <p className="mt-4 text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-xl mx-auto">
          Both are meeting bot APIs. The key difference: Vexa is Apache 2.0 (true open source). Meeting BaaS uses Business Source License (source-available, not open source).
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
            Bot infrastructure + storage. Transcription: +$0.20/hr. Self-host free.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-300"><CheckIcon active /> Apache 2.0 (true open source)</div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-300"><CheckIcon active /> MCP server + n8n integration</div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
          <div className="text-[13px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.06em] mb-2">Meeting BaaS</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[30px] font-semibold tracking-[-0.03em] text-gray-950 dark:text-gray-50">Varies</span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4">
            Meeting bot API. Contact for pricing.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400"><XIcon /> BSL (not OSI-approved open source)</div>
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400"><XIcon /> No MCP server</div>
            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400"><XIcon /> No interactive bots</div>
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
            <span className="text-[13px] font-medium text-gray-400 dark:text-gray-500 text-center">Meeting BaaS</span>
          </div>
          {comparisonRows.map((row) => (
            <div key={row.feature} className="grid grid-cols-3 px-6 py-3 border-b border-gray-100 dark:border-neutral-800 last:border-b-0">
              <span className="text-[13px] text-gray-600 dark:text-gray-300">{row.feature}</span>
              <div className="flex justify-center">{row.vexa ? <CheckIcon active /> : <XIcon />}</div>
              <div className="flex justify-center">
                {row.competitorLabel === 'BSL' ? <PartialIcon /> : row.competitor ? <CheckIcon /> : <XIcon />}
              </div>
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
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">True open source</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">Apache 2.0 is an OSI-approved license. Use, modify, and distribute freely. BSL restricts commercial use until a future date.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Interactive bots</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">TTS speak, listen, respond, and screenshare from bots. Build truly interactive meeting experiences that go beyond recording.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">MCP + n8n native</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">First-party MCP server and n8n workflow integration. Connect AI agents directly to meeting data.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Transparent pricing</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">$0.30/hr bot, $0.20/hr transcription. No hidden fees, no volume commitments, no sales calls required to get pricing.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Community Helm charts</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">Deploy on Kubernetes with community-maintained Helm charts. Production-ready from day one.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" style={{ boxShadow: cardShadow }}>
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-2">$5 free credit</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6]">Start building immediately with $5 free credit. No credit card required. Full API access from signup.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 lg:p-10 mb-14" style={{ boxShadow: cardShadow }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50 mb-3">
            True open source meeting bot API
          </h2>
          <p className="text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] mb-6">
            Apache 2.0 licensed. No BSL restrictions on commercial use. Deploy meeting bots on your infrastructure or use our managed cloud.
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
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">What is the difference between Apache 2.0 and BSL?</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">Apache 2.0 is an OSI-approved open-source license. You can use, modify, and distribute the code commercially without restrictions. BSL (Business Source License) restricts commercial use until a future conversion date. Vexa uses Apache 2.0. Meeting BaaS uses BSL.</p>
          </div>
          <div className="py-5">
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Can both Vexa and Meeting BaaS be self-hosted?</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">Both can be deployed on your infrastructure. The difference is licensing: Vexa&apos;s Apache 2.0 allows unrestricted commercial self-hosting. Meeting BaaS&apos;s BSL may restrict how you use it commercially.</p>
          </div>
          <div className="py-5">
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-2">Does Vexa support the same platforms as Meeting BaaS?</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.7]">Both support Google Meet, Microsoft Teams, and Zoom. Vexa additionally offers interactive bots with TTS, screenshare, MCP server integration, and n8n workflow automation.</p>
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
                name: 'What is the difference between Apache 2.0 and BSL?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Apache 2.0 is an OSI-approved open-source license. You can use, modify, and distribute the code commercially without restrictions. BSL (Business Source License) restricts commercial use until a future conversion date. Vexa uses Apache 2.0. Meeting BaaS uses BSL.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can both Vexa and Meeting BaaS be self-hosted?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "Both can be deployed on your infrastructure. The difference is licensing: Vexa's Apache 2.0 allows unrestricted commercial self-hosting. Meeting BaaS's BSL may restrict how you use it commercially.",
                },
              },
              {
                '@type': 'Question',
                name: 'Does Vexa support the same platforms as Meeting BaaS?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Both support Google Meet, Microsoft Teams, and Zoom. Vexa additionally offers interactive bots with TTS, screenshare, MCP server integration, and n8n workflow automation.',
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
