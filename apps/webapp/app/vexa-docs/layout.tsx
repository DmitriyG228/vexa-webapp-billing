import Link from "next/link";
import { PageContainer, Section } from "@/components/ui/page-container";

export const metadata = {
  title: "Vexa Docs",
  description: "Product documentation for Vexa.",
};

export default function VexaDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer maxWidth="7xl">
      <Section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Vexa Docs</h1>
            <span className="text-sm text-muted-foreground">Synced from the open-source repo</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="https://github.com/Vexa-ai/vexa/tree/main/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              View on GitHub
            </Link>
          </div>
        </div>
        {children}
      </Section>
    </PageContainer>
  );
}

