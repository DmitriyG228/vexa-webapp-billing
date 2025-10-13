import { SlideLayout } from "./slide-layout";

export function TeamFundraisingSlide() {
  return (
    <SlideLayout
      eyebrow="Fundraising"
      title="Seed Round — October 2025"
    >
      <div className="grid grid-cols-2 gap-8 mt-6">
        <div className="print:break-inside-avoid">
          <h3 className="text-2xl font-semibold mb-6 print:text-[16pt]">Team</h3>
          <div className="p-6 bg-card border border-border rounded-xl">
            <p className="text-xl font-bold text-foreground mb-2 print:text-[14pt]">
              Dmitry Grankin
            </p>
            <p className="text-base text-primary mb-3 print:text-[11pt]">Founder & CEO</p>
            <p className="text-sm text-muted-foreground print:text-[10pt]">
              Product, Engineering, OSS ecosystem
            </p>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground print:text-[9pt]">
              Contributors: Open-source maintainers, ASWF collaborators
            </p>
          </div>
        </div>
        
        <div className="print:break-inside-avoid">
          <h3 className="text-2xl font-semibold mb-6 print:text-[16pt]">Use of Funds</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-24 text-right">
                <span className="text-2xl font-bold text-primary print:text-[16pt]">40%</span>
              </div>
              <div className="flex-1 p-3 bg-card border border-border rounded-lg">
                <p className="text-sm font-medium print:text-[10pt]">Engineering & reliability</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right">
                <span className="text-2xl font-bold text-primary print:text-[16pt]">30%</span>
              </div>
              <div className="flex-1 p-3 bg-card border border-border rounded-lg">
                <p className="text-sm font-medium print:text-[10pt]">GTM & developer adoption</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right">
                <span className="text-2xl font-bold text-primary print:text-[16pt]">20%</span>
              </div>
              <div className="flex-1 p-3 bg-card border border-border rounded-lg">
                <p className="text-sm font-medium print:text-[10pt]">Compliance & enterprise readiness</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right">
                <span className="text-2xl font-bold text-primary print:text-[16pt]">10%</span>
              </div>
              <div className="flex-1 p-3 bg-card border border-border rounded-lg">
                <p className="text-sm font-medium print:text-[10pt]">Operations & buffer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 print:break-inside-avoid">
        <h3 className="text-xl font-semibold mb-4 print:text-[14pt]">12-Month Milestones</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary mb-1 print:text-[16pt]">3+</p>
            <p className="text-sm text-muted-foreground print:text-[9pt]">Supported platforms</p>
            <p className="text-xs text-muted-foreground print:text-[8pt]">(Meet, Teams, Zoom)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary mb-1 print:text-[16pt]">10+</p>
            <p className="text-sm text-muted-foreground print:text-[9pt]">Enterprise pilots</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary mb-1 print:text-[16pt]">$30K+</p>
            <p className="text-sm text-muted-foreground print:text-[9pt]">Monthly recurring revenue</p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}





