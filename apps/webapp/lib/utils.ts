import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) {
    return 'Date not available';
  }
  
  try {
    const date = parseISO(dateString); // Parse the ISO string (like 'YYYY-MM-DD')
    return format(date, 'LLLL d, yyyy'); // Format as "Month day, year"
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // Return original string as fallback
  }
}

// Dashboard URL — derive from current hostname at runtime so it works
// across localhost, staging, and production without any build-time config.
// NEXT_PUBLIC_* vars are baked by webpack at build time in client components,
// so we only use the env var on the server where it's read at runtime.
export function getDashboardUrl(): string {
  if (typeof window === "undefined") {
    // Server-side: env var is read at runtime, safe to use
    return process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://app.vexa.ai";
  }
  // Client-side: derive from hostname (env vars are baked at build time, unreliable)
  const host = window.location.hostname;
  if (host.endsWith(".staging.vexa.ai")) return "https://dashboard.staging.vexa.ai";
  if (host.endsWith(".dev.vexa.ai")) return "https://dashboard.dev.vexa.ai";
  if (host === "green.vexa.ai") return "https://dashboard-green.vexa.ai";
  if (host === "vexa.ai") return "https://app.vexa.ai";
  if (host === "localhost") return "http://localhost:3001";
  return "https://app.vexa.ai";
}

// Function to generate absolute URLs
export const absoluteUrl = (path: string) => {
  // Use NEXT_PUBLIC_APP_URL if set, otherwise fall back to production URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vexa.ai';
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};
