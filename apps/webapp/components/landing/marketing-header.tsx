"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-gray-200/70 dark:border-neutral-800/70">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logodark.svg"
            alt="Vexa"
            width={26}
            height={26}
            className="h-[26px] w-[26px] rounded-[7px]"
          />
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-gray-950 dark:text-gray-50">
            vexa
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="https://docs.vexa.ai"
            className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all"
          >
            Docs
          </Link>
          <Link
            href="#pricing"
            className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all"
          >
            Pricing
          </Link>
          <Link
            href="https://github.com/Vexa-ai/vexa"
            target="_blank"
            className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all"
          >
            GitHub
          </Link>
        </nav>

        {/* Desktop right */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800">
                  Account
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href="/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"}>
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/signin"
              className="hidden sm:block px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/get-started"
            className="inline-flex items-center gap-1 h-8 px-4 rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[13.5px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Get started
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Open menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="https://docs.vexa.ai"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Docs
                </Link>
                <Link
                  href="#pricing"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="https://github.com/Vexa-ai/vexa"
                  target="_blank"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  GitHub
                </Link>
                <hr className="border-gray-200 dark:border-neutral-800" />
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/account"
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Account
                    </Link>
                    <Link
                      href={process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors text-left"
                      onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/signin"
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                )}
                <Link
                  href="/get-started"
                  className="inline-flex items-center justify-center gap-1 h-8 px-4 rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[13.5px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-fit"
                  onClick={() => setOpen(false)}
                >
                  Get started
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
