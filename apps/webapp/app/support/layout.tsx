import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Priority Support | Vexa',
  description: 'Get dedicated help building with Vexa. Prioritize features, get hands-on build help, and direct access to the founding team.',
  alternates: {
    canonical: 'https://vexa.ai/support',
  },
  openGraph: {
    title: 'Priority Support | Vexa',
    description: 'Get dedicated help building with Vexa. Prioritize features, get hands-on build help, and direct access to the founding team.',
    url: 'https://vexa.ai/support',
    siteName: 'Vexa',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Priority Support | Vexa',
    description: 'Get dedicated help building with Vexa. Prioritize features and direct access to the founding team.',
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
