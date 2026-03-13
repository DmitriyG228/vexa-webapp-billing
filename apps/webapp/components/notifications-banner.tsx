"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"

interface Notification {
  id: string
  type: "maintenance" | "incident" | "announcement"
  title: string
  body: string
  link?: string
  active_from: string
  active_until: string
}

const DISMISSED_KEY = "dismissed-notifications"
const BLOG_URL = process.env.NEXT_PUBLIC_BLOG_URL || "https://blog.vexa.ai"

function getDismissedIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]")
  } catch {
    return []
  }
}

const typeStyles: Record<string, { bg: string; icon: string; text: string; link: string }> = {
  maintenance: {
    bg: "bg-amber-500/10 dark:bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
    text: "text-amber-900 dark:text-amber-200",
    link: "text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100",
  },
  incident: {
    bg: "bg-red-500/10 dark:bg-red-500/10",
    icon: "text-red-600 dark:text-red-400",
    text: "text-red-900 dark:text-red-200",
    link: "text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100",
  },
  announcement: {
    bg: "bg-sky-500/10 dark:bg-sky-500/8",
    icon: "text-sky-600 dark:text-sky-400",
    text: "text-sky-900 dark:text-sky-200",
    link: "text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100",
  },
}

export function NotificationsBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    setDismissed(getDismissedIds())

    async function fetchNotifications() {
      try {
        const resp = await fetch(`${BLOG_URL}/notifications.json`, { cache: "no-store" })
        if (!resp.ok) return
        const data: Notification[] = await resp.json()
        const now = new Date()
        const active = data.filter(n => {
          const from = new Date(n.active_from)
          const until = new Date(n.active_until)
          return now >= from && now <= until
        })
        setNotifications(active)
      } catch {
        // Notifications are optional — fail silently
      }
    }
    fetchNotifications()
  }, [])

  function dismiss(id: string) {
    const updated = [...dismissed, id]
    setDismissed(updated)
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated))
    } catch {}
  }

  const visible = notifications.filter(n => !dismissed.includes(n.id))
  if (visible.length === 0) return null

  return (
    <div className="space-y-3">
      {visible.map(n => {
        const s = typeStyles[n.type] || typeStyles.announcement
        return (
          <div key={n.id} className={`rounded-lg px-4 py-3 flex items-center gap-3 ${s.bg}`}>
            <Bell className={`h-4 w-4 flex-shrink-0 ${s.icon}`} />
            <div className={`flex-1 text-sm ${s.text}`}>
              <span className="font-medium">{n.title}</span>
              <span className="opacity-80">{" — "}{n.body}</span>
              {n.link && (
                <a href={n.link} className={`ml-1 underline underline-offset-2 ${s.link}`}>
                  Read more
                </a>
              )}
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className={`flex-shrink-0 p-1 rounded-md opacity-40 hover:opacity-100 transition-opacity ${s.text}`}
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
