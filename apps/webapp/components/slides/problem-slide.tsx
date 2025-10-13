import { SlideLayout } from "./slide-layout";

export function ProblemSlide() {
  return (
    <SlideLayout
      eyebrow="The Problem"
      title="AI runs on data — but live meeting data is locked inside collaboration platforms"
      bullets={[
        { rest: "Developers can't easily access real-time transcripts" },
        { rest: "Enterprises face data-sovereignty and compliance constraints" },
        { rest: "'Notetaker' apps don't expose APIs or integrate with automation workflows" },
      ]}
    >
      <div className="mt-8 p-6 bg-card border border-border rounded-xl print:break-inside-avoid">
        <p className="text-2xl font-semibold text-foreground mb-2 print:text-[16pt]">
          Teams need:
        </p>
        <p className="text-xl text-muted-foreground print:text-[14pt]">
          Reliable, sub-second, open access to meeting transcripts
        </p>
      </div>
    </SlideLayout>
  );
}





