import { HeroSection } from '@/components/landing/hero-section'
import { BentoGrid } from '@/components/landing/bento-grid'
import { AgenticSection } from '@/components/landing/agentic-section'
import { MeetingBotsSection } from '@/components/landing/meeting-bots-section'
import { UseCaseTabs } from '@/components/landing/use-case-tabs'
import { CodeShowcase } from '@/components/landing/code-showcase'
import { PricingSection } from '@/components/landing/pricing-section'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <BentoGrid />
      <AgenticSection />
      <MeetingBotsSection />
      <UseCaseTabs />
      <CodeShowcase />
      <PricingSection />
    </>
  )
}
