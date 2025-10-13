'use client';

import { CoverSlide } from "@/components/slides/cover-slide";
import { ProblemSlide } from "@/components/slides/problem-slide";
import { SolutionSlide } from "@/components/slides/solution-slide";
import { ProductSlide } from "@/components/slides/product-slide";
import { MarketTimingSlide } from "@/components/slides/market-timing-slide";
import { MarketOpportunitySlide } from "@/components/slides/market-opportunity-slide";
import { TractionSlide } from "@/components/slides/traction-slide";
import { BusinessModelSlide } from "@/components/slides/business-model-slide";
import { GTMSlide } from "@/components/slides/gtm-slide";
import { CompetitionSlide } from "@/components/slides/competition-slide";
import { RoadmapSlide } from "@/components/slides/roadmap-slide";
import { TeamFundraisingSlide } from "@/components/slides/team-fundraising-slide";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function SlidesPage() {
  const handleExport = () => {
    window.print();
  };

  return (
    <>
      {/* Export button - hidden when printing */}
      <div className="fixed top-20 right-4 z-50 print:hidden">
        <Button
          onClick={handleExport}
          size="lg"
          className="shadow-lg gap-2"
        >
          <Download className="h-5 w-5" />
          Export PDF
        </Button>
      </div>

      <main className="bg-background text-foreground">
        <CoverSlide />
        <ProblemSlide />
        <SolutionSlide />
        <ProductSlide />
        <MarketTimingSlide />
        <MarketOpportunitySlide />
        <TractionSlide />
        <BusinessModelSlide />
        <GTMSlide />
        <CompetitionSlide />
        <RoadmapSlide />
        <TeamFundraisingSlide />
      </main>
    </>
  );
}

