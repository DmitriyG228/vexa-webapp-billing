import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { APIEndpointDoc } from "@/components/docs/api-endpoint-doc";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Get Transcripts | Vexa API Cookbook",
  description: "Learn how to fetch transcripts via REST API and receive live updates via WebSocket",
};

export default function GetTranscriptsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Get Transcripts</h1>
        <p className="text-muted-foreground mt-2">
          Learn how to fetch transcripts using the REST API and receive live transcript updates via WebSocket.
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            There are two ways to get transcripts: <strong>REST API</strong> for fetching complete transcripts and <strong>WebSocket</strong> for real-time updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">REST API</h3>
              <p className="text-sm text-muted-foreground">
                Use <code className="bg-muted px-1 rounded">GET /transcripts/{`{platform}`}/{`{native_meeting_id}`}</code> to fetch all transcript segments for a meeting. Best for:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Loading historical transcripts</li>
                <li>Bootstraping before WebSocket connection</li>
                <li>One-time transcript retrieval</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">WebSocket</h3>
              <p className="text-sm text-muted-foreground">
                Subscribe to meetings and receive <code className="bg-muted px-1 rounded">transcript.mutable</code> and <code className="bg-muted px-1 rounded">transcript.finalized</code> events. Best for:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Real-time transcript updates during active meetings</li>
                <li>Live transcription display</li>
                <li>Streaming transcript processing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* REST API */}
      <Card>
        <CardHeader>
          <CardTitle>Fetch Transcripts via REST API</CardTitle>
          <CardDescription>
            Get all transcript segments for a meeting using the REST API
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  text: "Hello, welcome to our meeting.",
                  speaker: "John Doe",
                  start: 0.0,
                  end: 5.2,
                  absolute_start_time: "2024-01-01T12:00:00.000Z",
                  absolute_end_time: "2024-01-01T12:00:05.200Z",
                  language: "en",
                  confidence: 0.95,
                  created_at: "2024-01-01T12:00:05.200Z"
                }
              ]
            }}
            notes={[
              "Returns all transcript segments for the meeting",
              "Segments are ordered chronologically by start time",
            ]}
          />
        </CardContent>
      </Card>

      {/* WebSocket */}
      <Card>
        <CardHeader>
          <CardTitle>Receive Live Transcripts via WebSocket</CardTitle>
          <CardDescription>
            Subscribe to meetings and receive transcript events in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For detailed WebSocket implementation, see the <Link href="/docs/cookbook/live-transcripts" className="text-primary hover:underline">Live Transcripts cookbook</Link>.
            </p>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Quick Example</h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`// Connect and subscribe
const ws = new WebSocket('wss://your-api-url/ws?api_key=your-api-key');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'subscribe',
    meetings: [{ platform: 'google_meet', native_id: 'abc-defg-hij' }]
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'transcript.mutable') {
    // Live segments that may be updated
    message.payload.segments.forEach(segment => {
      console.log(\`[LIVE] [\${segment.speaker}] \${segment.text}\`);
    });
  } else if (message.type === 'transcript.finalized') {
    // Final segments that won't change
    message.payload.segments.forEach(segment => {
      console.log(\`[FINAL] [\${segment.speaker}] \${segment.text}\`);
    });
  }
};`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practice: Bootstrap Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practice: Bootstrap Pattern</CardTitle>
          <CardDescription>
            Combine REST and WebSocket for the best experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For active meetings, use a bootstrap pattern:
            </p>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li className="text-muted-foreground">
                <strong>Bootstrap:</strong> Fetch existing transcripts via REST API first
              </li>
              <li className="text-muted-foreground">
                <strong>Connect:</strong> Establish WebSocket connection and subscribe
              </li>
              <li className="text-muted-foreground">
                <strong>Merge:</strong> Use <code className="bg-muted px-1 rounded">absolute_start_time</code> as unique ID to merge REST and WebSocket segments
              </li>
              <li className="text-muted-foreground">
                <strong>Update:</strong> Replace mutable segments with finalized ones as they arrive
              </li>
            </ol>
            
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Example Implementation</h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`// 1. Bootstrap from REST
const bootstrapSegments = await getTranscripts(platform, nativeId);
const transcriptMap = new Map();

// Store segments by absolute_start_time (unique ID)
bootstrapSegments.forEach(seg => {
  transcriptMap.set(seg.absolute_start_time, seg);
});

// 2. Connect WebSocket
const ws = new WebSocket('wss://your-api-url/ws?api_key=your-api-key');
ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'subscribe',
    meetings: [{ platform, native_id: nativeId }]
  }));
};

// 3. Handle updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'transcript.mutable' || message.type === 'transcript.finalized') {
    message.payload.segments.forEach(seg => {
      const key = seg.absolute_start_time;
      const existing = transcriptMap.get(key);
      
      // Update if new or if this version is newer
      if (!existing || new Date(seg.updated_at) > new Date(existing.updated_at)) {
        transcriptMap.set(key, seg);
        updateUI(Array.from(transcriptMap.values()).sort((a, b) => 
          new Date(a.absolute_start_time) - new Date(b.absolute_start_time)
        ));
      }
    });
  }
};`}</code>
              </pre>
            </div>
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
            <Link href="/docs/rest/transcripts" className="text-primary hover:underline inline-flex items-center gap-1">
              Transcripts REST API Reference <ExternalLink className="h-3 w-3" />
            </Link>
            <br />
            <Link href="/docs/cookbook/live-transcripts" className="text-primary hover:underline inline-flex items-center gap-1">
              Live Transcripts via WebSocket <ExternalLink className="h-3 w-3" />
            </Link>
            <br />
            <Link href="/docs/ws/events" className="text-primary hover:underline inline-flex items-center gap-1">
              WebSocket Events Reference <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

