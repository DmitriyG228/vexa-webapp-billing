# Dashboard Notification System

## Overview

The notification system allows you to display important system messages to users on the dashboard by simply editing a `notification.txt` file in the GitHub blog_articles repository.

## How It Works

1. **Source**: Notifications are read from `notification.txt` in the `blog_articles` GitHub repository
2. **Location**: The file should be placed in the same directory as your blog posts (controlled by `GITHUB_REPO_PATH` env variable)
3. **Format**: Simple text file with date/time stamps and messages
4. **Display**: Notifications appear at the top of the `/dashboard` page
5. **Styling**: Automatically styled based on content (error, warning, or info)
6. **Refresh**: Notifications are refreshed together with blog content using the same trigger

## File Format

The `notification.txt` file uses a simple format:

```
[date time] message
[date time] !message  (! indicates error/important)
```

### Example

```
[2025-12-03 14:30 UTC] !Service is down, downtime 3 hours
[2025-12-12 03:00 UTC] Planned maintenance scheduled
```

## Notification Types

The system determines the notification type based on the `!` prefix:

- **Error (Red)**: Messages starting with `!` (the `!` is removed from display)
- **Info (Blue)**: All other messages

### Notes
- Lines starting with `#` are treated as comments and ignored
- The `!` must be the first character after the closing bracket `]`
- Whitespace before the `!` is allowed: `[date] !message` works
- The `!` is automatically removed when displaying the message

## Usage

### Adding a Notification

1. Navigate to your `blog_articles` repository
2. Edit or create `notification.txt` in the appropriate directory (e.g., `dev/notification.txt`)
3. Add your notification in the format: `[date time] message`
4. Commit and push the changes
5. Notifications will appear on the dashboard within 5 minutes (API cache), or immediately if you use the refresh button

### Removing Notifications

Simply delete the lines from `notification.txt` or delete the entire file.

### Manual Refresh

For admins, there are two refresh buttons (visible only when logged in):
- **Blog Page**: Refresh button in top-right corner of `/blog` refreshes both blog and notifications
- **Dashboard Page**: Refresh button in top-right corner of `/dashboard` refreshes notifications

Both buttons trigger the same refresh mechanism and update all content simultaneously.

### Examples

**Service Outage (Error):**
```
[2025-12-03 14:30 UTC] !Service is down, downtime 3 hours
```
→ Displays as red error banner (without the !)

**Critical Issue (Error):**
```
[2025-12-05 09:00 UTC] !API unavailable, investigating
```
→ Displays as red error banner (without the !)

**General Information:**
```
[2025-12-12 03:00 UTC] Planned maintenance from 03:00-05:00 UTC
[2025-12-15 10:00 UTC] New features released - check the blog for details
```
→ Displays as blue info banner

**With Comments:**
```
# This is a comment and will be ignored
[2025-12-20 10:00 UTC] !Critical: Database migration in progress
[2025-12-20 10:00 UTC] All systems operational
```

## Technical Details

### Components

- **GitHubContentService**: Fetches `notification.txt` from GitHub
  - Location: `apps/webapp/lib/github.ts`
  - Method: `getNotifications()`

- **NotificationBanner**: Displays notifications with appropriate styling
  - Location: `apps/webapp/components/ui/notification-banner.tsx`
  - Exports: `NotificationBanner`, `parseNotifications()`

- **NotificationRefreshButton**: Admin-only button to manually refresh notifications
  - Location: `apps/webapp/components/dashboard/notification-refresh-button.tsx`
  - Calls the same `/api/blog-refresh` endpoint used by the blog

- **API Route**: `/api/notifications`
  - Location: `apps/webapp/app/api/notifications/route.ts`
  - Cache: 5 minutes (300 seconds)

- **Refresh API**: `/api/blog-refresh`
  - Location: `apps/webapp/app/api/blog-refresh/route.ts`
  - Revalidates both blog pages and dashboard (notifications)
  - Triggered by refresh buttons on blog and dashboard pages

- **Dashboard Integration**: 
  - Location: `apps/webapp/app/dashboard/page.tsx`
  - Fetches notifications on page load
  - Includes refresh button for admins

### Environment Variables

The notification system uses the same GitHub configuration as the blog:

- `GITHUB_TOKEN`: GitHub personal access token
- `GITHUB_REPO_PATH`: Path within the repository (e.g., "dev")

### Caching and Refresh

- API responses are cached for 5 minutes
- GitHub API responses are cached for 1 hour
- **Manual Refresh**: Use the refresh button on the blog or dashboard page (admin only)
- **Automatic**: Wait for cache expiration (5 minutes)
- The refresh button revalidates both blog content and notifications simultaneously

## Testing

To test the notification system:

1. Create or edit `notification.txt` in your blog_articles repo
2. Add a test notification
3. Visit `/dashboard` (must be logged in)
4. Notifications should appear at the top of the page

## Troubleshooting

**Notifications not appearing:**
- Check that `notification.txt` exists in the correct directory
- Verify `GITHUB_REPO_PATH` environment variable
- Check GitHub token has read access to the repository
- Wait for cache to expire (5 minutes)
- Check browser console for errors

**Wrong styling:**
- Review the keywords in your message
- Keywords are case-insensitive
- Error: "down", "outage", "unavailable"
- Warning: "maintenance", "scheduled", "planned"
- Info: everything else

## Security

- Only reads from GitHub (no write access needed)
- No user input accepted
- Notifications are parsed server-side
- Safe HTML rendering (no XSS risk)

