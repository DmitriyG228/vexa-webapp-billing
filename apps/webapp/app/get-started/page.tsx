"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { parseMeetingInput } from "@/lib/parse-meeting-input";
import type { MeetingPlatform } from "@/lib/parse-meeting-input";

const platformConfig: Record<
  MeetingPlatform,
  { label: string; logo: string; width: number; height: number }
> = {
  google_meet: {
    label: "Google Meet",
    logo: "/google-meet-logo.png",
    width: 20,
    height: 20,
  },
  teams: {
    label: "Microsoft Teams",
    logo: "/microsoft-teams-logo.png",
    width: 20,
    height: 20,
  },
  zoom: { label: "Zoom", logo: "/zoom-logo.png", width: 20, height: 20 },
};

function GetStartedContent() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const { status } = useSession();
  const router = useRouter();
  const dashboardUrl =
    process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001";

  const parsed = url.trim() ? parseMeetingInput(url) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a meeting URL");
      return;
    }

    if (!parsed) {
      setError(
        "Could not recognize this URL. Please paste a Google Meet, Teams, or Zoom link."
      );
      return;
    }

    setError("");

    // Build Dashboard URL with meetingUrl param
    const target = `${dashboardUrl}?meetingUrl=${encodeURIComponent(url.trim())}`;

    if (status === "authenticated") {
      // Already signed in — go straight to Dashboard
      window.location.href = target;
    } else {
      // Need to sign in first, then redirect to Dashboard with meeting URL
      router.push(`/signin?callbackUrl=${encodeURIComponent(target)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f8f7] dark:bg-black">
      <div className="w-full max-w-[440px] mx-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-6">
            <Image
              src="/logodark.svg"
              alt="Vexa"
              width={32}
              height={32}
              className="h-8 w-8 rounded-[9px]"
            />
            <span className="text-[18px] font-semibold tracking-[-0.01em] text-gray-950 dark:text-gray-50">
              vexa
            </span>
          </Link>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50">
            Join a meeting
          </h1>
          <p className="mt-2 text-[14px] text-gray-500 dark:text-gray-400 text-center max-w-[340px] leading-[1.7]">
            Paste your meeting link and we&apos;ll send a bot to transcribe it
            in real time
          </p>
        </div>

        {/* Input card */}
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_-8px_rgba(0,0,0,0.06)] dark:shadow-none">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="meeting-url"
                className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Meeting URL
              </label>
              <input
                id="meeting-url"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full h-[44px] px-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[14px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950/10 dark:focus:ring-white/10 focus:border-gray-400 dark:focus:border-neutral-500 transition-all"
                autoFocus
              />
            </div>

            {/* Platform detection badge */}
            {parsed && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                <Image
                  src={platformConfig[parsed.platform].logo}
                  alt={platformConfig[parsed.platform].label}
                  width={platformConfig[parsed.platform].width}
                  height={platformConfig[parsed.platform].height}
                  className="h-5 w-5 object-contain"
                />
                <span className="text-[13px] font-medium text-emerald-700 dark:text-emerald-400">
                  {platformConfig[parsed.platform].label} detected
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-500 ml-auto"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-[13px] text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full h-[44px] rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Continue
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          {/* Supported platforms */}
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-neutral-800">
            <p className="text-[11.5px] text-gray-400 dark:text-gray-500 text-center mb-3 font-medium">
              Supported platforms
            </p>
            <div className="flex items-center justify-center gap-6">
              {(
                ["google_meet", "teams", "zoom"] as const
              ).map((platform) => (
                <div
                  key={platform}
                  className="flex items-center gap-1.5 text-[12px] text-gray-400 dark:text-gray-500"
                >
                  <Image
                    src={platformConfig[platform].logo}
                    alt={platformConfig[platform].label}
                    width={16}
                    height={16}
                    className="h-4 w-4 object-contain"
                  />
                  {platformConfig[platform].label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-[13px] text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <Suspense>
      <GetStartedContent />
    </Suspense>
  );
}
