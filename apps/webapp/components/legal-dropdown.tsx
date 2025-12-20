"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CookiePrefsButton } from "@/components/cookie-prefs-button"

export function LegalDropdown() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
    return (
      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        Legal
        <ChevronDown className="h-3 w-3" />
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        Legal
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link
            href="/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            Terms
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            Privacy
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/legal/cookies"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            Cookies
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CookiePrefsButton />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/legal/dpa"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            DPA
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/legal/subprocessors"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            Sub-processors
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/legal/security"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            Security
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
