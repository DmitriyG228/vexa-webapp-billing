import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Cloud, Server, Shield, Users, Zap, Globe, Info, Star } from 'lucide-react'
import Link from 'next/link'
import { DynamicPricingCard } from './components/DynamicPricingCard'
import { GetStartedButton } from './components/GetStartedButton'

export const metadata: Metadata = {
  title: 'Pricing | Vexa',
  description: 'Vexa pricing for managed cloud and self-hosting options. Transcribe live conversations from a single call to hundreds of concurrent streams.',
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
}: PricingCardProps) {
  const cardClassName = isEnterprise 
    ? 'relative h-full rounded-2xl border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-2xl shadow-primary/10 flex flex-col overflow-hidden'
    : `relative h-full rounded-xl border-0 ${isPopular ? 'bg-gradient-to-br from-card to-muted/50 shadow-xl shadow-primary/5' : 'bg-card shadow-lg hover:shadow-xl transition-all duration-300'} flex flex-col overflow-hidden`;
  
  return (
    <Card className={cardClassName}>
      {badge && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1">
            {badge}
          </Badge>
      )}
      <CardHeader className="relative flex-shrink-0 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {name}
        </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
          {description}
        </CardDescription>
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
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
        <div className="container mx-auto px-4 py-4 space-y-4">
      {/* Header Section */}
        <section className="py-4">
          <div className="mx-auto max-w-6xl text-center space-y-4">
            <div className="space-y-2">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-2 py-1 text-xs">
                <Zap className="h-2 w-2 mr-1" />
                Simple, Transparent Pricing
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Vexa <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Pricing</span>
          </h1>
            </div>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-normal">
            Transcribe live conversations —from a single Zoom call on your laptop to hundreds of concurrent streams in a regulated enterprise—without ever locking up your data.
          </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">Everything is</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                open-source (Apache-2)
              </Badge>
              <span className="text-muted-foreground">, fully peer-reviewed, and self-hostable</span>
            </div>
        </div>
      </section>

        <Separator className="my-6 opacity-20" />

        {/* Main Pricing Section */}
        <section className="py-2">
          <div className="mx-auto max-w-7xl space-y-4">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <Cloud className="h-3 w-3 text-primary" />
                <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Managed Cloud
                </h2>
            </div>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Concurrency-based pricing with transparent costs.{" "}
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  <Zap className="h-3 w-3" />
                  Pay yearly and get two months free
                </span>
            </p>
          </div>
          
                                    {/* Main Pricing Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch max-w-6xl mx-auto">
              {/* Dynamic Business Plan - Wider */}
              <div className="lg:col-span-3">
                <DynamicPricingCard />
            </div>

              {/* Enterprise Plan - Narrower */}
              <div className="lg:col-span-2">
                <PricingCard
                  name="Enterprise"
                  description="Dedicated Cloud • Isolated VPC"
                  price="Contact sales"
                  period=""
                  features={[">50-bot fleets", "Regulated workloads", "24 × 7, contractual SLA, DPA"]}
                  icon={<Shield className="h-6 w-6 text-primary" />}
                  isPopular={true}
                  isEnterprise={true}
                  buttonText="Contact Sales"
                  buttonVariant="outline"
                  planType="enterprise"
                />
              </div>
            </div>
          </div>

          {/* Always Included Section */}
          <div className="mx-auto max-w-6xl space-y-3 mt-4">
            <div className="text-center">
              <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-1">
                Always included
              </h3>
                    </div>
                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg shadow-primary/5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
              <CardContent className="relative p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Globe className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-xs">100+ Languages</div>
                      <div className="text-xs text-muted-foreground">Real-time translation</div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Automatic language detection and translation to any target language</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <Separator className="opacity-30" />
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Server className="h-3 w-3 text-primary" />
            </div>
                    <div className="flex-1">
                      <div className="font-medium text-xs">7-day storage</div>
                      <div className="text-xs text-muted-foreground">Rolling retention</div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Automatic cleanup after 7 days. Download before expiry.</p>
                      </TooltipContent>
                    </Tooltip>
                    </div>
                  
                  <Separator className="opacity-30" />
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-xs">Global regions</div>
                      <div className="text-xs text-muted-foreground">EU, US & APAC</div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose your region for optimal performance and compliance</p>
                      </TooltipContent>
                    </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
      </section>

      {/* Privacy & Data-Stewardship Pledge */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Privacy & Data-Stewardship Pledge</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Your transcripts are your property.</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  They remain on our servers only until you call DELETE. We encourage routine purging and external archival.
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">We never train models on customer data.</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">End-to-end encryption in transit and at rest.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Open source, always.</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  Fork, self-host, or return to Cloud—no vendor lock-in by design.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Professional Services */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Professional services (optional)</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Integration sprint
                </CardTitle>
                <CardDescription>Notion, HubSpot, n8n...</CardDescription>
                <div className="text-2xl font-bold">$3,000<span className="text-base font-normal text-muted-foreground"> / 2 weeks</span></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">PoC code, CI tests, docs</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Ad-hoc engineering help
                </CardTitle>
                <div className="text-2xl font-bold">$200<span className="text-base font-normal text-muted-foreground"> / hour</span></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Pair-programming, scaling advice</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  Turn-key deployment
                </CardTitle>
                <div className="text-2xl font-bold">$8,000<span className="text-base font-normal text-muted-foreground"> one-off</span></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">White-glove install, IaC hand-off</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ready to start */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border shadow-lg overflow-hidden">
            <div className="bg-primary p-6 md:p-8 text-primary-foreground">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-bold">Ready to start?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 mx-auto">
                      <Server className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">Hack locally</h3>
                    <p className="text-sm text-primary-foreground/80">
                      git clone https://github.com/Vexa-ai/vexa && docker-compose up
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 mx-auto">
                      <Cloud className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">Spin a bot in the cloud</h3>
                    <p className="text-sm text-primary-foreground/80">
                      Create a Solo account → grab your API key → call /v1/streams
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 mx-auto">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">Need isolation?</h3>
                    <p className="text-sm text-primary-foreground/80">
                      Book a 20-minute architecture chat and we'll scope Dedicated Cloud or Nomad
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/api/auth/signin">
                    <Button size="lg" variant="secondary" className="gap-2">
                      <Cloud className="h-4 w-4" />
                      Get Started
                    </Button>
                  </Link>
                  <Link href="https://github.com/Vexa-ai/vexa" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20 gap-2">
                      <Server className="h-4 w-4" />
                      Try Self-Hosted
                    </Button>
                  </Link>
                </div>
                <p className="text-lg font-medium text-primary-foreground/90">
                  Build where you like, migrate when you need—Vexa makes transcription transparent, private, and yours.
                </p>
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