import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Code2, CheckCircle2, ExternalLink, Zap, Settings, FileText, Trash2, List } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "MCP Integration | Vexa API Documentation",
  description: "Connect Claude Desktop, Cursor, or any MCP-compatible client to Vexa. Send bots to meetings, get transcripts, and manage meetings directly from your AI agent.",
};

export default function MCPPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">MCP Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect Claude Desktop, Cursor, or any MCP-compatible client to Vexa. Send bots to meetings, 
          get transcripts, and manage meetings directly from your AI agent.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What is MCP?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Model Context Protocol (MCP)</strong> is a protocol that allows AI agents to access 
            external tools and services. Vexa provides an MCP server that enables your AI agent to:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Send transcription bots to Google Meet and Microsoft Teams meetings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Get real-time meeting transcripts during or after meetings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Manage meeting metadata, update bot configurations, and stop bots</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Access meeting history and bot status</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">1. Install Node.js</h3>
              <p className="text-sm text-muted-foreground mb-2">
                The MCP uses <code className="bg-muted px-1 rounded">npx</code> (Node Package Manager) to connect to the server.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Download <Link href="https://nodejs.org/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Node.js LTS</Link> for your operating system</li>
                <li>Install and verify: <code className="bg-muted px-1 rounded">node -v</code> and <code className="bg-muted px-1 rounded">npm -v</code></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">2. Get Your Vexa API Key</h3>
              <p className="text-sm text-muted-foreground mb-2">
                You'll need a Vexa API key to authenticate with the MCP server.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>For hosted Vexa: Get your API key from <Link href="https://vexa.ai/dashboard/api-keys" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">vexa.ai/dashboard/api-keys</Link></li>
                <li>For self-hosted: Create an API key using the Admin API or Dashboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Setup Instructions</h2>
        <Tabs defaultValue="claude" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="claude">Claude Desktop</TabsTrigger>
            <TabsTrigger value="cursor">Cursor / Other</TabsTrigger>
          </TabsList>

          <TabsContent value="claude" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Claude Desktop Setup</CardTitle>
                <CardDescription>Connect Vexa MCP to Claude Desktop</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Step 1: Open Claude Desktop Settings</h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Launch Claude Desktop</li>
                    <li>Navigate to <strong>Settings</strong> → <strong>Developer</strong></li>
                    <li>Click <strong>Edit Config</strong> (opens config file in text editor)</li>
                  </ol>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Step 2: Add MCP Configuration</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Paste the following configuration into your Claude config file:
                  </p>
                  <div className="rounded-lg bg-muted p-4">
                    <code className="text-xs text-foreground block whitespace-pre-wrap">
{`{
  "mcpServers": {
    "Vexa": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://api.cloud.vexa.ai/mcp",
        "--header",
        "Authorization:\${VEXA_API_KEY}"
      ],
      "env": {
        "VEXA_API_KEY": "your-api-key-here"
      }
    }
  }
}`}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>Important:</strong> Replace <code className="bg-background px-1 rounded">your-api-key-here</code> with your actual Vexa API key.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Step 3: Restart Claude Desktop</h3>
                  <p className="text-sm text-muted-foreground">
                    Save the configuration file and restart Claude Desktop. Go to Developer settings 
                    again to verify the MCP server is running.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cursor" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cursor / Other MCP Clients</CardTitle>
                <CardDescription>Connect Vexa MCP to Cursor or other MCP-compatible clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The same configuration works for Cursor and other MCP-compatible clients. 
                  The configuration format is standardized across MCP clients.
                </p>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Configuration</h3>
                  <div className="rounded-lg bg-muted p-4">
                    <code className="text-xs text-foreground block whitespace-pre-wrap">
{`{
  "mcpServers": {
    "Vexa": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://api.cloud.vexa.ai/mcp",
        "--header",
        "Authorization:\${VEXA_API_KEY}"
      ],
      "env": {
        "VEXA_API_KEY": "your-api-key-here"
      }
    }
  }
}`}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Check your client's documentation for where to place the MCP configuration file.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Self-Hosted Vexa Setup</CardTitle>
          <CardDescription>Connect to your self-hosted Vexa instance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you're using a self-hosted Vexa instance (Vexa Lite or Docker Compose), 
            replace the MCP URL in your configuration:
          </p>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Vexa Lite</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-foreground block whitespace-pre-wrap">
{`"args": [
  "-y",
  "mcp-remote",
  "http://localhost:8056/mcp",  // Replace with your Vexa Lite URL
  "--header",
  "Authorization:\${VEXA_API_KEY}"
]`}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Docker Compose (Full Stack)</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-foreground block whitespace-pre-wrap">
{`"args": [
  "-y",
  "mcp-remote",
  "http://localhost:18056/mcp",  // Replace with your API Gateway URL
  "--header",
  "Authorization:\${VEXA_API_KEY}"
]`}
              </code>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            For remote deployments (Fly.io, etc.), use your public API URL instead of localhost.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Available MCP Tools</h2>
        <p className="text-sm text-muted-foreground">
          Once connected, your AI agent can use these tools to interact with Vexa:
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Request Meeting Bot</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Send a transcription bot to join a Google Meet or Microsoft Teams meeting.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Parameters:</strong></p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li><code className="bg-muted px-1 rounded">native_meeting_id</code> - Meeting ID (e.g., "abc-defg-hij")</li>
                  <li><code className="bg-muted px-1 rounded">platform</code> - "google_meet" or "teams"</li>
                  <li><code className="bg-muted px-1 rounded">language</code> - Optional language code</li>
                  <li><code className="bg-muted px-1 rounded">bot_name</code> - Optional custom bot name</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Get Meeting Transcript</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Get real-time transcript for a meeting. Can be called during or after the meeting.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Parameters:</strong></p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li><code className="bg-muted px-1 rounded">meeting_id</code> - Meeting identifier</li>
                  <li><code className="bg-muted px-1 rounded">meeting_platform</code> - "google_meet" or "teams"</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Get Bot Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Get the status of currently running bots under your API key.
              </p>
              <div className="text-xs text-muted-foreground">
                <p>Returns details about active bots including meeting IDs, platforms, and status.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Update Bot Config</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Update the configuration of an active bot (e.g., change transcription language).
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Parameters:</strong></p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li><code className="bg-muted px-1 rounded">meeting_id</code> - Meeting identifier</li>
                  <li><code className="bg-muted px-1 rounded">language</code> - New language code (e.g., "en", "es")</li>
                  <li><code className="bg-muted px-1 rounded">meeting_platform</code> - "google_meet" or "teams"</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Stop Bot</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Remove an active bot from a meeting. Disconnects the bot and marks the meeting as completed.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Parameters:</strong></p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li><code className="bg-muted px-1 rounded">meeting_id</code> - Meeting identifier</li>
                  <li><code className="bg-muted px-1 rounded">meeting_platform</code> - "google_meet" or "teams"</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Update Meeting Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Update meeting metadata such as name, participants, languages, and notes.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Parameters:</strong></p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li><code className="bg-muted px-1 rounded">meeting_id</code> - Meeting identifier</li>
                  <li><code className="bg-muted px-1 rounded">name</code> - Optional meeting name</li>
                  <li><code className="bg-muted px-1 rounded">participants</code> - Optional participant list</li>
                  <li><code className="bg-muted px-1 rounded">notes</code> - Optional meeting notes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">List Meetings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                List all meetings associated with your API key.
              </p>
              <div className="text-xs text-muted-foreground">
                <p>Returns a list of meeting records with status, timestamps, and metadata.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Delete Meeting</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Purge transcripts and anonymize meeting data for finalized meetings.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Parameters:</strong></p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li><code className="bg-muted px-1 rounded">meeting_id</code> - Meeting identifier</li>
                  <li><code className="bg-muted px-1 rounded">meeting_platform</code> - "google_meet" or "teams"</li>
                </ul>
                <p className="mt-2"><strong>Note:</strong> Only works for meetings in completed or failed states.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Example Usage</CardTitle>
          <CardDescription>How to use Vexa MCP with your AI agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Example Conversation</h3>
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="text-xs">
                <p className="font-semibold text-foreground mb-1">You:</p>
                <p className="text-muted-foreground">"Send a bot to join my Google Meet meeting with ID abc-defg-hij"</p>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground mb-1">Agent:</p>
                <p className="text-muted-foreground">
                  I'll send a transcription bot to your meeting. [Uses request_meeting_bot tool]
                  Bot requested! It should join within about 10 seconds.
                </p>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground mb-1">You:</p>
                <p className="text-muted-foreground">"Get the transcript from that meeting"</p>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground mb-1">Agent:</p>
                <p className="text-muted-foreground">
                  [Uses get_meeting_transcript tool] Here's the transcript: [displays transcript]
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Missing npx or npm</h3>
              <p className="text-sm text-muted-foreground">
                If you see errors about missing <code className="bg-muted px-1 rounded">npx</code> or <code className="bg-muted px-1 rounded">npm</code>, 
                make sure Node.js is installed. Verify with <code className="bg-muted px-1 rounded">node -v</code> and <code className="bg-muted px-1 rounded">npm -v</code>.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Authentication Errors</h3>
              <p className="text-sm text-muted-foreground">
                If you get authentication errors, double-check your API key in the configuration. 
                Make sure you're using a valid User API key (not Admin API key for most operations).
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Connection Issues</h3>
              <p className="text-sm text-muted-foreground">
                For self-hosted instances, ensure your Vexa instance is running and accessible. 
                Check that the MCP URL in your configuration matches your deployment (localhost for local, 
                public URL for remote).
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">MCP Server Not Running</h3>
              <p className="text-sm text-muted-foreground">
                In Claude Desktop, go to Settings → Developer to verify the MCP server status. 
                If it's not running, check your configuration syntax and restart Claude Desktop.
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
              <Link href="https://github.com/Vexa-ai/vexa/tree/main/services/mcp" target="_blank" rel="noopener noreferrer">
                View MCP Service Source Code
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/cookbook/get-started">
                Get Started with API
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/auth">
                Authentication Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





