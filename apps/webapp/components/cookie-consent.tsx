"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    // Check if user has already made cookie choices
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setShowConsent(true)
    } else {
      try {
        const savedPrefs = JSON.parse(consent)
        setPreferences(savedPrefs)
      } catch (e) {
        // Fallback to default preferences
        setPreferences({
          essential: true,
          analytics: false,
          marketing: false
        })
      }
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs))
    localStorage.setItem("cookie-consent-timestamp", new Date().toISOString())

    // Apply preferences to analytics
    if (prefs.analytics) {
      // Enable GA/Umami
      window.localStorage.setItem("ga-enabled", "true")
      window.localStorage.setItem("umami-enabled", "true")
    } else {
      // Disable GA/Umami
      window.localStorage.setItem("ga-enabled", "false")
      window.localStorage.setItem("umami-enabled", "false")
    }

    setShowConsent(false)
    setShowPreferences(false)
  }

  const acceptAll = () => {
    const allPrefs = { essential: true, analytics: true, marketing: true }
    setPreferences(allPrefs)
    savePreferences(allPrefs)
  }

  const rejectAll = () => {
    const minPrefs = { essential: true, analytics: false, marketing: false }
    setPreferences(minPrefs)
    savePreferences(minPrefs)
  }

  const acceptSelected = () => {
    savePreferences(preferences)
  }

  if (!showConsent) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 py-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
            <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-primary">
              Learn more
            </Link>
          </p>
          <div className="flex gap-2">
            <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Cookie Preferences
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Cookie Preferences</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Essential Cookies</Label>
                        <p className="text-xs text-muted-foreground">
                          Required for basic website functionality. Cannot be disabled.
                        </p>
                      </div>
                      <Switch checked={preferences.essential} disabled />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Analytics Cookies</Label>
                        <p className="text-xs text-muted-foreground">
                          Help us understand how you use our website (Google Analytics, Umami).
                        </p>
                      </div>
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={(checked) =>
                          setPreferences(prev => ({ ...prev, analytics: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Marketing Cookies</Label>
                        <p className="text-xs text-muted-foreground">
                          Used for advertising and marketing purposes.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.marketing}
                        onCheckedChange={(checked) =>
                          setPreferences(prev => ({ ...prev, marketing: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={acceptSelected} className="flex-1">
                      Save Preferences
                    </Button>
                    <Button variant="outline" onClick={acceptAll} className="flex-1">
                      Accept All
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={rejectAll}>
              Reject All
            </Button>
            <Button size="sm" onClick={acceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </>
  )
} 