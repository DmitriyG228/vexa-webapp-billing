import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Rocket, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Fly.io Deployment | Vexa API Documentation",
  description: "Deploy Vexa Lite to Fly.io in minutes with one-click setup. Automatic SSL, global CDN, and optional dashboard deployment.",
};

export default function FlyDeploymentPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Fly.io Deployment</h1>
          <Badge variant="secondary">One-Click</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          Deploy Vexa Lite to Fly.io in minutes with one-click setup. Automatic SSL, global CDN, and optional dashboard deployment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why Fly.io?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Fly.io provides a simple way to deploy Vexa Lite with:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Automatic SSL certificates and global CDN</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>One-click deployment script</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Optional dashboard deployment included</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Automatic scaling and health checks</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Install <Link href="https://fly.io/docs/hands-on/install-flyctl/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Fly.io CLI</Link></li>
            <li>Login to Fly.io: <code className="bg-muted px-1 rounded">fly auth login</code></li>
            <li>Ensure you have a Fly.io account</li>
            <li>Get a PostgreSQL database (Supabase, Neon, etc.)</li>
            <li>Get a transcription API key from <Link href="https://staging.vexa.ai/dashboard/transcription" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Vexa Transcription Service</Link></li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Deploy</CardTitle>
          <CardDescription>Using the deployment script (recommended)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 1: Clone the repository</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`git clone https://github.com/Vexa-ai/vexa-lite-deploy.git
cd vexa-lite-deploy/fly`}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 2: Configure environment</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`cp .env.example .env
# Edit .env with your values:
# - DATABASE_URL
# - ADMIN_API_TOKEN
# - TRANSCRIBER_API_KEY
# - TRANSCRIBER_URL`}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 3: Deploy</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`chmod +x deploy.sh
./deploy.sh`}
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              To also deploy the frontend dashboard, set <code className="bg-muted px-1 rounded">DEPLOY_FRONTEND=true</code> in your <code className="bg-muted px-1 rounded">.env</code> file.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Deployment</CardTitle>
          <CardDescription>If you prefer to deploy manually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 1: Initialize the app</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`fly launch --no-deploy --image vexaai/vexa-lite:latest`}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 2: Set secrets</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap break-all">
{`fly secrets set \\
  DATABASE_URL="postgresql://user:password@host:5432/database" \\
  ADMIN_API_TOKEN="your-secure-token-here" \\
  TRANSCRIBER_API_KEY="your-transcriber-api-key-here" \\
  -a vexa-lite`}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 3: Deploy</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`fly deploy -a vexa-lite`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frontend Dashboard Deployment</CardTitle>
          <CardDescription>Optional: Deploy the Vexa Dashboard alongside the backend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The deployment script supports optionally deploying the Vexa Dashboard frontend alongside the backend.
          </p>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Enable Frontend Deployment</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`# Add to your .env file:
DEPLOY_FRONTEND=true

# Then run:
./deploy.sh`}
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              The script will automatically configure the frontend to connect to your backend and use the same <code className="bg-muted px-1 rounded">ADMIN_API_TOKEN</code> for authentication.
            </p>
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
              <Link href="https://github.com/Vexa-ai/vexa-lite-deploy/tree/main/fly" target="_blank" rel="noopener noreferrer">
                View Complete Fly.io Guide
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/deployment/lite">
                Vexa Lite Overview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="https://github.com/Vexa-ai/Vexa-Dashboard" target="_blank" rel="noopener noreferrer">
                Vexa Dashboard Repository
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





