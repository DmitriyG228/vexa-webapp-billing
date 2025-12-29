import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Rocket, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Vexa Lite Deployment | Vexa API Documentation",
  description: "Deploy Vexa Lite as a single Docker container for production. No GPU required, stateless, and serverless-friendly.",
};

export default function VexaLitePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Vexa Lite Deployment</h1>
          <Badge variant="secondary">Recommended</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          Single-container deployment for production. No GPU required, stateless, and serverless-friendly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What is Vexa Lite?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Vexa Lite is a stateless, single-container version of Vexa designed for end users who want:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Quick deployment</strong> on any platform (Fly.io, Railway, Render, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>No GPU required</strong> - transcription runs externally (though you can self-host)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Choose your UI</strong> - pick from open-source interfaces like Vexa Dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Production-ready</strong> - stateless, scalable, serverless-friendly</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Deploy Vexa Lite in minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-mono text-foreground mb-2">Docker Run Command:</p>
            <code className="text-xs text-muted-foreground block whitespace-pre-wrap break-all">
{`docker run -d \\
  --name vexa \\
  -p 8056:8056 \\
  -e DATABASE_URL="postgresql://user:pass@host/vexa" \\
  -e ADMIN_API_TOKEN="your-admin-token" \\
  -e TRANSCRIBER_URL="https://transcription.service" \\
  -e TRANSCRIBER_API_KEY="transcriber-token" \\
  vexaai/vexa-lite:latest`}
            </code>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Required Environment Variables:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><code className="bg-muted px-1 rounded">DATABASE_URL</code> - PostgreSQL connection string</li>
              <li><code className="bg-muted px-1 rounded">ADMIN_API_TOKEN</code> - Secret token for admin operations</li>
              <li><code className="bg-muted px-1 rounded">TRANSCRIBER_URL</code> - Transcription service endpoint</li>
              <li><code className="bg-muted px-1 rounded">TRANSCRIBER_API_KEY</code> - API key for transcription service</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Options</CardTitle>
          <CardDescription>Choose your database and transcription service configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Remote Database + Remote Transcription</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Best for:</strong> Production deployments, fastest setup
              </p>
              <p className="text-sm text-muted-foreground">
                Use a managed PostgreSQL database (Supabase, Neon, etc.) and the Vexa transcription service. 
                No GPU required, fully managed, production-ready.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Local Database + Remote Transcription</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Best for:</strong> Development, quick testing
              </p>
              <p className="text-sm text-muted-foreground">
                Run PostgreSQL locally but use remote transcription. Perfect for development with lower costs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Remote Database + Local Transcription</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Best for:</strong> Maximum privacy with on-premise transcription
              </p>
              <p className="text-sm text-muted-foreground">
                Use a managed database but self-host your transcription service for complete data control.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Local Database + Local Transcription</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Best for:</strong> Full self-hosting, complete data sovereignty
              </p>
              <p className="text-sm text-muted-foreground">
                Self-host everything for maximum control. Requires GPU for local transcription.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="https://github.com/Vexa-ai/vexa/blob/main/docs/vexa-lite-deployment.md" target="_blank" rel="noopener noreferrer">
                View Complete Deployment Guide
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="https://github.com/Vexa-ai/vexa-lite-deploy" target="_blank" rel="noopener noreferrer">
                Platform-Specific Deployments (Fly.io, etc.)
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/deployment/fly">
                Fly.io Deployment Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





