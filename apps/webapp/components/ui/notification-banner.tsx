import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info, AlertTriangle } from "lucide-react"

export interface NotificationItem {
  date: string
  message: string
  type: 'info' | 'warning' | 'error'
}

interface NotificationBannerProps {
  notifications: NotificationItem[]
}

export function NotificationBanner({ notifications }: NotificationBannerProps) {
  if (!notifications || notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 mb-6">
      {notifications.map((notification, index) => {
        const Icon = notification.type === 'error' 
          ? AlertCircle 
          : notification.type === 'warning' 
          ? AlertTriangle 
          : Info

        const variant = notification.type === 'error' 
          ? 'destructive' 
          : notification.type === 'warning'
          ? 'default'
          : 'default'

        // Dark mode friendly colors
        const bgColor = notification.type === 'error'
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50'
          : notification.type === 'warning'
          ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/50'
          : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50'

        const textColor = notification.type === 'error'
          ? 'text-red-800 dark:text-red-200'
          : notification.type === 'warning'
          ? 'text-yellow-800 dark:text-yellow-200'
          : 'text-blue-800 dark:text-blue-200'

        const iconColor = notification.type === 'error'
          ? 'text-red-600 dark:text-red-400'
          : notification.type === 'warning'
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-blue-600 dark:text-blue-400'

        return (
          <Alert 
            key={`notification-${index}`} 
            variant={variant}
            className={`${bgColor} ${textColor}`}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
            <AlertDescription>
              <span className="font-semibold">[{notification.date}]</span>{' '}
              {notification.message}
            </AlertDescription>
          </Alert>
        )
      })}
    </div>
  )
}

/**
 * Parse notification.txt content into structured notification items
 * 
 * Expected format:
 * [date time] message
 * [date time] !message  (! indicates error/important)
 * 
 * Example:
 * [2025-12-03 14:30 UTC] !Service is down, downtime 3 hours
 * [2025-12-12 03:00 UTC] Planned maintenance
 * 
 * Messages starting with ! are shown as red error notifications
 * All other messages are shown as blue info notifications
 */
export function parseNotifications(content: string | null): NotificationItem[] {
  if (!content || content.trim() === '') {
    return []
  }

  const lines = content.split('\n').filter(line => line.trim() !== '' && !line.trim().startsWith('#'))
  const notifications: NotificationItem[] = []

  for (const line of lines) {
    // Match pattern: [date time] message
    const match = line.match(/^\[([^\]]+)\]\s*(.+)$/)
    
    if (match) {
      const [, date, message] = match
      
      // Determine notification type based on ! prefix
      let type: 'info' | 'warning' | 'error' = 'info'
      let cleanMessage = message.trim()
      
      if (cleanMessage.startsWith('!')) {
        type = 'error'
        cleanMessage = cleanMessage.substring(1).trim() // Remove the ! prefix
      }

      notifications.push({
        date: date.trim(),
        message: cleanMessage,
        type
      })
    }
  }

  return notifications
}

