import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";
import { APIEndpointDoc } from "@/components/docs/api-endpoint-doc";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Get Started | Vexa API Cookbook",
  description: "Complete walkthrough: start a bot, get transcripts, stop the bot, and delete the meeting",
};

export default function GetStartedPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Get Started</h1>
        <p className="text-muted-foreground mt-2">
          Complete walkthrough for starting a transcription bot, fetching transcripts, stopping the bot, and cleaning up.
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            This cookbook provides a complete end-to-end example of using the Vexa API workflow:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
            <li>Start a transcription bot to join a meeting</li>
            <li>Get transcripts via REST API</li>
            <li>Stop the bot when done</li>
            <li>Delete the meeting to clean up</li>
          </ol>
        </CardContent>
      </Card>

      {/* Step 1: Start Bot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Step 1: Start Bot
          </CardTitle>
          <CardDescription>
            Send a transcription bot to join a meeting and start transcribing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <APIEndpointDoc
              title=""
              description=""
              method="POST"
              path="/bots"
              authType="user"
              dashboardProxy="/api/vexa/bots"
              requestBody={{
                description: "Bot configuration",
                schema: {
                  platform: "google_meet",
                  native_meeting_id: "abc-defg-hij",
                  bot_name: "My Transcription Bot",
                  language: "en"
                },
              }}
              responseExample={{
                id: 123,
                platform: "google_meet",
                native_meeting_id: "abc-defg-hij",
                status: "requested",
                start_time: null,
                end_time: null,
                bot_container_id: null,
                data: {},
                created_at: "2024-01-01T12:00:00Z",
              }}
              notes={[
                "The bot will transition through statuses: requested → joining → awaiting_admission → active",
                "For Google Meet, meeting IDs follow the format: abc-defg-hij",
              ]}
            />
            <Link href="/docs/rest/bots" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              View full API reference <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Get Transcripts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Step 2: Get Transcripts
          </CardTitle>
          <CardDescription>
            Fetch all transcript segments for the meeting using the REST API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              After the bot has been active for a while, you can fetch the transcripts. Wait until the meeting status is <code className="bg-muted px-1 rounded">active</code> or <code className="bg-muted px-1 rounded">completed</code>.
            </p>
            <APIEndpointDoc
              title=""
              description=""
              method="GET"
              path="/transcripts/{platform}/{native_meeting_id}"
              authType="user"
              dashboardProxy="/api/vexa/transcripts/{platform}/{native_meeting_id}"
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
              responseExample={{
                segments: [
                  {
                    id: 1,
                    start: 0.0,
                    end: 5.2,
                    text: "Hello, welcome to our meeting.",
                    speaker: "John Doe",
                    language: "en",
                    confidence: 0.95,
                  },
                ],
              }}
              notes={[
                "Returns all transcript segments for the meeting",
                "Segments are ordered chronologically by start time",
              ]}
            />
            <Link href="/docs/rest/transcripts" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              View Transcripts API reference <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Stop Bot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Step 3: Stop Bot
          </CardTitle>
          <CardDescription>
            Stop the active transcription bot and disconnect it from the meeting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              When you're done with the meeting, stop the bot. This will disconnect the bot and mark the meeting as <code className="bg-muted px-1 rounded">completed</code>.
            </p>
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
              View Bots API reference <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Delete Meeting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Step 4: Delete Meeting
          </CardTitle>
          <CardDescription>
            Delete the meeting and all its transcripts to clean up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once the meeting is finalized (<code className="bg-muted px-1 rounded">completed</code> or <code className="bg-muted px-1 rounded">failed</code>), you can delete it to purge transcripts and anonymize data. This preserves meeting records for telemetry but removes all transcript content.
            </p>
            <APIEndpointDoc
              title=""
              description=""
              method="DELETE"
              path="/meetings/{platform}/{native_meeting_id}"
              authType="user"
              dashboardProxy="/api/vexa/meetings/{platform}/{native_meeting_id}"
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
                "Only works for meetings in completed or failed states",
                "Deletes all transcripts but preserves meeting and session records for telemetry",
              ]}
            />
            <p className="text-sm text-muted-foreground">
              Note: The meeting must be in a finalized state (<code className="bg-muted px-1 rounded">completed</code> or <code className="bg-muted px-1 rounded">failed</code>) before it can be deleted. If you receive a 409 Conflict error, wait until the meeting is finalized.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Related Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <Link href="/docs/cookbook/start-transcription" className="text-primary hover:underline inline-flex items-center gap-1">
              Start Transcription Cookbook <ExternalLink className="h-3 w-3" />
            </Link>
            <br />
            <Link href="/docs/cookbook/get-transcripts" className="text-primary hover:underline inline-flex items-center gap-1">
              Get Transcripts Cookbook <ExternalLink className="h-3 w-3" />
            </Link>
            <br />
            <Link href="/docs/cookbook/stop-bot" className="text-primary hover:underline inline-flex items-center gap-1">
              Stop Bot Cookbook <ExternalLink className="h-3 w-3" />
            </Link>
            <br />
            <Link href="/docs/rest/bots" className="text-primary hover:underline inline-flex items-center gap-1">
              Bots REST API Reference <ExternalLink className="h-3 w-3" />
            </Link>
            <br />
            <Link href="/docs/rest/transcripts" className="text-primary hover:underline inline-flex items-center gap-1">
              Transcripts REST API Reference <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
