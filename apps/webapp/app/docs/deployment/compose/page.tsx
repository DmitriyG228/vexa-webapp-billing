import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Terminal, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Docker Compose Deployment | Vexa API Documentation",
  description: "Full stack deployment for development and testing with all services. Perfect for understanding the complete architecture.",
};

export default function DockerComposePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Docker Compose Deployment</h1>
          <Badge variant="secondary">Full Stack</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          Full stack deployment for development and testing with all services. Perfect for understanding the complete architecture.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Docker Compose deployment includes all services:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>API Gateway</strong> - Routes API requests to appropriate services</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Bot Manager</strong> - Handles bot lifecycle management</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Transcription Service</strong> - Whisper-based transcription (CPU or GPU)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Database</strong> - PostgreSQL for storing meeting data</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Redis</strong> - For caching and real-time data</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>All supporting services</strong> - Transcription Collector, WhisperLive, etc.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Deploy the full stack in one command</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 1: Clone the repository</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`git clone https://github.com/Vexa-ai/vexa.git
cd vexa`}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 2: Deploy (CPU mode)</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`make all            # CPU by default (Whisper tiny) — good for development`}
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              For production quality transcription, use GPU mode: <code className="bg-muted px-1 rounded">make all TARGET=gpu</code> (requires NVIDIA GPU with drivers)
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">What <code className="bg-muted px-1 rounded">make all</code> does:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Builds all Docker images</li>
              <li>Spins up all containers (API, bots, transcription services, database)</li>
              <li>Runs database migrations</li>
              <li>Starts a simple test to verify everything works</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GPU Deployment</CardTitle>
          <CardDescription>For production-quality transcription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Prerequisites</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>NVIDIA GPU with CUDA support</li>
              <li>NVIDIA drivers installed (<code className="bg-muted px-1 rounded">nvidia-smi</code> must work)</li>
              <li>NVIDIA Container Toolkit installed</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Deploy with GPU</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`make all TARGET=gpu    # GPU (Whisper medium) — recommended for production quality`}
              </code>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            GPU mode uses Whisper medium model for higher quality transcription, while CPU mode uses Whisper tiny for faster processing.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">CPU Mode</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Minimum: 4GB RAM, 2 CPU cores</li>
                <li>Recommended: 8GB RAM, 4 CPU cores</li>
                <li>Uses Whisper tiny model (faster, lower quality)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">GPU Mode</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>NVIDIA GPU with 4GB+ VRAM</li>
                <li>16GB+ system RAM recommended</li>
                <li>Uses Whisper medium model (slower, higher quality)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Your Deployment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>After deployment, your services will be available at:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>API Gateway:</strong> <code className="bg-muted px-1 rounded">http://localhost:18056</code></li>
              <li><strong>Admin API:</strong> <code className="bg-muted px-1 rounded">http://localhost:18057</code></li>
              <li><strong>API Documentation:</strong> <code className="bg-muted px-1 rounded">http://localhost:18056/docs</code></li>
            </ul>
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
              <Link href="https://github.com/Vexa-ai/vexa/blob/main/docs/deployment.md" target="_blank" rel="noopener noreferrer">
                View Complete Deployment Guide
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/deployment/development">
                Development Setup Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/cookbook/get-started">
                Get Started with API
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





