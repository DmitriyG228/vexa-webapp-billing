import type { Metadata } from 'next'
import { Inter, Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { Github, Linkedin, Menu } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { CookieConsent } from '@/components/cookie-consent'
import AuthProvider from "@/components/AuthProvider";
import AuthButtons from "@/components/AuthButtons";
import { CookiePrefsButton } from "@/components/cookie-prefs-button";
import { LegalDropdown } from "@/components/legal-dropdown";
import { ProductsDropdown } from "@/components/products-dropdown";
import { Logo } from '@/components/ui/logo';
import { SignupTracker } from '@/components/SignupTracker';
import { LoginLink } from '@/components/LoginLink';
import { HeaderAuthedActions, MobileAuthedLinks } from "@/components/header-authed-actions";
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Optimize font loading performance
  preload: true,
  adjustFontFallback: true,
})

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Vexa — Meeting Transcription API (Microsoft Teams & Google Meet, WebSocket)',
  description: 'Open-source meeting transcription API. Now with Microsoft Teams and Google Meet support, plus WebSocket streaming for sub-second transcripts. Self-host or use our hosted API.',
  icons: {
    icon: [
      {
        url: '/logodark.svg',
        href: '/logodark.svg',
      }
    ],
    apple: [
      {
        url: '/logodark.svg',
        href: '/logodark.svg',
      }
    ]
  }
}

// Analytics Configuration from environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Organization schema for homepage SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Vexa',
    url: 'https://vexa.ai',
    logo: 'https://vexa.ai/logodark.svg',
    description: 'Open-source meeting transcription API with Microsoft Teams and Google Meet support, plus WebSocket streaming for sub-second transcripts.',
    sameAs: [
      'https://github.com/Vexa-ai/vexa',
      'https://discord.gg/Ga9duGkVz9',
      'https://www.linkedin.com/in/dmitry-grankin/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      url: 'https://vexa.ai',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* Preload critical assets with high priority - only logo, images are handled by Next.js Image priority */}
        <link rel="preload" href="/logodark.svg" as="image" type="image/svg+xml" fetchPriority="high" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for faster connections - lower priority */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://analytics.umami.is" />
        <link rel="dns-prefetch" href="https://api.github.com" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              // Make all sidebars sticky (except docs sidebar which has its own structure)
              const sidebars = document.querySelectorAll('aside');
              sidebars.forEach(sidebar => {
                // Skip docs sidebar - it has its own sticky container structure
                if (sidebar.closest('[class*="docs"]') || sidebar.querySelector('[class*="sticky"]')) {
                  return;
                }
                if (!sidebar.className.includes('sticky')) {
                  sidebar.classList.add('sticky', 'top-16', 'h-[calc(100vh-4rem)]', 'overflow-y-auto');
                }
              });
            });
          `
        }} />
        
        {/* Google Analytics - Defer for better performance */}
        {GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-MEASUREMENT_ID' && (
          <>
            <script async defer src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
            <script
              defer
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    cookie_flags: 'SameSite=None;Secure'
                  });
                `
              }}
            />
          </>
        )}

        {/* Umami Analytics - Privacy-focused analytics */}
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
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
                  {/* Left: Logo + Version Badge */}
                  <div className="mr-6 flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                      <Image
                        src="/logodark.svg"
                        alt="Vexa Logo"
                        width={32}
                        height={32}
                        className="h-8 w-8"
                      />
                      <span className="text-lg font-semibold">Vexa</span>
                    </Link>
                    <Link 
                      href="https://github.com/Vexa-ai/vexa/releases/tag/v0.7" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      v0.7
                    </Link>
                  </div>

                  {/* Center: Navigation */}
                  <div className="hidden md:flex items-center gap-1 flex-1">
                    <ProductsDropdown />
                    <NavigationMenu className="flex">
                      <NavigationMenuList>
                        <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                          <Link href="/get-started" className={navigationMenuTriggerStyle()}>
                            Get Started
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                          <Link
                            href="https://github.com/Vexa-ai/vexa/blob/main/docs/user_api_guide.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={navigationMenuTriggerStyle()}
                          >
                            API Docs
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                          <Link
                            href="https://docs.vexa.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={navigationMenuTriggerStyle()}
                          >
                            Product Docs
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                          <Link href="/pricing" className={navigationMenuTriggerStyle()}>
                            Pricing
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                          <Link href="/blog" className={navigationMenuTriggerStyle()}>
                            Blog
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  </div>
                  
                  {/* Right: GitHub + Theme Toggle + Dashboard + Auth */}
                  <div className="flex items-center justify-end gap-3 ml-auto">
                    <a
                      href="https://github.com/Vexa-ai/vexa"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="hidden sm:flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>

                    <ModeToggle />
                    <HeaderAuthedActions />

                    <AuthButtons />

                    {/* Mobile Menu Trigger */}
                    <Sheet>
                      <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                          <Menu className="h-6 w-6" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <nav className="flex flex-col gap-4 mt-8">
                          <Link href="/" className="text-base font-caption transition-colors hover:text-primary">
                            Home
                          </Link>
                          <Link href="/product/google-meet-transcription-api" className="text-base font-caption transition-colors hover:text-primary">
                            Google Meet
                          </Link>
                          <Link href="/product/microsoft-teams-transcription-api" className="text-base font-caption transition-colors hover:text-primary">
                            Microsoft Teams
                          </Link>
                          <Link href="/open-source" className="text-base font-caption transition-colors hover:text-primary">
                            Open Source
                          </Link>
                          <Link
                            href="https://github.com/Vexa-ai/vexa/blob/main/docs/user_api_guide.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-caption transition-colors hover:text-primary"
                          >
                            API Docs
                          </Link>
                          <Link
                            href="https://docs.vexa.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-caption transition-colors hover:text-primary"
                          >
                            Product Docs
                          </Link>
                          <Link href="/pricing" className="text-base font-caption transition-colors hover:text-primary">
                            Pricing
                          </Link>
                          <Link href="/blog" className="text-base font-caption transition-colors hover:text-primary">
                            Blog
                          </Link>
                          <MobileAuthedLinks />
                          <div className="pt-4 border-t">
                            <AuthButtons />
                          </div>
                        </nav>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </header>
              <main className="flex-1">
                {children}
              </main>
              <footer className="w-full border-t py-6">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    © {new Date().getFullYear()} Vexa.ai Inc. All rights reserved.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex">
                      <LegalDropdown />
                    </div>
                    <div className="flex items-center gap-4">
                      <Link href="https://github.com/Vexa-ai/vexa" className="text-muted-foreground hover:text-foreground">
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                      </Link>
                      <Link href="https://discord.gg/Ga9duGkVz9" className="text-muted-foreground hover:text-foreground">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <circle cx="9" cy="12" r="1"/>
                          <circle cx="15" cy="12" r="1"/>
                          <path d="M7.5 7.2c3.5-1 5.5-1 9 0"/>
                          <path d="M7 16.2c3.5 1 6.5 1 10 0"/>
                          <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5"/>
                          <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.48-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5"/>
                        </svg>
                        <span className="sr-only">Discord</span>
                      </Link>
                      <Link href="https://www.linkedin.com/in/dmitry-grankin/" className="text-muted-foreground hover:text-foreground">
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </Link>
                      <Link href="https://x.com/grankin_d" className="text-muted-foreground hover:text-foreground">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 1200 1227"
                          fill="none"
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/>
                        </svg>
                        <span className="sr-only">X (Twitter)</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </footer>
              <CookieConsent />
            </div>
          </ThemeProvider>
          <SignupTracker />
        </AuthProvider>
      </body>
    </html>
  )
}
