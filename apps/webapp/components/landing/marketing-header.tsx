"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/70">
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
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-gray-950">
            vexa
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="#"
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-all"
          >
            Docs
          </Link>
          <Link
            href="#pricing"
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-all"
          >
            Pricing
          </Link>
          <Link
            href="https://github.com/Vexa-ai/vexa"
            target="_blank"
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-all"
          >
            GitHub
          </Link>
        </nav>

        {/* Desktop right */}
        <div className="flex items-center gap-2">
          <Link
            href="#"
            className="hidden sm:block px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/get-started"
            className="inline-flex items-center gap-1 h-8 px-4 rounded-full bg-gray-950 text-white text-[13.5px] font-medium hover:bg-gray-800 transition-colors"
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
                className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors"
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
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Docs
                </Link>
                <Link
                  href="#pricing"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="https://github.com/Vexa-ai/vexa"
                  target="_blank"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  GitHub
                </Link>
                <hr className="border-gray-200" />
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/get-started"
                  className="inline-flex items-center justify-center gap-1 h-8 px-4 rounded-full bg-gray-950 text-white text-[13.5px] font-medium hover:bg-gray-800 transition-colors w-fit"
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
