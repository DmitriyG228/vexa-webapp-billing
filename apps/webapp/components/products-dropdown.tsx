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

export function ProductsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-caption transition-colors hover:text-primary">
        Products
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem asChild>
          <Link
            href="/product/google-meet-transcription-api"
            className="w-full cursor-pointer"
          >
            Google Meet
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/product/microsoft-teams-transcription-api"
            className="w-full cursor-pointer"
          >
            Microsoft Teams
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/open-source"
            className="w-full cursor-pointer"
          >
            Open Source
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


