import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Code, Code2, Zap, Shield, Rocket, Monitor, Terminal, ExternalLink, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Vexa API Documentation | Complete API Reference",
  description: "Complete API reference for Vexa meeting transcription platform. Learn how to integrate Vexa into your applications with REST and WebSocket APIs.",
};

export default function DocsPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Vexa API Documentation</h1>
        <div className="prose prose-sm max-w-2xl">
          <p className="text-lg text-foreground">
            <strong>Vexa</strong> is an open-source, self-hostable API for real-time meeting transcription. 
            Send bots to Google Meet and Microsoft Teams meetings, get sub-second transcript streaming via WebSocket, 
            and maintain complete control over your data.
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Key capabilities:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Meeting bots for Google Meet & Microsoft Teams</li>
              <li>Real-time transcription (100+ languages)</li>
              <li>REST API + WebSocket streaming</li>
              <li>Self-hostable or use hosted API</li>
              <li>Multiuser support with API keys</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <Code className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>REST API</CardTitle>
            <CardDescription>Manage meetings, bots, and transcripts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/rest/meetings">
                Browse REST API
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>WebSocket API</CardTitle>
            <CardDescription>Real-time transcript streaming</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/ws">
                Browse WebSocket API
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BookOpen className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Cookbooks</CardTitle>
            <CardDescription>Step-by-step integration guides</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/cookbook/start-transcription">
                View Cookbooks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Admin API</CardTitle>
            <CardDescription>User and token management</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/admin/users">
                Browse Admin API
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Getting Started</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Get Started in 5 Minutes</CardTitle>
                <Badge variant="secondary" className="ml-auto">⭐ Minimal but complete</Badge>
              </div>
              <CardDescription>
                Complete, minimal example showing the full workflow from start to finish
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Follow our step-by-step cookbook that demonstrates the complete workflow: 
                start a bot, get transcripts, stop the bot, and clean up. This is a minimal but 
                full example of usage that covers everything you need to get started.
              </p>
              <Button asChild className="w-full">
                <Link href="/docs/cookbook/get-started">
                  View Complete Example
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Learn how to authenticate API requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Vexa uses API keys for authentication. User API keys grant access to meeting operations,
                while Admin API keys provide full system access.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/auth">
                  Read Authentication Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <CardTitle>MCP Integration</CardTitle>
                <Badge variant="secondary" className="ml-auto">AI Agents</Badge>
              </div>
              <CardDescription>
                Connect Claude Desktop, Cursor, or any MCP-compatible client to Vexa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use Vexa directly from your AI agent. Send bots to meetings, get transcripts, 
                and manage meetings through Model Context Protocol (MCP).
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/mcp">
                  Setup MCP Integration
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <CardTitle>Interactive Dashboard</CardTitle>
            </div>
            <CardDescription>
              Use the Vexa Dashboard to interact with your API visually, with API Docs Mode enabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The <strong>Vexa Dashboard</strong> is a 100% open-source web interface that lets you 
                manage meetings, view transcripts, and interact with your Vexa instance visually. 
                When <strong>API Docs Mode</strong> is enabled, you'll see contextual API documentation 
                badges throughout the UI, showing you the underlying API endpoints for every action.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Visual meeting management and real-time transcript viewing</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">API Docs Mode - see API calls for each UI action</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Quick navigation to all API endpoints while using the UI</span>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="https://github.com/Vexa-ai/Vexa-Dashboard" target="_blank" rel="noopener noreferrer">
                  Deploy Vexa Dashboard
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Deployment</h2>
        <p className="text-sm text-muted-foreground">
          Choose your deployment method based on your needs. Vexa Lite is recommended for production, 
          while Docker Compose is perfect for development.
        </p>
        <Tabs defaultValue="lite" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lite" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              <span className="hidden sm:inline">Vexa Lite</span>
              <span className="sm:hidden">Lite</span>
            </TabsTrigger>
            <TabsTrigger value="fly" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              <span className="hidden sm:inline">Fly.io</span>
              <span className="sm:hidden">Fly</span>
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span className="hidden sm:inline">Docker Compose</span>
              <span className="sm:hidden">Compose</span>
            </TabsTrigger>
            <TabsTrigger value="dev" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Development</span>
              <span className="sm:hidden">Dev</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lite" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  <CardTitle>Vexa Lite - Production Deployment</CardTitle>
                  <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                </div>
                <CardDescription>
                  Single-container deployment for production. No GPU required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vexa Lite is a stateless, single-container deployment perfect for teams who want 
                  quick deployment on any platform. Transcription runs externally, so no GPU is required.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Single Docker container - easy to deploy</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">No GPU required - transcription runs externally</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Stateless by design - easy to redeploy and scale</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Production-ready and serverless-friendly</span>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs font-mono text-foreground mb-2">Quick Start:</p>
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
                <Button asChild variant="outline" className="w-full">
                  <Link href="https://github.com/Vexa-ai/vexa/blob/main/docs/vexa-lite-deployment.md" target="_blank" rel="noopener noreferrer">
                    View Complete Guide
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fly" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  <CardTitle>Fly.io - One-Click Deployment</CardTitle>
                  <Badge variant="secondary" className="ml-auto">Platform</Badge>
                </div>
                <CardDescription>
                  Deploy Vexa Lite to Fly.io in minutes with one-click setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Fly.io provides a simple way to deploy Vexa Lite with automatic scaling, 
                  SSL certificates, and global distribution. The deployment includes both backend 
                  and optional dashboard deployment.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">One-click deployment script</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Automatic SSL and global CDN</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Optional dashboard deployment included</span>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="https://github.com/Vexa-ai/vexa-lite-deploy/tree/main/fly" target="_blank" rel="noopener noreferrer">
                    View Fly.io Guide
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compose" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  <CardTitle>Docker Compose - Development</CardTitle>
                  <Badge variant="secondary" className="ml-auto">Full Stack</Badge>
                </div>
                <CardDescription>
                  Full stack deployment for development and testing with all services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Docker Compose deployment includes all services: API Gateway, Bot Manager, 
                  Transcription Service, Database, and more. Perfect for development, testing, 
                  and understanding the full architecture.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">All services in one command: <code className="bg-muted px-1 rounded">make all</code></span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">CPU mode (Whisper tiny) or GPU mode (Whisper medium)</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Complete local development environment</span>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs font-mono text-foreground mb-2">Quick Start:</p>
                  <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`git clone https://github.com/Vexa-ai/vexa.git
cd vexa
make all            # CPU (tiny model)
# or
make all TARGET=gpu  # GPU (medium model)`}
                  </code>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="https://github.com/Vexa-ai/vexa/blob/main/docs/deployment.md" target="_blank" rel="noopener noreferrer">
                    View Deployment Guide
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dev" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <CardTitle>Development Setup</CardTitle>
                  <Badge variant="secondary" className="ml-auto">Contributors</Badge>
                </div>
                <CardDescription>
                  Local development setup with hot reload for contributors and developers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Set up a local development environment with hot reload, debugging capabilities, 
                  and full access to all services. Perfect for contributing to Vexa or building 
                  custom integrations.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Hot reload for all services</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Full debugging capabilities</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Access to all source code and services</span>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="https://github.com/Vexa-ai/vexa/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
                    View Contributing Guide
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* API Overview */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">API Overview</h2>
        <div className="prose prose-sm max-w-none">
          <p>
            The Vexa API consists of two main components:
          </p>
          <ul>
            <li>
              <strong>REST API</strong>: For managing meetings, bots, and fetching transcripts.
              All REST endpoints use standard HTTP methods and return JSON responses.
            </li>
            <li>
              <strong>WebSocket API</strong>: For receiving real-time transcript updates as meetings progress.
              Connect once and subscribe to multiple meetings for live streaming.
            </li>
          </ul>
          <p>
            Both APIs require authentication via API keys. User API keys are scoped to individual users,
            while Admin API keys provide system-wide access for user and token management.
          </p>
        </div>
      </div>
    </div>
  );
}

