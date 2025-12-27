# Vexa API Documentation


Complete API reference for Vexa meeting transcription platform.


*Generated automatically from the Vexa API documentation on 2025-12-27T20:40:14.100Z.*


---


## Overview


[API Docs](/docs)Export All DocsRegenerate# Vexa API Documentation

Complete reference for integrating Vexa meeting transcription into your applications. Use REST APIs for meeting management and WebSocket APIs for real-time transcript streaming.

REST APIManage meetings, bots, and transcripts[Browse REST API](/docs/rest/meetings)WebSocket APIReal-time transcript streaming[Browse WebSocket API](/docs/ws)CookbooksStep-by-step integration guides[View Cookbooks](/docs/cookbook/start-transcription)Admin APIUser and token management[Browse Admin API](/docs/admin/users)## Getting Started

AuthenticationLearn how to authenticate API requestsVexa uses API keys for authentication. User API keys grant access to meeting operations, while Admin API keys provide full system access.

[Read Authentication Guide](/docs/auth)Quick StartSend your first transcription botFollow our step-by-step cookbook to send a bot to a meeting and receive transcripts.

[Start Tutorial](/docs/cookbook/start-transcription)## API Overview

The Vexa API consists of two main components:

- **REST API**: For managing meetings, bots, and fetching transcripts. All REST endpoints use standard HTTP methods and return JSON responses.
- **WebSocket API**: For receiving real-time transcript updates as meetings progress. Connect once and subscribe to multiple meetings for live streaming.

Both APIs require authentication via API keys. User API keys are scoped to individual users, while Admin API keys provide system-wide access for user and token management.


---


## Authentication


[API Docs](/docs)Export All DocsRegenerate# Authentication

Vexa uses API keys for authentication. There are two types of API keys: User API keys and Admin API keys.

## User API Keys

User API keys grant access to meeting operations: creating bots, fetching transcripts, and managing meetings. These keys are scoped to individual users and can be created through the Admin API or dashboard.

Include your User API key in the `X-API-Key` header for all REST API requests:

```
X-API-Key: your_user_api_key_here
```

## Admin API Keys

Admin API keys provide full system access, including user management and token creation. These keys are configured at the server level and should be kept secure.

Include your Admin API key in the `X-Admin-API-Key` header for Admin API requests:

```
X-Admin-API-Key: your_admin_api_key_here
```

## WebSocket Authentication

WebSocket connections authenticate using the same User API key, but passed as a query parameter (since browsers cannot set custom headers for WebSocket connections):

```
wss://api.vexa.ai/ws?api_key=your_user_api_key_here
```

## Getting Your API Key

To get a User API key:

- Log in to the Vexa Dashboard
- Go to Settings or use the Admin API to create a token
- Copy your API key and store it securely

**Note:** API keys are only shown once at creation. If you lose your key, you'll need to create a new one.


---


## REST API - Meetings


[API Docs](/docs)Export All DocsRegenerate# Meetings API

Manage meetings, update metadata, and track meeting status.

GET`/meetings`# List Meetings

Get a list of all meetings for the authenticated user.

**Dashboard Proxy:** The dashboard calls `/api/vexa/meetings` which forwards to this endpoint.AuthenticationRequires **User API Key** in `X-API-Key` header.

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X GET "https://api.vexa.ai/meetings" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

Response```
{
  "meetings": [
    {
      "id": 123,
      "platform": "google_meet",
      "native_meeting_id": "abc-defg-hij",
      "status": "completed",
      "start_time": "2024-01-01T12:00:00Z",
      "end_time": "2024-01-01T13:00:00Z",
      "bot_container_id": null,
      "data": {
        "name": "Team Standup",
        "participants": [
          "Alice",
          "Bob"
        ]
      },
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

Notes
- Returns meetings sorted by creation date (newest first)
- Includes meetings in all statuses: requested, joining, active, completed, failed

GET`/meetings/{id}`# Get Meeting

Get detailed information about a specific meeting.

**Dashboard Proxy:** The dashboard calls `/api/vexa/meetings/{id}` which forwards to this endpoint.AuthenticationRequires **User API Key** in `X-API-Key` header.

Path Parameters`id`idintegerRequiredThe meeting ID

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X GET "https://api.vexa.ai/meetings/{id}" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

Response```
{
  "id": 123,
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "status": "active",
  "start_time": "2024-01-01T12:00:00Z",
  "end_time": null,
  "bot_container_id": "container-123",
  "data": {
    "name": "Team Standup",
    "participants": [
      "Alice",
      "Bob"
    ],
    "languages": [
      "en"
    ]
  },
  "created_at": "2024-01-01T12:00:00Z"
}
```

Error Responses404The specified meeting does not exist```
{
  "error": "Meeting not found"
}
```

PATCH`/meetings/{platform}/{native_meeting_id}`# Update Meeting Data

Update meeting metadata such as name, notes, participants, and languages.

**Dashboard Proxy:** The dashboard calls `/api/vexa/meetings/{platform}/{native_meeting_id}` which forwards to this endpoint.AuthenticationRequires **User API Key** in `X-API-Key` header.

Path Parameters`platform`platformstringRequiredMeeting platform: google_meet or teams

`native_meeting_id`native_meeting_idstringRequiredThe platform-specific meeting ID

Request BodyMeeting data updates```
{
  "data": {
    "name": "Updated Meeting Name",
    "notes": "Meeting notes here",
    "participants": [
      "Alice",
      "Bob",
      "Charlie"
    ],
    "languages": [
      "en",
      "es"
    ]
  }
}
```

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X PATCH "https://api.vexa.ai/meetings/{platform}/{native_meeting_id}" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Content-Type: application/json" \
  -d '{
  "data": {
    "name": "Updated Meeting Name",
    "notes": "Meeting notes here",
    "participants": [
      "Alice",
      "Bob",
      "Charlie"
    ],
    "languages": [
      "en",
      "es"
    ]
  }
}'
```

Response```
{
  "id": 123,
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "status": "active",
  "data": {
    "name": "Updated Meeting Name",
    "notes": "Meeting notes here",
    "participants": [
      "Alice",
      "Bob",
      "Charlie"
    ],
    "languages": [
      "en",
      "es"
    ]
  }
}
```

