/**
 * Centralized content data for landing pages.
 * This file contains only data (no JSX) to improve compilation performance.
 */

import { VideoFeatureBullet } from "@/components/marketing/video-feature";

export interface PromoCardData {
  iconType: 'n8n' | 'mcp' | 'zap';
  title: string;
  description: string;
  flow: Array<{ 
    type: 'image' | 'icon'; 
    src?: string; 
    iconType?: 'n8n' | 'mcp' | 'claude' | 'zap';
    alt?: string;
  }>;
  cta: {
    href: string;
    label: string;
  };
}

// Shared promo cards data (data only, no JSX)
export const defaultPromoCardsData: PromoCardData[] = [
  {
    iconType: 'n8n',
    title: "Google Meet → N8N",
    description: "Meeting transcripts in n8n flow",
    flow: [
      { type: 'image', src: '/google-meet-logo.png', alt: 'Google Meet video conferencing platform logo' },
      { type: 'image', src: '/logodark.svg', alt: 'Vexa meeting transcription API logo' },
      { type: 'icon', iconType: 'n8n' },
    ],
    cta: {
      href: "/blog/google-meet-transcription-n8n-workflow",
      label: "Explore N8N nodes",
    },
  },
  {
    iconType: 'mcp',
    title: "Google Meet → MCP",
    description: "Claude is now your real-time meeting assistant",
    flow: [
      { type: 'image', src: '/google-meet-logo.png', alt: 'Google Meet video conferencing platform logo' },
      { type: 'image', src: '/logodark.svg', alt: 'Vexa meeting transcription API logo' },
      { type: 'icon', iconType: 'mcp' },
      { type: 'icon', iconType: 'claude' },
    ],
    cta: {
      href: "/blog/claude-desktop-vexa-mcp-google-meet-transcripts",
      label: "Connect Claude to MCP",
    },
  },
  {
    iconType: 'zap',
    title: "Google Meet → API",
    description: "Simply POST bot, then GET transcript",
    flow: [
      { type: 'image', src: '/google-meet-logo.png', alt: 'Google Meet video conferencing platform logo' },
      { type: 'image', src: '/logodark.svg', alt: 'Vexa meeting transcription API logo' },
      { type: 'icon', iconType: 'zap' },
    ],
    cta: {
      href: "/get-started",
      label: "Test the API",
    },
  },
];

// MCP video feature data
export const mcpVideoFeature = {
  eyebrow: "MCP-ready",
  title: "MCP server included",
  description: "Use MCP so agents can start/stop meeting bots and fetch or stream transcripts on demand. Works alongside your existing agent stack.",
  bullets: [
    { strong: "Send bots", rest: "via MCP tool calls" },
    { strong: "Stream or fetch transcripts", rest: "as needed" },
    { strong: "Claude Desktop today", rest: "and other MCP-capable tools" },
  ] as VideoFeatureBullet[],
  primaryCta: {
    href: "/blog/claude-desktop-vexa-mcp-google-meet-transcripts",
    label: "MCP Guide",
  },
  secondaryCta: {
    href: "/blog/claude-desktop-vexa-mcp-google-meet-transcripts#example",
    label: "Example Config",
  },
  videoId: "Gv-GVrIr_y8",
  videoTitle: "Vexa MCP Integration Demo",
};

