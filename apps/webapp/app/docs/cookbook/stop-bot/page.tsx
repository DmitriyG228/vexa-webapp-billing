import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APIEndpointDoc } from "@/components/docs/api-endpoint-doc";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Stop Bot | Vexa API Cookbook",
  description: "How to stop an active transcription bot",
};

export default function StopBotPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stop Bot</h1>
        <p className="text-muted-foreground mt-2">
          Learn how to stop an active transcription bot and disconnect it from a meeting.
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6">
        <div>
          <h2>Overview</h2>
          <p>
            To stop a bot, send a DELETE request to the bot endpoint. The bot will disconnect from the meeting
            and the meeting status will change to <code className="bg-muted px-1 rounded">completed</code>.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stop Bot Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <APIEndpointDoc
                title=""
                description=""
                method="DELETE"
                path="/bots/{platform}/{native_meeting_id}"
                authType="user"
                dashboardProxy="/api/vexa/bots/{platform}/{native_meeting_id}"
                pathParams={[
                  {
                    name: "platform",
                    type: "string",
                    description: "Meeting platform: google_meet or teams",
                    required: true,
                  },
                  {
                    name: "native_meeting_id",
                    type: "string",
                    description: "The platform-specific meeting ID",
                    required: true,
                  },
                ]}
                notes={[
                  "Stopping a bot will mark the meeting as completed",
                  "Transcripts remain available after stopping the bot",
                ]}
              />
              <Link href="/docs/rest/bots" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                View full API reference
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>After Stopping</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              After stopping a bot:
            </p>
            <ul className="text-sm space-y-2">
              <li>The bot will disconnect from the meeting</li>
              <li>The meeting status will change to <code className="bg-muted px-1 rounded">completed</code></li>
              <li>All transcripts remain available via REST API</li>
              <li>WebSocket will send a <code className="bg-muted px-1 rounded">meeting.status</code> event with status <code className="bg-muted px-1 rounded">completed</code></li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fetch Final Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              After stopping, fetch the complete transcript via REST API.
            </p>
            <Link href="/docs/rest/transcripts" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              View Transcripts API
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

