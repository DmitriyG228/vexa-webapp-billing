import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CheckCircle2, Cloud, Server, Shield, Users, Zap, Globe, Info, Linkedin, Bot, Mic, BookOpen, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ConcurrencyPricingCard } from './components/ConcurrencyPricingCard'
import { TranscriptionPricingCard } from './components/TranscriptionPricingCard'
import { GetStartedButton } from './components/GetStartedButton'
import { FOUNDER_IMAGE_URL } from '@/lib/constants'
import { absoluteUrl } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Vexa Pricing - Self-Hosted Transcription API | Free Tier',
  description: 'Transparent pricing for Vexa self-hosted transcription API. Free tier for developers. Enterprise plans available. No hidden fees. Start free today.',
  alternates: {
    canonical: absoluteUrl('/pricing'),
  },
  openGraph: {
    title: 'Vexa Pricing - Self-Hosted Transcription API | Free Tier',
    description: 'Transparent pricing for Vexa self-hosted transcription API. Free tier for developers. Enterprise plans available. No hidden fees. Start free today.',
    url: absoluteUrl('/pricing'),
    siteName: 'Vexa',
    type: 'website',
    images: [
      {
        url: absoluteUrl('/logodark.svg'),
        width: 1200,
        height: 630,
        alt: 'Vexa Pricing',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Vexa Pricing - Self-Hosted Transcription API | Free Tier',
    description: 'Transparent pricing for Vexa self-hosted transcription API. Free tier for developers. Enterprise plans available. No hidden fees. Start free today.',
  },
}

interface PricingCardProps {
  name: string
  description: string
  price: string
  period: string
  extraBot?: string
  features: string[]
  icon: React.ReactNode
  badge?: string
  isPopular?: boolean
  buttonText?: string
  buttonVariant?: 'default' | 'outline'
  valueProposition?: string
  idealFor?: string
  isEnterprise?: boolean
  planType?: 'mvp' | 'dynamic' | 'enterprise' | 'local' | 'community' | 'nomad' | 'dedicated'
  avatarUrl?: string
  cleanStyle?: boolean
}

function PricingCard({
  name,
  description,
  price,
  period,
  extraBot,
  features,
  icon,
  badge,
  isPopular = false,
  buttonText = 'Get Started',
  buttonVariant = 'default',
  valueProposition,
  idealFor,
  isEnterprise = false,
  planType = 'dynamic',
  avatarUrl,
  cleanStyle = false,
}: PricingCardProps) {
  const cardClassName = cleanStyle
    ? 'relative h-full rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden'
    : (isEnterprise 
      ? 'relative h-full rounded-2xl border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-2xl shadow-primary/10 flex flex-col overflow-hidden'
      : `relative h-full rounded-xl border-0 ${isPopular ? 'bg-gradient-to-br from-card to-muted/50 shadow-xl shadow-primary/5' : 'bg-card shadow-lg hover:shadow-xl transition-all duration-300'} flex flex-col overflow-hidden`);
  
  return (
    <Card className={cardClassName}>
      {badge && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1">
            {badge}
          </Badge>
      )}
      <CardHeader className="relative flex-shrink-0 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {icon}
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-lg font-display bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {name}
        </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
          {description}
        </CardDescription>
            </div>
          </div>
          <div className="text-center space-y-2">
            {isEnterprise && avatarUrl && (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={avatarUrl}
                  alt="Founder avatar"
                  className="h-20 w-20 rounded-full border border-border object-cover shadow-sm"
                />
                <Link href="https://www.linkedin.com/in/dmitry-grankin/" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1">
                    <Linkedin className="h-3 w-3" />
                    LinkedIn
                  </Button>
                </Link>
              </div>
            )}
            <div className="text-3xl font-display bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {price}
              {period && (
                <span className="text-base font-normal text-muted-foreground">{period}</span>
              )}
            </div>
          {extraBot && (
              <div className="text-xs text-muted-foreground">
                Extra bot: {extraBot}
              </div>
          )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative flex-1 flex flex-col justify-between p-6 space-y-4">
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-xs font-medium">{feature}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-4 space-y-3">
          {valueProposition && (
            <p className="text-xs text-muted-foreground">
              {valueProposition}
            </p>
          )}
          {idealFor && (
            <p className="text-xs text-muted-foreground font-medium">
              {idealFor}
            </p>
          )}
          {buttonText && (
            <GetStartedButton
              buttonText={buttonText}
              buttonVariant={buttonVariant}
              isPopular={isPopular}
              isEnterprise={isEnterprise}
              planType={planType}
              href={isEnterprise ? 'https://cal.com/dmitrygrankin/30-min' : undefined}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PricingPage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
        <section className="py-6">
          <div className="mx-auto max-w-5xl text-center space-y-4">
            <div className="space-y-4">
              <h1 className="text-3xl font-display tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Meeting Transcription API
              </h1>
              {/* Platform logos */}
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Image 
                    src="/microsoft-teams-logo.png" 
                    alt="Microsoft Teams" 
                    width={24} 
                    height={24} 
                    className="h-6 w-6 object-contain" 
                    priority
                    fetchPriority="high"
                  />
                  <span className="text-sm font-semibold text-foreground">Microsoft Teams</span>
                </div>
                <span className="text-muted-foreground">+</span>
                <div className="flex items-center gap-2">
                  <Image 
                    src="/google-meet-logo.png" 
                    alt="Google Meet" 
                    width={24} 
                    height={24} 
                    className="h-6 w-6 object-contain" 
                    priority
                    fetchPriority="high"
                  />
                  <span className="text-sm font-semibold text-foreground">Google Meet</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-6 opacity-20" />

        {/* Pricing */}
        <section className="py-2" id="pricing">
          <div className="mx-auto max-w-5xl space-y-4">
           <div className="grid grid-cols-1 gap-6 items-stretch max-w-5xl mx-auto">
             {/* Pricing Tabs */}
             <div className="space-y-6">
               <div className="flex justify-center w-full">
                 <Tabs defaultValue="bots" className="w-full">
                   <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
                     <TabsTrigger value="bots" className="flex items-center gap-2">
                       <Bot className="h-4 w-4" />
                       <span>Bots</span>
                     </TabsTrigger>
                     <TabsTrigger value="transcription" className="flex items-center gap-2">
                       <Mic className="h-4 w-4" />
                       <span>Transcription</span>
                     </TabsTrigger>
                   </TabsList>
                   <TabsContent value="bots" className="mt-6 space-y-8">
                     {/* Product description */}
                     <div className="text-center space-y-6">
                       <div className="space-y-4 max-w-2xl mx-auto">
                         <p className="text-base leading-relaxed text-muted-foreground">
                           Full Service - just grab API key
                         </p>
                         {/* Trial information - Bots only */}
                         <Link href="/dashboard/api-keys" className="inline-block">
                           <Button variant="outline" size="lg" className="gap-3 px-8 py-6 text-lg font-semibold hover:bg-accent transition-colors">
                             <Zap className="h-6 w-6" />
                             Start free 1-hour trial in 2 clicks
                           </Button>
                         </Link>
                       </div>
                     </div>
                     <ConcurrencyPricingCard />
                   </TabsContent>
                   <TabsContent value="transcription" className="mt-6 space-y-8">
                     {/* Product description and deployment guide */}
                     <div className="text-center space-y-6">
                       <div className="space-y-3 max-w-2xl mx-auto">
                         <p className="text-base leading-relaxed text-muted-foreground">
                           Full privacy, self host with single docker container, GPU-free - connect to this transcription service for scalability and simplicity of setup
                         </p>
                         <Link 
                           href="https://github.com/Vexa-ai/vexa/blob/feat/monolithic-on-remote-transcription-rebased/docs/vexa-lite-deployment.md"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-block"
                         >
                           <Button variant="outline" size="lg" className="gap-2 hover:bg-accent transition-colors">
                             <BookOpen className="h-5 w-5" />
                             View Deployment Guide
                             <ExternalLink className="h-4 w-4" />
                           </Button>
                         </Link>
                       </div>
                     </div>
                     <TranscriptionPricingCard />
                   </TabsContent>
                 </Tabs>
               </div>
             </div>

             {/* Two separate cards: Enterprise and Speak to Founder */}
              <div className="grid grid-cols-1 gap-6">
               <PricingCard
                 name="Enterprise — Dedicated Cloud or your VPC"
                 description=""
                 price="Enterprise"
                 period=""
                 features={["> 50-bot fleets, regulated workloads", "Same OSS code, fully managed"]}
                 icon={<Shield className="h-6 w-6 text-primary" />}
                 isPopular={false}
                 isEnterprise={true}
                 buttonText="Contact Team"
                 buttonVariant="outline"
                 planType="enterprise"
                 cleanStyle
               />
               <PricingCard
                 name="Speak to Founder"
                 description=""
                 price="Schedule a meeting"
                 period=""
                 features={[]}
                 icon={undefined as unknown as React.ReactNode}
                 isPopular={false}
                 isEnterprise={true}
                 buttonText="Schedule 30-min"
                 buttonVariant="outline"
                 planType="enterprise"
                 avatarUrl={FOUNDER_IMAGE_URL}
                 cleanStyle
               />
             </div>
           </div>
          </div>

          {/* What’s included removed per request */}
      </section>

      {/* Open source reassurance */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl space-y-6 text-center">
          <h2 className="text-2xl font-display tracking-tight">Open source, no lock-in</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Card className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-medium">Apache-2 forever. Self-host for free.</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-medium">Same repo, same code. Hosted runs the OSS build.</span></div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-medium">Switch anytime. No migrations needed.</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-medium">We never train on customer data.</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Built for products & automation (API) */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-display tracking-tight">Built for products & automation (API)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-medium">API & webhooks: stream transcripts/events in real time</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-medium">Rich metadata: speakers, timestamps, language, meeting IDs</span></div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-medium">Send anywhere: pipelines, vector DBs, LLMs, n8n/Zapier</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-medium">Reliability: auto-reconnect, backoff, idempotent delivery</span></div>
                <div className="pt-2">
                  <Link href="https://github.com/Vexa-ai/vexa/blob/main/docs/user_api_guide.md" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">Read the API docs</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy & Data-Stewardship Pledge */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display tracking-tight">Privacy & Data-Stewardship Pledge</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Your transcripts are yours. Delete anytime.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Encryption in transit and at rest.</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Retention control. Default 7-day rolling; configurable.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">No training on customer data.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Deployment services (optional) */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-display tracking-tight">Deployment Services (Optional)</h2>
          </div>
          <p className="text-muted-foreground">
            Need zero-trust Vexa in your cloud? We deploy, harden, and operate the OSS code in AWS/GCP/Azure/Vultr.
          </p>
          <div className="flex justify-center">
            <Link href="https://cal.com/dmitrygrankin/30-min" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline">Talk to an engineer</Button>
            </Link>
          </div>
          <div className="mx-auto max-w-xl text-left pt-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" /> &gt; 50-bot fleets, regulated workloads</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" /> Same OSS code, fully managed</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">FAQ</h2>
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-medium">What limits apply?</div>
              <div className="text-muted-foreground">Only concurrency (bots). Minutes are unlimited.</div>
            </div>
            <div>
              <div className="font-medium">Can I change bots mid-cycle?</div>
              <div className="text-muted-foreground">Yes—prorated instantly; reductions become credit.</div>
            </div>
            <div>
              <div className="font-medium">Can I move between self-hosted and hosted?</div>
              <div className="text-muted-foreground">Anytime; same codebase.</div>
            </div>
            <div>
              <div className="font-medium">Is this really open-source?</div>
              <div className="text-muted-foreground">Yes—Apache-2; hosted runs the same repo.</div>
            </div>
            <div>
              <div className="font-medium">Which platforms are supported?</div>
              <div className="text-muted-foreground">Microsoft Teams & Google Meet (v0.7); Zoom coming next.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to start */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border shadow-lg overflow-hidden">
            <div className="bg-primary p-6 md:p-8 text-primary-foreground">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-display">Start transcribing via API for Google Meet today.</h2>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/api/auth/signin">
                    <Button size="lg" variant="secondary" className="gap-2">Get Started</Button>
                  </Link>
                  <Link href="https://github.com/Vexa-ai/vexa/blob/main/docs/user_api_guide.md" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20 gap-2">
                      Read API docs
                    </Button>
                  </Link>
                  <Link href="/contact-sales">
                    <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20 gap-2">
                      Contact sales
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
      </div>
    </TooltipProvider>
  )
} 