Notes
- All fields in the data object are optional
- Only provided fields will be updated
- Useful for adding context and metadata to meetings


---


## REST API - Bots


[API Docs](/docs)Export All DocsRegenerate# Bots API

Manage transcription bots that join meetings and transcribe audio in real-time.

POST`/bots`# Create Bot

Send a transcription bot to join a meeting. The bot will automatically join and start transcribing.

**Dashboard Proxy:** The dashboard calls `/api/vexa/bots` which forwards to this endpoint.AuthenticationRequires **User API Key** in `X-API-Key` header.

Request BodyBot configuration```
{
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "passcode": "optional_passcode",
  "bot_name": "Vexa Transcription Bot",
  "language": "en"
}
```

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X POST "https://api.vexa.ai/bots" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Content-Type: application/json" \
  -d '{
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "passcode": "optional_passcode",
  "bot_name": "Vexa Transcription Bot",
  "language": "en"
}'
```

Response```
{
  "id": 123,
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "status": "requested",
  "start_time": null,
  "end_time": null,
  "bot_container_id": null,
  "data": {},
  "created_at": "2024-01-01T12:00:00Z"
}
```

Error Responses400The meeting ID format is invalid for the specified platform```
{
  "error": "Invalid meeting ID format"
}
```

401Invalid or missing API key```
{
  "error": "Unauthorized"
}
```

429User has reached their maximum concurrent bot limit```
{
  "error": "Too many concurrent bots"
}
```

Notes
- The bot will transition through statuses: requested → joining → awaiting_admission → active
- For Google Meet, meeting IDs follow the format: abc-defg-hij
- For Microsoft Teams, meeting IDs are numeric and require a passcode
- The language parameter is optional. If not specified, the bot will auto-detect the language

DELETE`/bots/{platform}/{native_meeting_id}`# Stop Bot

Stop an active transcription bot and disconnect it from the meeting.

**Dashboard Proxy:** The dashboard calls `/api/vexa/bots/{platform}/{native_meeting_id}` which forwards to this endpoint.AuthenticationRequires **User API Key** in `X-API-Key` header.

Path Parameters`platform`platformstringRequiredMeeting platform: google_meet or teams

`native_meeting_id`native_meeting_idstringRequiredThe platform-specific meeting ID

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X DELETE "https://api.vexa.ai/bots/{platform}/{native_meeting_id}" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

Error Responses404No active bot found for the specified meeting```
{
  "error": "Bot not found"
}
```

Notes
- Stopping a bot will mark the meeting as completed
- Transcripts remain available after stopping the bot

PUT`/bots/{platform}/{native_meeting_id}/config`# Update Bot Configuration

Update the configuration of an active bot, such as changing the transcription language.

**Dashboard Proxy:** The dashboard calls `/api/vexa/bots/{platform}/{native_meeting_id}/config` which forwards to this endpoint.AuthenticationRequires **User API Key** in `X-API-Key` header.

Path Parameters`platform`platformstringRequiredMeeting platform: google_meet or teams

`native_meeting_id`native_meeting_idstringRequiredThe platform-specific meeting ID

Request BodyConfiguration updates```
{
  "language": "es",
  "task": "transcribe",
  "bot_name": "Updated Bot Name"
}
```

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X PUT "https://api.vexa.ai/bots/{platform}/{native_meeting_id}/config" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Content-Type: application/json" \
  -d '{
  "language": "es",
  "task": "transcribe",
  "bot_name": "Updated Bot Name"
}'
```

Error Responses404No active bot found for the specified meeting```
{
  "error": "Bot not found"
}
```

Notes
- Only active bots can have their configuration updated
- Language changes take effect immediately for new transcript segments

GET`/bots/status`# Get Bot Status

Get the status of all currently running bots.

**Dashboard Proxy:** The dashboard calls `/api/vexa/bots/status` which forwards to this endpoint.AuthenticationRequires **User API Key** in `X-API-Key` header.

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X GET "https://api.vexa.ai/bots/status" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

Response```
{
  "running_bots": [
    {
      "container_id": "abc123",
      "meeting_id": 123,
      "platform": "google_meet",
      "native_meeting_id": "abc-defg-hij"
    }
  ]
}
```

Notes
- Returns only bots that are currently running (not completed or failed)
- Useful for monitoring active transcription sessions


---


## REST API - Transcripts


[API Docs](/docs)Export All DocsRegenerate# Transcripts API

Fetch transcripts, create shareable links, and export transcript data.

GET`/transcripts/{platform}/{native_meeting_id}`# Get Transcripts

Get all transcript segments for a meeting. Returns both the transcript data and meeting metadata.

**Dashboard Proxy:** The dashboard calls `/api/vexa/transcripts/{platform}/{native_meeting_id}` which forwards to this endpoint.AuthenticationRequires **User API Key** in `X-API-Key` header.

Path Parameters`platform`platformstringRequiredMeeting platform: google_meet or teams

`native_meeting_id`native_meeting_idstringRequiredThe platform-specific meeting ID

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X GET "https://api.vexa.ai/transcripts/{platform}/{native_meeting_id}" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

Response```
{
  "id": 123,
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "status": "completed",
  "start_time": "2024-01-01T12:00:00Z",
  "end_time": "2024-01-01T13:00:00Z",
  "segments": [
    {
      "start": 0,
      "end": 5.2,
      "text": "Hello everyone, welcome to today's meeting.",
      "speaker": "Alice",
      "language": "en",
      "absolute_start_time": "2024-01-01T12:00:00Z",
      "absolute_end_time": "2024-01-01T12:00:05Z",
      "created_at": "2024-01-01T12:00:05Z"
    }
  ]
}
```

Error Responses404The specified meeting does not exist```
{
  "error": "Meeting not found"
}
```

Notes
- Segments are returned in chronological order
- Each segment includes speaker identification, timestamps, and text
- For active meetings, segments may be incomplete (mutable)

POST`/transcripts/{platform}/{native_meeting_id}/share`# Create Transcript Share Link

Create a short-lived public URL for sharing transcripts with external tools like ChatGPT or Perplexity.

