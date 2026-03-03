import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import AuthProvider from "@/components/AuthProvider"
import { AnnouncementBar } from '@/components/landing/announcement-bar'
import { MarketingHeader } from '@/components/landing/marketing-header'
import { MarketingFooter } from '@/components/landing/marketing-footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://vexa.ai'),
  title: 'Vexa — Open-Source Meeting Transcription API',
  description: 'Open-source meeting bot infrastructure for Google Meet, Microsoft Teams, and Zoom. Real-time transcription, bot control, and meeting data via REST API, WebSocket, and MCP. Self-host or use our cloud. From $0.45/hr.',
  openGraph: {
    title: 'Vexa — Open-Source Meeting Transcription API',
    description: 'Deploy meeting bots that record, transcribe, and deliver real-time data. Open source, self-hostable, 30% cheaper than Recall.ai.',
    url: 'https://vexa.ai',
    siteName: 'Vexa',
    images: [
      {
        url: '/images/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Vexa — Open-Source Meeting Transcription API',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vexa — Open-Source Meeting Transcription API',
    description: 'Meeting bots for Google Meet, Teams & Zoom. Open source, self-hostable, from $0.45/hr.',
    images: ['/images/og-default.png'],
    site: '@veaborhq',
  },
  alternates: {
    canonical: 'https://vexa.ai',
  },
  icons: {
    icon: [{ url: '/logodark.svg', href: '/logodark.svg' }],
    apple: [{ url: '/logodark.svg', href: '/logodark.svg' }],
  },
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Vexa Blog RSS Feed"
          href="/feed.xml"
        />
        {GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-MEASUREMENT_ID' && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
            <script dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `
            }} />
          </>
        )}
        {UMAMI_WEBSITE_ID && UMAMI_WEBSITE_ID !== 'umami-website-id' && (
          <script
            async
            defer
            data-website-id={UMAMI_WEBSITE_ID}
            src="https://analytics.umami.is/script.js"
            data-domains="vexa.ai"
          />
        )}
      </head>
      <body className={`${inter.variable} font-sans bg-background`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <AnnouncementBar />
              <MarketingHeader />
              <main className="flex-1">
                {children}
              </main>
              <MarketingFooter />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
