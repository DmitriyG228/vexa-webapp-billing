import Link from "next/link";
import { getAllVexaDocSlugs } from "@/lib/vexa-docs";

export const dynamic = "force-static";

export default function VexaDocsIndexPage() {
  const slugs = getAllVexaDocSlugs();

  const has = (slug: string) => slugs.some((p) => p.join("/") === slug);

  const sections: { title: string; items: { slug: string; label: string; desc?: string }[] }[] = [
    {
      title: "Start Here",
      items: [
        { slug: "getting-started", label: "Getting started", desc: "End-to-end: deploy → bot → transcript → playback" },
        { slug: "vexa-lite-deployment", label: "Vexa Lite deployment", desc: "Production self-host (single container)" },
        { slug: "deployment", label: "Docker Compose (dev)", desc: "Local dev stack for contributors" },
        { slug: "user_api_guide", label: "REST API guide", desc: "Common flows and endpoint usage" },
        { slug: "websocket", label: "WebSocket guide", desc: "Live transcript streaming" },
        { slug: "ui-dashboard", label: "Dashboard UI", desc: "Run the UI and use post-meeting playback" },
      ],
    },
    {
      title: "Concepts",
      items: [{ slug: "concepts", label: "Core concepts", desc: "Models, timing semantics, recordings, deletion" }],
    },
    {
      title: "Platforms",
      items: [
        { slug: "platforms/google-meet", label: "Google Meet", desc: "IDs, admission, common issues" },
        { slug: "platforms/microsoft-teams", label: "Microsoft Teams", desc: "IDs + passcode extraction" },
        { slug: "platforms/zoom", label: "Zoom", desc: "Approval caveats + join requirements" },
        { slug: "zoom-app-setup", label: "Zoom app setup", desc: "OAuth + Meeting SDK + OBF flow" },
      ],
    },
    {
      title: "Storage and Ops",
      items: [
        { slug: "recording-storage", label: "Recording storage", desc: "local vs S3-compatible; playback notes" },
        { slug: "self-hosted-management", label: "Self-hosted management", desc: "Users, tokens, admin workflows" },
      ],
    },
    {
      title: "Troubleshooting and Security",
      items: [
        { slug: "troubleshooting", label: "Troubleshooting", desc: "Bot joins, transcripts, recordings, delete" },
        { slug: "security", label: "Security", desc: "Secrets, data handling, deletion semantics" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        This section is rendered from the Vexa repository <code className="font-mono text-sm">docs/</code> folder at
        build time.
      </p>

      {has("getting-started") ? (
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-2">Start here</div>
          <Link className="text-base font-medium hover:underline" href="/vexa-docs/getting-started">
            Getting started (end-to-end)
          </Link>
        </div>
      ) : null}

      {sections.map((section) => {
        const visible = section.items.filter((i) => has(i.slug));
        if (visible.length === 0) return null;

        return (
          <div key={section.title} className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium mb-3">{section.title}</div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((i) => (
                <li key={i.slug}>
                  <Link
                    href={`/vexa-docs/${i.slug}`}
                    className="block rounded-md border bg-background px-3 py-3 hover:bg-accent transition-colors"
                  >
                    <div className="text-sm font-medium">{i.label}</div>
                    {i.desc ? <div className="text-xs text-muted-foreground mt-1">{i.desc}</div> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm font-medium mb-3">All pages</div>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {slugs.map((parts) => {
            const href = `/vexa-docs/${parts.join("/")}`;
            return (
              <li key={href}>
                <Link className="text-sm text-muted-foreground hover:text-foreground hover:underline" href={href}>
                  {parts.join("/")}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
