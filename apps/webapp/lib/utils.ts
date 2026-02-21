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

// Function to generate absolute URLs
export const absoluteUrl = (path: string) => {
  // Use NEXT_PUBLIC_APP_URL if set, otherwise fall back to production URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vexa.ai';
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};
