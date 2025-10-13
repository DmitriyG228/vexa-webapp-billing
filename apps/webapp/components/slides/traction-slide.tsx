import { SlideLayout } from "./slide-layout";
import { Github } from '@lobehub/icons';
import { Star, Users, TrendingUp, Building2 } from "lucide-react";

export function TractionSlide() {
  return (
    <SlideLayout
      eyebrow="Traction"
      title="Early momentum with developer community and enterprise adopters"
    >
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="space-y-4 print:break-inside-avoid">
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Github size={32} className="text-primary" />
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-4xl font-bold text-foreground mb-1 print:text-[24pt]">1.3k+</p>
            <p className="text-sm text-muted-foreground print:text-[10pt]">GitHub stars</p>
          </div>
          
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1 print:text-[16pt]">Sept 4, 2025</p>
            <p className="text-sm text-muted-foreground print:text-[10pt]">Hosted service launched</p>
            <p className="text-xs text-muted-foreground mt-1 print:text-[8pt]">v0.6 refactor: Oct 4, 2025</p>
          </div>
        </div>
        
        <div className="space-y-4 print:break-inside-avoid">
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4 print:text-[14pt]">Enterprise Adopters</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm print:text-[10pt]">
                  <strong>Academy Software Foundation</strong> — DNA Project
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm print:text-[10pt]">
                  <strong>Industrial Light & Magic</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm print:text-[10pt]">
                  <strong>Sony Pictures Imageworks</strong>
                </span>
              </li>
            </ul>
          </div>
          
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1 print:text-[16pt]">First subscriptions</p>
            <p className="text-sm text-muted-foreground print:text-[10pt]">Live since launch</p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}





