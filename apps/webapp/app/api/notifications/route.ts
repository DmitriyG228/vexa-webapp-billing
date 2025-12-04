import { NextResponse } from 'next/server';
import { GitHubContentService } from '@/lib/github';
import { parseNotifications } from '@/components/ui/notification-banner';

export const dynamic = 'force-dynamic'; // Disable caching for notifications
export const revalidate = 300; // Revalidate every 5 minutes

/**
 * API route to fetch system notifications from GitHub
 * 
 * GET /api/notifications
 * Returns parsed notifications from notification.txt in the blog_articles repo
 */
export async function GET() {
  try {
    const githubService = new GitHubContentService();
    const notificationContent = await githubService.getNotifications();
    const notifications = parseNotifications(notificationContent);
    
    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    // Return empty notifications instead of error to avoid breaking the UI
    return NextResponse.json({
      success: true,
      notifications: [],
    });
  }
}


