export type MeetingPlatform = "google_meet" | "teams" | "zoom";

export interface ParsedMeetingInput {
  platform: MeetingPlatform;
  meetingId: string;
  passcode?: string;
}

export function parseMeetingInput(input: string): ParsedMeetingInput | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Google Meet URL: https://meet.google.com/abc-defg-hij
  const googleMeetUrlRegex = /(?:https?:\/\/)?meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/i;
  const googleMeetMatch = trimmed.match(googleMeetUrlRegex);
  if (googleMeetMatch) {
    return { platform: "google_meet", meetingId: googleMeetMatch[1].toLowerCase() };
  }

  // Direct Google Meet code: abc-defg-hij
  if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(trimmed)) {
    return { platform: "google_meet", meetingId: trimmed.toLowerCase() };
  }

  // Microsoft Teams URL
  const teamsUrlRegex = /(?:https?:\/\/)?(?:teams\.microsoft\.com|teams\.live\.com)\/(?:l\/meetup-join|meet)\/([^\s?#]+)/i;
  const teamsMatch = trimmed.match(teamsUrlRegex);
  if (teamsMatch) {
    const decodedPath = decodeURIComponent(teamsMatch[1]);
    const meetingId = decodedPath.split("/")[0] || decodedPath;
    const passcodeMatch = trimmed.match(/[?&]p=([^&]+)/i);
    const passcode = passcodeMatch ? decodeURIComponent(passcodeMatch[1]) : undefined;
    return { platform: "teams", meetingId, passcode };
  }

  // Zoom URL
  const zoomUrlRegex = /(?:https?:\/\/)?(?:[\w-]+\.)?zoom\.us\/j\/(\d+)/i;
  const zoomMatch = trimmed.match(zoomUrlRegex);
  if (zoomMatch) {
    const passcodeMatch = trimmed.match(/[?&]pwd=([^&]+)/i);
    const passcode = passcodeMatch ? decodeURIComponent(passcodeMatch[1]) : undefined;
    return { platform: "zoom", meetingId: zoomMatch[1], passcode };
  }

  // Zoom meeting ID (9-11 digits)
  if (/^\d{9,11}$/.test(trimmed)) {
    return { platform: "zoom", meetingId: trimmed };
  }

  // Teams meeting ID (longer numeric strings)
  if (/^\d{12,}$/.test(trimmed)) {
    return { platform: "teams", meetingId: trimmed };
  }

  // Generic Teams detection
  if (trimmed.toLowerCase().includes("teams.microsoft.com") || trimmed.toLowerCase().includes("teams.live.com")) {
    const genericId = trimmed.replace(/^https?:\/\//, "").split("/").pop()?.split("?")[0];
    if (genericId) {
      const passcodeMatch = trimmed.match(/[?&]p=([^&]+)/i);
      const passcode = passcodeMatch ? decodeURIComponent(passcodeMatch[1]) : undefined;
      return { platform: "teams", meetingId: genericId, passcode };
    }
  }

  return null;
}
