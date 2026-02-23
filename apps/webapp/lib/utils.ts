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
// across localhost, green staging, and production without env var at build time
export function getDashboardUrl(): string {
  if (process.env.NEXT_PUBLIC_DASHBOARD_URL) {
    return process.env.NEXT_PUBLIC_DASHBOARD_URL;
  }
  if (typeof window === "undefined") return "http://localhost:3001";
  const host = window.location.hostname;
  if (host === "green.vexa.ai") return "https://dashboard-green.vexa.ai";
  if (host === "vexa.ai") return "https://app.vexa.ai";
  return "http://localhost:3001";
}

// Function to generate absolute URLs
export const absoluteUrl = (path: string) => {
  // Use NEXT_PUBLIC_APP_URL if set, otherwise fall back to production URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vexa.ai';
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};
