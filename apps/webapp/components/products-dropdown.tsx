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
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

export function ProductsDropdown() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
    return (
      <button className={cn(navigationMenuTriggerStyle(), "gap-1")}>
        Products
        <ChevronDown className="h-4 w-4 transition-transform duration-200" aria-hidden="true" />
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(navigationMenuTriggerStyle(), "gap-1")}>
        Products
        <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuItem asChild>
          <Link href="/product/vexa-lite">
            Vexa Lite
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/product/google-meet-transcription-api">
            Google Meet
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/product/microsoft-teams-transcription-api">
            Microsoft Teams
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/open-source">
            Open Source
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


