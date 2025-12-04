import { GitHubContentService } from '@/lib/github';
import { NotificationBanner, parseNotifications } from '@/components/ui/notification-banner';

/**
 * Server component that fetches and displays system notifications from GitHub
 * 
 * Reads notification.txt from the blog_articles repo and displays it at the top of the dashboard
 */
export async function DashboardNotifications() {
  const githubService = new GitHubContentService();
  
  try {
    const notificationContent = await githubService.getNotifications();
    const notifications = parseNotifications(notificationContent);
    
    return <NotificationBanner notifications={notifications} />;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Silently fail - don't show errors to users if notifications can't be fetched
    return null;
  }
}