**Dashboard Proxy:** The dashboard calls `/api/vexa/transcripts/{platform}/{native_meeting_id}/share` which forwards to this endpoint.AuthenticationRequires **User API Key** in `X-API-Key` header.

Path Parameters`platform`platformstringRequiredMeeting platform: google_meet or teams

`native_meeting_id`native_meeting_idstringRequiredThe platform-specific meeting ID

Query Parameters`meeting_id`meeting_idintegerOptional meeting ID for reference

`ttl_seconds`ttl_secondsintegerTime-to-live in seconds (default: 3600)

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X POST "https://api.vexa.ai/transcripts/{platform}/{native_meeting_id}/share?meeting_id=your_meeting_id&ttl_seconds=your_ttl_seconds" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

Response```
{
  "share_id": "abc123def456",
  "url": "https://api.vexa.ai/public/transcripts/abc123def456.txt",
  "expires_at": "2024-01-01T13:00:00Z",
  "expires_in_seconds": 3600
}
```

Notes
- Share links are public and do not require authentication
- Links expire after the specified TTL (default: 1 hour)
- Useful for sharing transcripts with AI tools that can read from URLs


---


## WebSocket API - Overview


[API Docs](/docs)Export All DocsRegenerate# WebSocket API

Connect to Vexa's WebSocket API to receive real-time transcript updates as meetings progress.

## Overview

The WebSocket API allows you to receive live transcript segments as they are generated during meetings. Connect once and subscribe to multiple meetings for efficient real-time updates.

ConnectionConnect to the WebSocket endpointWebSocket URL format (derived from your API URL):

```
wss://api.vexa.ai/ws?api_key=YOUR_API_KEY
```

**Note:** Authentication is done via query parameter since browsers cannot set custom headers for WebSocket connections.

Subscribe to MeetingsSend a subscribe message after connecting```
{
  "action": "subscribe",
  "meetings": [
    {
      "platform": "google_meet",
      "native_id": "abc-defg-hij"
    }
  ]
}
```

KeepaliveSend ping messages to keep the connection alive```
{
  "action": "ping"
}
```

Send a ping every 25 seconds to maintain the connection. The server will respond with a pong message.

## Message Types

- `transcript.mutable` - Live transcript segments that may be updated
- `transcript.finalized` - Final transcript segments
- `meeting.status` - Meeting status updates
- `subscribed` - Confirmation of successful subscription
- `pong` - Response to ping messages
- `error` - Error messages

## Code Examples

JavaScriptPython```
const ws = new WebSocket('wss://api.vexa.ai/ws?api_key=YOUR_API_KEY');

ws.onopen = () => {
  // Subscribe to meeting
  ws.send(JSON.stringify({
    action: 'subscribe',
    meetings: [
      { platform: 'google_meet', native_id: 'abc-defg-hij' }
    ]
  }));

  // Start ping interval
  setInterval(() => {
    ws.send(JSON.stringify({ action: 'ping' }));
  }, 25000);
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'transcript.mutable':
    case 'transcript.finalized':
      // Process transcript segments
      message.payload.segments.forEach(segment => {
        console.log(`[${segment.speaker}] ${segment.text}`);
      });
      break;
    case 'meeting.status':
      console.log('Status:', message.payload.status);
      break;
    case 'subscribed':
      console.log('Subscribed to meetings:', message.meetings);
      break;
  }
};
```


---


## WebSocket API - Subscribe


[API Docs](/docs)Export All DocsRegenerate# Subscribe to Meetings

Learn how to subscribe to meetings to receive real-time transcript updates via WebSocket.

## Subscription Flow

- Connect to the WebSocket endpoint
- Wait for connection to open
- Send a subscribe message with meeting details
- Receive confirmation and start receiving events

Subscribe Message FormatSend this message after connecting```
{
  "action": "subscribe",
  "meetings": [
    {
      "platform": "google_meet",
      "native_id": "abc-defg-hij"
    }
  ]
}
```

You can subscribe to multiple meetings in a single message by including multiple entries in the `meetings` array.

Subscription ConfirmationYou'll receive this after subscribing```
{
  "type": "subscribed",
  "meetings": [
    123,
    124
  ]
}
```

The `meetings` array contains the internal meeting IDs that you're now subscribed to.

## Code Examples

JavaScriptPython```
const ws = new WebSocket('wss://api.vexa.ai/ws?api_key=YOUR_API_KEY');

