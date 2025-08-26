"use client"

export function CookiePrefsButton() {
  const handleCookiePrefsClick = () => {
    // Reset cookie preferences to show the banner again
    localStorage.removeItem("cookie-consent")
    // Reload the page to show the cookie banner
    window.location.reload()
  }

  return (
    <button
      onClick={handleCookiePrefsClick}
      className="text-sm text-muted-foreground hover:underline"
    >
      Cookie prefs
    </button>
  )
}
