import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | Vexa — Talk to Our Team',
  description:
    'Talk to our team about self-hosted deployment, compliance, custom integrations, and enterprise pricing. Book a 30-minute call or reach us by email.',
  alternates: { canonical: 'https://vexa.ai/contact' },
  openGraph: {
    title: 'Contact Vexa — Book a Call',
    description:
      'Talk to our team about enterprise deployment, compliance, and custom integrations.',
    url: 'https://vexa.ai/contact',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
};

const calUrl =
  process.env.NEXT_PUBLIC_CAL_URL || 'https://cal.com/dmitrygrankin/30-min';

const cardShadow =
  '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)';

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-4">
            Contact
          </span>
          <h1 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
            Talk to
            <br />
            <em className="not-italic font-light text-gray-400 dark:text-gray-500">
              our team
            </em>
          </h1>
          <p className="mt-4 text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7]">
            Whether you need help with self-hosted deployment, compliance
            requirements, or custom integrations&mdash;we&apos;re here to help.
          </p>
        </div>

        {/* Book a call card */}
        <div
          className="rounded-2xl border-2 border-gray-950 dark:border-gray-200 bg-white dark:bg-neutral-900 p-8 text-center mb-6"
          style={{ boxShadow: cardShadow }}
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500 dark:text-gray-400"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>
          <h2 className="text-[20px] font-semibold text-gray-950 dark:text-gray-50 mb-2">
            Book a 30-minute call
          </h2>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-6 max-w-md mx-auto">
            Discovery calls are free. We&apos;ll discuss your requirements, walk
            through deployment options, and answer technical questions.
          </p>
          <Link
            href={calUrl}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
          >
            Schedule a call
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
        </div>

        {/* Alternatives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {/* Email */}
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
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h3 className="text-[14px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
              Email
            </h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.6]">
              Prefer email? Reach us at{' '}
              <Link
                href="mailto:team@vexa.ai"
                className="text-gray-700 dark:text-gray-300 underline underline-offset-2"
              >
                team@vexa.ai
              </Link>
              . We typically respond within 24 hours.
            </p>
          </div>

          {/* Community */}
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
              Community
            </h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.6]">
              Join our{' '}
              <Link
                href="https://discord.gg/Ga9duGkVz9"
                target="_blank"
                className="text-gray-700 dark:text-gray-300 underline underline-offset-2"
              >
                Discord
              </Link>{' '}
              for community support, feature requests, and connecting with other
              developers.
            </p>
          </div>
        </div>

        {/* What we can help with */}
        <div className="text-center">
          <h2 className="text-[20px] font-semibold text-gray-950 dark:text-gray-50 mb-6">
            What we can help with
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Self-hosted deployment',
              'Kubernetes / OpenShift setup',
              'GDPR compliance',
              'HIPAA readiness',
              'Custom integrations',
              'API architecture',
              'Migration from Recall.ai',
              'Enterprise licensing',
            ].map((item) => (
              <span
                key={item}
                className="inline-flex px-3 py-1.5 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[12px] text-gray-500 dark:text-gray-400 font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