ws.onopen = () => {
  // Subscribe to a meeting
  ws.send(JSON.stringify({
    action: 'subscribe',
    meetings: [
      { platform: 'google_meet', native_id: 'abc-defg-hij' }
    ]
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'subscribed') {
    console.log('Subscribed to meetings:', message.meetings);
  }
};
```


---


## WebSocket API - Events


[API Docs](/docs)Export All DocsRegenerate# WebSocket Events

Reference for all WebSocket message types and their formats.

transcript.mutableLive transcript segments that may be updated as the AI refines its transcription.

```
{
  "type": "transcript.mutable",
  "meeting": {
    "id": 123
  },
  "payload": {
    "segments": [
      {
        "text": "Hello everyone",
        "speaker": "Alice",
        "language": "en",
        "start": 0,
        "end_time": 2.5,
        "absolute_start_time": "2024-01-01T12:00:00Z",
        "absolute_end_time": "2024-01-01T12:00:02Z",
        "session_uid": "session-123",
        "updated_at": "2024-01-01T12:00:02Z"
      }
    ]
  },
  "ts": "2024-01-01T12:00:02Z"
}
```

transcript.finalizedFinal transcript segments that will not be updated further.

```
{
  "type": "transcript.finalized",
  "meeting": {
    "id": 123
  },
  "payload": {
    "segments": [
      {
        "text": "Hello everyone, welcome to the meeting.",
        "speaker": "Alice",
        "language": "en",
        "start": 0,
        "end_time": 3.2,
        "absolute_start_time": "2024-01-01T12:00:00Z",
        "absolute_end_time": "2024-01-01T12:00:03Z",
        "session_uid": "session-123",
        "updated_at": "2024-01-01T12:00:03Z"
      }
    ]
  },
  "ts": "2024-01-01T12:00:03Z"
}
```

meeting.statusMeeting status updates. Sent when the meeting status changes. This is the primary way to track bot progress from creation to completion.

```
{
  "type": "meeting.status",
  "meeting": {
    "platform": "google_meet",
    "native_id": "abc-defg-hij"
  },
  "payload": {
    "status": "active"
  },
  "ts": "2024-01-01T12:00:05Z"
}
```

#### Status Flow

The bot progresses through these statuses in order:

- `requested` - Bot creation requested, container starting up
- `joining` - Bot is connecting to the meeting platform
- `awaiting_admission` - Bot is in the meeting waiting room, waiting for host to admit
- `active` - Bot is admitted and actively transcribing
- `completed` - Transcription finished (meeting ended or bot stopped)
- `failed` - Bot failed to join or transcription error occurred

#### Status Descriptions

requested:Bot container is being created and initialized. Usually takes 10-30 seconds.joining:Bot is launching the browser and connecting to the meeting platform. Usually takes 5-15 seconds.awaiting_admission:Bot is in the meeting waiting room. The meeting host must admit the bot. This can take any amount of time depending on when the host checks the waiting room.active:Bot is admitted to the meeting and actively transcribing audio. You will receive `transcript.mutable` and `transcript.finalized` events during this state.completed:Transcription has finished. The meeting ended or the bot was stopped. Final transcripts are available via REST API.failed:An error occurred. Common reasons: admission timeout, meeting ended before bot joined, connection failure, or bot was removed.#### Example: Status Progression

```
// 1. Bot created
{
  "type": "meeting.status",
  "payload": { "status": "requested" },
  "ts": "2024-01-01T12:00:00Z"
}

// 2. Bot connecting
{
  "type": "meeting.status",
  "payload": { "status": "joining" },
  "ts": "2024-01-01T12:00:15Z"
}

// 3. Bot in waiting room
{
  "type": "meeting.status",
  "payload": { "status": "awaiting_admission" },
  "ts": "2024-01-01T12:00:30Z"
}

// 4. Bot admitted and transcribing
{
  "type": "meeting.status",
  "payload": { "status": "active" },
  "ts": "2024-01-01T12:01:00Z"
}

// 5. Meeting ended
{
  "type": "meeting.status",
  "payload": { "status": "completed" },
  "ts": "2024-01-01T13:00:00Z"
}
```

subscribedConfirmation message sent after successfully subscribing to meetings.

```
{
  "type": "subscribed",
  "meetings": [
    123,
    124
  ]
}
```

pongResponse to ping messages. Confirms the connection is alive.

```
{
  "type": "pong"
}
```

errorError messages sent when something goes wrong.

```
{
  "type": "error",
  "message": "Invalid meeting ID"
}
```


---


## Cookbook - Start Transcription


[API Docs](/docs)Export All DocsRegenerate# Start Transcription Bot

Learn how to send a transcription bot to a meeting and start receiving transcripts.

## Overview

This cookbook walks you through the complete flow of starting a transcription bot:

- Create a bot to join the meeting
- Monitor bot status as it joins
- Receive live transcripts via WebSocket
- Fetch final transcript after meeting ends

Step 1: Create BotSend a POST request to create a bot. The bot will automatically join the meeting.

`POST /bots````
{
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "bot_name": "My Transcription Bot",
  "language": "en"
}
```

[View full API reference](/docs/rest/bots)Step 2: Monitor StatusThe bot will transition through these statuses:

- `requested` - Bot creation requested
- `joining` - Bot is connecting to the meeting
- `awaiting_admission` - Bot is waiting in the lobby
- `active` - Bot is in the meeting and transcribing
- `completed` - Meeting ended, transcription complete

Poll the meeting status or use WebSocket to receive real-time status updates.

Step 3: Receive Live TranscriptsConnect to the WebSocket API to receive transcript segments in real-time.

[Learn about WebSocket API](/docs/ws)Step 4: Fetch Final TranscriptAfter the meeting ends, fetch the complete transcript via REST API.

[View Transcripts API](/docs/rest/transcripts)


---


## Cookbook - Track Meeting Status


[API Docs](/docs)Export All DocsRegenerate# Track Meeting Status

Learn how to receive real-time meeting status updates via WebSocket to track bot progress from creation to completion.

OverviewThe WebSocket API sends `meeting.status` events whenever a meeting's status changes. This allows you to build real-time status indicators and track bot progress.### Status Flow

requested→joining→awaiting_admission→active→completedThe `failed` status can occur at any point if an error happens.

ImplementationSubscribe to WebSocket events and handle `meeting.status` messagesJavaScriptPythoncurl`JavaScript/TypeScript Example````
// Connect to WebSocket
const ws = new WebSocket('wss://your-api-url/ws?api_key=your-api-key');

ws.onopen = () => {
  // Subscribe to meeting
  ws.send(JSON.stringify({
    action: 'subscribe',
    meetings: [
      { platform: 'google_meet', native_id: 'abc-defg-hij' }
    ]
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'meeting.status') {
    const status = message.payload.status;
    const meeting = message.meeting;

    console.log(`Meeting ${meeting.native_id} status: ${status}`);

    // Handle different statuses
    switch (status) {
      case 'requested':
        console.log('Bot is starting up...');
        break;
      case 'joining':
        console.log('Bot is connecting to meeting...');
        break;
      case 'awaiting_admission':
        console.log('Bot is waiting in the waiting room');
        console.log('Please admit the bot to the meeting');
        break;
      case 'active':
        console.log('Bot is actively transcribing!');
        // Now you'll receive transcript events
        break;
      case 'completed':
        console.log('Transcription completed');
        // Disconnect or handle completion
        ws.close();
        break;
      case 'failed':
        console.error('Bot failed:', message.payload.error);
        ws.close();
        break;
    }

    // Update your UI with the new status
    updateStatusIndicator(meeting.native_id, status);
  }
};
```

Status DetailsUnderstanding each status and what actions to take### requested

The bot container is being created and initialized. This typically takes 10-30 seconds.

**What to show:** "Bot is starting up..." or a loading indicator

### joining

The bot is launching the browser and connecting to the meeting platform. This typically takes 5-15 seconds.

**What to show:** "Connecting to meeting..." or a connection indicator

### awaiting_admission

The bot is in the meeting waiting room. The meeting host must admit the bot. This can take any amount of time depending on when the host checks the waiting room.

**What to show:** "Please admit the bot to the meeting" with instructions to check the waiting room. This is a critical state that requires user action.

### active

The bot is admitted to the meeting and actively transcribing. You will now receive `transcript.mutable` and `transcript.finalized` events.

**What to show:** "Transcribing..." or a recording indicator. Start displaying transcript segments as they arrive.

### completed

The transcription has finished. The meeting ended or the bot was stopped. Final transcripts are available via REST API.

**What to show:** "Transcription completed" and provide a link to view/download the final transcript. You can safely disconnect the WebSocket.

### failed

An error occurred. Common reasons include: admission timeout, meeting ended before bot joined, connection failure, or bot was removed.

**What to show:** Error message with details. Allow the user to retry or create a new bot. You can safely disconnect the WebSocket.

Best Practices
- •**Handle all statuses:** Make sure your UI handles all possible status values, including edge cases like `failed`.
- •**Show user action required:** When status is `awaiting_admission`, clearly indicate that the user needs to admit the bot from the waiting room.
- •**Handle timeouts:** If a bot stays in `requested` or `joining` for too long (e.g., 60+ seconds), show a warning or allow the user to cancel.
- •**Clean up on completion:** When status becomes `completed` or `failed`, you can disconnect the WebSocket to save resources.
- •**Store status history:** Keep a log of status changes with timestamps to help debug issues or show progress to users.

Related Documentation[WebSocket API Overview ](/docs/ws)
[Subscribing to Meetings ](/docs/ws/subscribe)
[WebSocket Events Reference ](/docs/ws/events)
[Receiving Live Transcripts ](/docs/cookbook/live-transcripts)


---


## Cookbook - Get Transcripts


[API Docs](/docs)Export All DocsRegenerate# Get Transcripts

Learn how to fetch transcripts using the REST API and receive live transcript updates via WebSocket.

OverviewThere are two ways to get transcripts: **REST API** for fetching complete transcripts and **WebSocket** for real-time updates.### REST API

Use `GET /transcripts/{platform}/{native_meeting_id}` to fetch all transcript segments for a meeting. Best for:

- Loading historical transcripts
- Bootstraping before WebSocket connection
- One-time transcript retrieval

### WebSocket

Subscribe to meetings and receive `transcript.mutable` and `transcript.finalized` events. Best for:

- Real-time transcript updates during active meetings
- Live transcription display
- Streaming transcript processing

Fetch Transcripts via REST APIGet all transcript segments for a meeting using the REST APIJavaScriptPythoncurl`JavaScript/TypeScript Example````
// Fetch transcripts for a meeting
async function getTranscripts(platform, nativeMeetingId) {
  const response = await fetch(
    `https://your-api-url/transcripts/${platform}/${nativeMeetingId}`,
    {
      headers: {
        'X-API-Key': 'your-api-key',
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch transcripts: ${response.statusText}`);
  }

  const data = await response.json();

  // data.segments contains all transcript segments
  console.log(`Found ${data.segments.length} transcript segments`);

  // Each segment has:
  // - text: The transcribed text
  // - speaker: Speaker name
  // - start/end: Relative timestamps (seconds from meeting start)
  // - absolute_start_time/absolute_end_time: ISO timestamps
  // - language: Detected language code
  // - created_at: When the segment was created

  return data.segments;
}

// Usage
const segments = await getTranscripts('google_meet', 'abc-defg-hij');

// Display transcripts
segments.forEach(segment => {
  console.log(`[${segment.speaker}] ${segment.text}`);
});
```

Receive Live Transcripts via WebSocketSubscribe to meetings and receive transcript events in real-timeFor detailed WebSocket implementation, see the [Live Transcripts cookbook](/docs/cookbook/live-transcripts).

#### Quick Example

```
// Connect and subscribe
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
      console.log(`[LIVE] [${segment.speaker}] ${segment.text}`);
    });
  } else if (message.type === 'transcript.finalized') {
    // Final segments that won't change
    message.payload.segments.forEach(segment => {
      console.log(`[FINAL] [${segment.speaker}] ${segment.text}`);
    });
  }
};
```

Best Practice: Bootstrap PatternCombine REST and WebSocket for the best experienceFor active meetings, use a bootstrap pattern:

- **Bootstrap:** Fetch existing transcripts via REST API first
- **Connect:** Establish WebSocket connection and subscribe
- **Merge:** Use `absolute_start_time` as unique ID to merge REST and WebSocket segments
- **Update:** Replace mutable segments with finalized ones as they arrive

#### Example Implementation

```
// 1. Bootstrap from REST
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
};
```

Related Documentation[Transcripts REST API Reference ](/docs/rest/transcripts)
[Live Transcripts via WebSocket ](/docs/cookbook/live-transcripts)
[WebSocket Events Reference ](/docs/ws/events)


---


## Cookbook - Live Transcripts


[API Docs](/docs)Export All DocsRegenerate# Live Transcripts

Learn how to receive real-time transcript updates as meetings progress.

## Overview

To receive live transcripts, you need to:

- Connect to the WebSocket endpoint
- Subscribe to the meeting
- Handle transcript events as they arrive
- Process mutable and finalized segments

Step 1: Connect and SubscribeFirst, connect to the WebSocket and subscribe to your meeting.

[Learn about subscribing](/docs/ws/subscribe)Step 2: Handle Transcript EventsYou'll receive two types of transcript events:

- `transcript.mutable` - Live segments that may be updated
- `transcript.finalized` - Final segments that won't change

[View event reference](/docs/ws/events)Step 3: DeduplicationSince mutable segments can be updated, use `absolute_start_time` as a unique identifier and `updated_at` to determine which version is newer.

Keep the segment with the latest `updated_at` timestamp.

Step 4: Bootstrap from RESTFor best results, fetch existing transcripts via REST API first, then connect to WebSocket for live updates. This ensures you have all historical segments before receiving new ones.

[View Transcripts API](/docs/rest/transcripts)


---


## Cookbook - Share Transcript URL


[API Docs](/docs)Export All DocsRegenerate# Share Transcript URL

Learn how to create shareable, public URLs for transcripts that can be used with AI tools like ChatGPT and Perplexity.

OverviewThe transcript share API creates temporary, public URLs that allow AI tools to read transcripts directly from a URL. This is more efficient than copying and pasting large transcripts.### Use Cases

- Share transcripts with ChatGPT using "Read from URL" feature
- Share transcripts with Perplexity for analysis
- Embed transcripts in documentation or reports
- Create temporary access links for team members

### Key Features

- **Public access:** No authentication required to access the URL
- **Temporary:** Links expire after a set time (default: 1 hour)
- **Secure:** Share IDs are randomly generated and hard to guess
- **Text format:** Transcripts are served as plain text (.txt) for easy reading

Create Share URLCreate a shareable transcript URL using the REST APIJavaScriptPythoncurl`JavaScript/TypeScript Example````
// Create a share URL for a transcript
async function createTranscriptShare(platform, nativeMeetingId, meetingId, ttlSeconds) {
  const params = new URLSearchParams();
  if (meetingId) params.set('meeting_id', meetingId);
  if (ttlSeconds) params.set('ttl_seconds', String(ttlSeconds));
  const queryString = params.toString();

  const response = await fetch(
    `https://your-api-url/transcripts/${platform}/${nativeMeetingId}/share${queryString ? `?${queryString}` : ''}`,
    {
      method: 'POST',
      headers: {
        'X-API-Key': 'your-api-key',
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create share URL: ${response.statusText}`);
  }

  const share = await response.json();

  // share contains:
  // - share_id: Unique identifier for the share
  // - url: Full public URL to access the transcript
  // - expires_at: ISO timestamp when the link expires
  // - expires_in_seconds: Time until expiration

  console.log(`Share URL created: ${share.url}`);
  console.log(`Expires at: ${share.expires_at}`);

  return share;
}

// Usage
const share = await createTranscriptShare(
  'google_meet',
  'abc-defg-hij',
  123, // optional meeting_id
  7200 // optional: 2 hours TTL (default is 3600 = 1 hour)
);

// The share.url can be used directly:
// https://api.vexa.ai/public/transcripts/abc123def456.txt
```

Using Share URLs with AI ToolsHow to integrate share URLs with ChatGPT, Perplexity, and other AI tools### ChatGPT

ChatGPT can read content from URLs. Create a prompt that includes the share URL:

```
// Create share URL
const share = await createTranscriptShare('google_meet', 'abc-defg-hij');

// Build ChatGPT URL with prompt
const prompt = `Please read the meeting transcript from this URL and summarize the key points: ${share.url}`;
const chatgptUrl = `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`;

// Open in new window
window.open(chatgptUrl, '_blank', 'noopener,noreferrer');
```

### Perplexity

Perplexity can also read from URLs. Use a similar approach:

```
// Create share URL
const share = await createTranscriptShare('google_meet', 'abc-defg-hij');

// Build Perplexity URL with prompt
const prompt = `Please analyze the meeting transcript from this URL: ${share.url}`;
const perplexityUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;

// Open in new window
window.open(perplexityUrl, '_blank', 'noopener,noreferrer');
```

### Custom Prompts

You can customize the prompt to ask specific questions. Use `{url}` as a placeholder that will be replaced with the actual share URL:

```
// Example custom prompts
const prompts = {
  summary: `Read the meeting transcript from {url} and provide a concise summary with action items.`,
  qa: `Read the meeting transcript from {url} and answer: What were the main decisions made?`,
  analysis: `Analyze the meeting transcript from {url} and identify key themes and discussion points.`
};

// Replace {url} placeholder
const share = await createTranscriptShare('google_meet', 'abc-defg-hij');
const prompt = prompts.summary.replace(/{url}/g, share.url);
const chatgptUrl = `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`;
```

Complete ExampleFull implementation for sharing transcripts with AI tools```
async function shareTranscriptWithAI(platform, nativeMeetingId, provider, customPrompt) {
  try {
    // 1. Create share URL
    const share = await createTranscriptShare(platform, nativeMeetingId);

    // 2. Build prompt with URL
    const defaultPrompt = `Please read and analyze the meeting transcript from this URL: {url}`;
    const prompt = (customPrompt || defaultPrompt).replace(/{url}/g, share.url);

    // 3. Build provider URL
    let providerUrl;
    if (provider === 'chatgpt') {
      providerUrl = `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`;
    } else if (provider === 'perplexity') {
      providerUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // 4. Open in new window
    window.open(providerUrl, '_blank', 'noopener,noreferrer');

    return {
      success: true,
      shareUrl: share.url,
      expiresAt: share.expires_at
    };
  } catch (error) {
    console.error('Failed to share transcript:', error);
    throw error;
  }
}

// Usage
await shareTranscriptWithAI(
  'google_meet',
  'abc-defg-hij',
  'chatgpt',
  'Read {url} and summarize the key action items.'
);
```

Best Practices
- •**Set appropriate TTL:** Use longer TTL (e.g., 7200 seconds = 2 hours) if you need the link to stay active longer, but remember links are public.
- •**Handle expiration:** Check `expires_at` before sharing and warn users if the link is about to expire.
- •**Custom prompts:** Create specific prompts for different use cases (summarization, Q&A, analysis) to get better results from AI tools.
- •**Public base URL:** If your API is behind a private network, set `NEXT_PUBLIC_TRANSCRIPT_SHARE_BASE_URL` environment variable to point to a public URL where the share links will be accessible.
- •**Error handling:** Always have a fallback (e.g., clipboard copy) in case share URL creation fails.

Response Format### Share Response

```
{
  "share_id": "abc123def456",
  "url": "https://api.vexa.ai/public/transcripts/abc123def456.txt",
  "expires_at": "2024-01-01T13:00:00Z",
  "expires_in_seconds": 3600
}
```

### Transcript Content

When you access the share URL, you'll receive the transcript as plain text:

```
Meeting Transcript

Title: Team Standup
Date: 2024-01-01 12:00:00

[00:00:00] Alice: Hello everyone, welcome to today's meeting.
[00:00:05] Bob: Thanks for joining. Let's start with updates.
[00:00:10] Alice: I've completed the feature implementation.
[00:00:15] Bob: Great! What about the testing?
...
```

Related Documentation[Create Transcript Share Link API Reference ](/docs/rest/transcripts#create-transcript-share-link)
[Get Transcripts API Reference ](/docs/rest/transcripts#get-transcripts)
[Get Transcripts Cookbook ](/docs/cookbook/get-transcripts)


---


## Cookbook - Rename Meeting


[API Docs](/docs)Export All DocsRegenerate# Rename Meeting

Learn how to update meeting name and other metadata using the REST API.

OverviewUse the `PATCH /meetings/{platform}/{native_meeting_id}` endpoint to update meeting metadata including name, notes, participants, and languages.You can update:

- `name` - Meeting title/name
- `notes` - Meeting notes
- `participants` - List of participant names
- `languages` - List of language codes

All fields are optional - only provided fields will be updated.

ImplementationUpdate meeting name and other metadataJavaScriptPythoncurl`JavaScript/TypeScript Example````
// Rename a meeting
async function renameMeeting(platform, nativeMeetingId, newName) {
  const response = await fetch(
    `https://your-api-url/meetings/${platform}/${nativeMeetingId}`,
    {
      method: 'PATCH',
      headers: {
        'X-API-Key': 'your-api-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          name: newName
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to rename meeting: ${response.statusText}`);
  }

  const updatedMeeting = await response.json();
  console.log(`Meeting renamed to: ${updatedMeeting.data.name}`);

  return updatedMeeting;
}

// Usage
await renameMeeting('google_meet', 'abc-defg-hij', 'Team Standup - Q1 Planning');

// Update multiple fields at once
async function updateMeetingMetadata(platform, nativeMeetingId, updates) {
  const response = await fetch(
    `https://your-api-url/meetings/${platform}/${nativeMeetingId}`,
    {
      method: 'PATCH',
      headers: {
        'X-API-Key': 'your-api-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          name: updates.name,
          notes: updates.notes,
          participants: updates.participants,
          languages: updates.languages
        }
      })
    }
  );

  return await response.json();
}

// Usage
await updateMeetingMetadata('google_meet', 'abc-defg-hij', {
  name: 'Weekly Team Sync',
  notes: 'Discussion about Q1 goals',
  participants: ['Alice', 'Bob', 'Charlie'],
  languages: ['en']
});
```

Important Notes
- •**Partial updates:** Only fields you provide in the `data` object will be updated. Other fields remain unchanged.
- •**Meeting identification:** Use `platform` and `native_meeting_id` to identify the meeting, not the internal database ID.
- •**Arrays:** When updating `participants` or `languages`, provide the complete array - it will replace the existing array.
- •**Empty values:** To clear a field, set it to `null` or an empty string (for strings) or empty array (for arrays).

Related Documentation[Update Meeting Data API Reference ](/docs/rest/meetings#update-meeting-data)


---


## Cookbook - Get Status History


[API Docs](/docs)Export All DocsRegenerate# Get Status History

Learn how to retrieve the complete history of status changes for a meeting, showing when and why the bot transitioned between states.

OverviewStatus history is included in the meeting data when you fetch a meeting via the REST API. It shows all status transitions with timestamps, sources, and reasons.### Status History Structure

Each status transition includes:

- `from` - Previous status
- `to` - New status
- `timestamp` - When the transition occurred (ISO 8601)
- `source` - What triggered the change (e.g., "bot_callback", "user_api")
- `reason` - Optional reason for the transition
- `completion_reason` - Reason for completion (if status is "completed")

### Where to Find It

Status history is available in the `data.status_transition` field when you fetch a meeting via:

- `GET /meetings` - List all meetings
- `GET /transcripts/{platform}/{native_meeting_id}` - Get meeting with transcripts

ImplementationFetch a meeting and access its status historyJavaScriptPythoncurl`JavaScript/TypeScript Example````
// Get meeting with status history
async function getMeetingWithStatusHistory(platform, nativeMeetingId) {
  // Option 1: Get via transcripts endpoint (includes full meeting data)
  const response = await fetch(
    `https://your-api-url/transcripts/${platform}/${nativeMeetingId}`,
    {
      headers: {
        'X-API-Key': 'your-api-key',
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch meeting: ${response.statusText}`);
  }

  const data = await response.json();

  // Status history is in data.data.status_transition
  const statusHistory = data.data?.status_transition || [];

  console.log(`Found ${statusHistory.length} status transitions`);

  // Display status history
  statusHistory.forEach((transition, index) => {
    console.log(`${index + 1}. ${transition.from} → ${transition.to}`);
    console.log(`   Time: ${transition.timestamp}`);
    console.log(`   Source: ${transition.source || 'unknown'}`);
    if (transition.reason) {
      console.log(`   Reason: ${transition.reason}`);
    }
  });

  return statusHistory;
}

// Usage
const history = await getMeetingWithStatusHistory('google_meet', 'abc-defg-hij');

// Or get from meetings list
async function getAllMeetingsWithHistory() {
  const response = await fetch('https://your-api-url/meetings', {
    headers: {
      'X-API-Key': 'your-api-key',
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  // Each meeting in data.meetings has status_transition
  data.meetings.forEach(meeting => {
    const history = meeting.data?.status_transition || [];
    console.log(`Meeting ${meeting.native_meeting_id} has ${history.length} status transitions`);
  });

  return data.meetings;
}
```

Status Transition ExampleExample status history showing a typical bot lifecycle```
[
  {
    "from": null,
    "to": "requested",
    "timestamp": "2024-01-01T12:00:00Z",
    "source": "user_api",
    "reason": null
  },
  {
    "from": "requested",
    "to": "joining",
    "timestamp": "2024-01-01T12:00:15Z",
    "source": "bot_callback",
    "reason": null
  },
  {
    "from": "joining",
    "to": "awaiting_admission",
    "timestamp": "2024-01-01T12:00:30Z",
    "source": "bot_callback",
    "reason": null
  },
  {
    "from": "awaiting_admission",
    "to": "active",
    "timestamp": "2024-01-01T12:01:00Z",
    "source": "bot_callback",
    "reason": null
  },
  {
    "from": "active",
    "to": "completed",
    "timestamp": "2024-01-01T13:00:00Z",
    "source": "bot_callback",
    "completion_reason": "meeting_ended"
  }
]
```

This shows a complete bot lifecycle:

- Bot created via user API (`requested`)
- Bot container started and connecting (`joining`)
- Bot in waiting room (`awaiting_admission`)
- Bot admitted and transcribing (`active`)
- Meeting ended (`completed`)

Use Cases
- •**Debugging:** Understand why a bot got stuck or failed by examining the status transitions and their timestamps.
- •**Analytics:** Track how long bots spend in each state to identify bottlenecks (e.g., long waiting room times).
- •**UI Display:** Show a timeline of status changes to users, similar to the dashboard's Status History component.
- •**Monitoring:** Alert when bots stay in certain states too long (e.g., `awaiting_admission` for more than 5 minutes).

Related Documentation[Get Transcripts API Reference ](/docs/rest/transcripts#get-transcripts)
[List Meetings API Reference ](/docs/rest/meetings#list-meetings)
[Track Meeting Status via WebSocket ](/docs/cookbook/track-meeting-status)


---


## Cookbook - Stop Bot


[API Docs](/docs)Export All DocsRegenerate# Stop Bot

Learn how to stop an active transcription bot and disconnect it from a meeting.

## Overview

To stop a bot, send a DELETE request to the bot endpoint. The bot will disconnect from the meeting and the meeting status will change to `completed`.

Stop Bot Request`DELETE /bots/{platform}/{native_meeting_id}`Replace `platform` with `google_meet` or `teams`, and `native_meeting_id` with your meeting ID.

[View full API reference](/docs/rest/bots)After StoppingAfter stopping a bot:

- The bot will disconnect from the meeting
- The meeting status will change to `completed`
- All transcripts remain available via REST API
- WebSocket will send a `meeting.status` event with status `completed`

Fetch Final TranscriptAfter stopping, fetch the complete transcript via REST API.

[View Transcripts API](/docs/rest/transcripts)


---


## Admin API - Users


[API Docs](/docs)Export All DocsRegenerate# Admin Users API

Manage users and their API tokens. Requires Admin API key authentication.

GET`/admin/users`# List Users

Get a list of all users in the system.

**Dashboard Proxy:** The dashboard calls `/api/admin/users` which forwards to this endpoint.AuthenticationRequires **Admin API Key** in `X-Admin-API-Key` header.

Query Parameters`skip`skipintegerNumber of users to skip (pagination)

`limit`limitintegerMaximum number of users to return

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X GET "https://api.vexa.ai/admin/users?skip=your_skip&limit=your_limit" \
  -H "X-Admin-API-Key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json"
```

Response```
[
  {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "max_concurrent_bots": 3,
    "created_at": "2024-01-01T12:00:00Z"
  }
]
```

GET`/admin/users/{id}`# Get User

Get detailed information about a specific user, including their API tokens.

**Dashboard Proxy:** The dashboard calls `/api/admin/users/{id}` which forwards to this endpoint.AuthenticationRequires **Admin API Key** in `X-Admin-API-Key` header.

Path Parameters`id`idstringRequiredThe user ID

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X GET "https://api.vexa.ai/admin/users/{id}" \
  -H "X-Admin-API-Key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json"
```

Response```
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "max_concurrent_bots": 3,
  "api_tokens": [
    {
      "id": "token-123",
      "token": "***",
      "user_id": "user-123",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "created_at": "2024-01-01T12:00:00Z"
}
```

POST`/admin/users`# Create User

Create a new user in the system.

**Dashboard Proxy:** The dashboard calls `/api/admin/users` which forwards to this endpoint.AuthenticationRequires **Admin API Key** in `X-Admin-API-Key` header.

Request Body```
{
  "email": "user@example.com",
  "name": "John Doe",
  "max_concurrent_bots": 3
}
```

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X POST "https://api.vexa.ai/admin/users" \
  -H "X-Admin-API-Key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Content-Type: application/json" \
  -d '{
  "email": "user@example.com",
  "name": "John Doe",
  "max_concurrent_bots": 3
}'
```

Response```
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "max_concurrent_bots": 3,
  "created_at": "2024-01-01T12:00:00Z"
}
```

POST`/admin/users/{id}/tokens`# Create API Token

Create a new API token for a user. The token value is only shown once at creation.

**Dashboard Proxy:** The dashboard calls `/api/admin/users/{id}/tokens` which forwards to this endpoint.AuthenticationRequires **Admin API Key** in `X-Admin-API-Key` header.

Path Parameters`id`idstringRequiredThe user ID

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X POST "https://api.vexa.ai/admin/users/{id}/tokens" \
  -H "X-Admin-API-Key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json"
```

Response```
{
  "id": "token-123",
  "token": "vex_abc123def456...",
  "user_id": "user-123",
  "created_at": "2024-01-01T12:00:00Z"
}
```

Notes
- ⚠️ IMPORTANT: Save the token immediately. It cannot be retrieved later.
- Each user can have multiple API tokens
- Tokens do not expire but can be revoked


---


## Admin API - Tokens


[API Docs](/docs)Export All DocsRegenerate# Admin Tokens API

Manage API tokens for users. Requires Admin API key authentication.

DELETE`/admin/tokens/{token_id}`# Revoke Token

Revoke an API token, preventing it from being used for authentication.

**Dashboard Proxy:** The dashboard calls `/api/admin/tokens/{token_id}` which forwards to this endpoint.AuthenticationRequires **Admin API Key** in `X-Admin-API-Key` header.

Path Parameters`token_id`token_idstringRequiredThe token ID to revoke

Code ExamplescURLJavaScriptPythonGoRubyJavaC#```
curl -X DELETE "https://api.vexa.ai/admin/tokens/{token_id}" \
  -H "X-Admin-API-Key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json"
```

Notes
- Revoked tokens cannot be restored
- Users will need to create a new token if they lose access


---

