"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getDashboardUrl } from "@/lib/utils";
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

function ApiPreview({
  parsed,
}: {
  parsed: ReturnType<typeof parseMeetingInput>;
}) {
  const platform = parsed?.platform || "google_meet";
  const meetingId = parsed?.meetingId || "abc-defg-hij";
  const passcode = parsed?.passcode;
  const hasInput = !!parsed;

  return (
    <div className="rounded-[16px] border border-gray-200/80 dark:border-neutral-800 overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.13)] dark:shadow-none">
      {/* Chrome bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a]">
        <div className="flex items-center gap-[6px]">
          <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
          <span className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
          <span className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] text-gray-500 font-mono">
          POST /bots
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-gray-500 font-mono tracking-widest font-semibold">
            LIVE
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#111111] p-5 font-mono text-[13px] leading-[1.8] min-h-[380px]">
        <div className="text-gray-500 mb-3">
          # Send a bot to your meeting
        </div>
        <div>
          <span className="text-gray-300">curl -X </span>
          <span className="text-[#7dd3fc]">POST</span>
          <span className="text-gray-300"> \</span>
        </div>
        <div className="pl-4">
          <span className="text-[#6ee7b7]">
            https://api.vexa.ai/bots
          </span>
          <span className="text-gray-300"> \</span>
        </div>
        <div className="pl-4">
          <span className="text-gray-300">-H </span>
          <span className="text-[#7dd3fc]">
            &apos;Content-Type: application/json&apos;
          </span>
          <span className="text-gray-300"> \</span>
        </div>
        <div className="pl-4">
          <span className="text-gray-300">-H </span>
          <span className="text-[#7dd3fc]">
            &apos;X-API-Key: vx_sk_...&apos;
          </span>
          <span className="text-gray-300"> \</span>
        </div>
        <div className="pl-4">
          <span className="text-gray-300">-d &apos;</span>
          <span className="text-gray-600">{"{"}</span>
        </div>
        <div className="pl-8">
          <span className="text-gray-400">&quot;platform&quot;</span>
          <span className="text-gray-600">: </span>
          <span className={hasInput ? "text-[#6ee7b7]" : "text-gray-600"}>
            &quot;{platform}&quot;
          </span>
          <span className="text-gray-600">,</span>
        </div>
        <div className="pl-8">
          <span className="text-gray-400">&quot;native_meeting_id&quot;</span>
          <span className="text-gray-600">: </span>
          <span className={hasInput ? "text-[#6ee7b7]" : "text-gray-600"}>
            &quot;{meetingId}&quot;
          </span>
          {passcode && <span className="text-gray-600">,</span>}
        </div>
        {passcode && (
          <div className="pl-8">
            <span className="text-gray-400">&quot;passcode&quot;</span>
            <span className="text-gray-600">: </span>
            <span className="text-[#6ee7b7]">
              &quot;{passcode}&quot;
            </span>
          </div>
        )}
        <div className="pl-4">
          <span className="text-gray-600">{"}"}</span>
          <span className="text-gray-300">&apos;</span>
          <span className="text-gray-300 animate-blink">▌</span>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161616] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-[6px] h-[6px] rounded-full bg-emerald-400" />
          <span className="text-[10px] text-gray-600">
            REST API · api.vexa.ai
          </span>
        </div>
        <span className="text-[10px] text-gray-700">
          POST /bots
        </span>
      </div>
    </div>
  );
}

function GetStartedContent() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const { status } = useSession();
  const router = useRouter();
  const dashboardUrl = getDashboardUrl();

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
      window.location.href = target;
    } else {
      router.push(`/signin?callbackUrl=${encodeURIComponent(target)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f8f8f7] dark:bg-black">
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between max-w-6xl w-full mx-auto px-6 h-14">
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
          <Link
            href="/"
            className="text-[13px] text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center">
          <div className="max-w-6xl w-full mx-auto px-6 py-12 lg:py-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Left column — form */}
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-[46px] sm:text-[52px] font-semibold leading-[1.05] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
                    Join a
                    <br />
                    <em className="not-italic font-light text-gray-400 dark:text-gray-500 tracking-[-0.02em]">
                      meeting
                    </em>
                  </h1>
                </div>

                {/* Steps card */}
                <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_-8px_rgba(0,0,0,0.06)] dark:shadow-none">
                  {/* Step 1 — Get a meeting */}
                  <div className="flex gap-3 mb-5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-800 text-[12px] font-semibold text-gray-500 dark:text-gray-400 shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Get a meeting link or create a quick test
                      </p>
                      <a
                        href="https://meet.new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-[36px] px-4 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[13px] font-medium text-gray-800 dark:text-gray-200 hover:border-gray-400 dark:hover:border-neutral-500 transition-colors"
                      >
                        <Image
                          src={platformConfig.google_meet.logo}
                          alt="Google Meet"
                          width={16}
                          height={16}
                          className="h-4 w-4 object-contain"
                        />
                        Create a Google Meet
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </div>
                  </div>

                  {/* Step 2 — Paste link */}
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-800 text-[12px] font-semibold text-gray-500 dark:text-gray-400 shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1">
                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-3"
                      >
                        <label
                          htmlFor="meeting-url"
                          className="text-[13px] font-medium text-gray-700 dark:text-gray-300"
                        >
                          Drop your meeting link here
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

                        {/* Platform detection badge */}
                        {parsed && parsed.platform !== "zoom" && (
                          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                            <Image
                              src={platformConfig[parsed.platform].logo}
                              alt={platformConfig[parsed.platform].label}
                              width={platformConfig[parsed.platform].width}
                              height={platformConfig[parsed.platform].height}
                              className="h-5 w-5 object-contain"
                            />
                            <span className="text-[13px] font-medium text-gray-950 dark:text-gray-50">
                              {platformConfig[parsed.platform].label} detected
                            </span>
                            <span className="ml-auto w-[7px] h-[7px] rounded-full bg-emerald-400" />
                          </div>
                        )}

                        {/* Zoom not supported on hosted */}
                        {parsed && parsed.platform === "zoom" && (
                          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 px-3 py-2.5">
                            <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-[1.6]">
                              Zoom requires a registered Zoom App — available with{" "}
                              <a href="https://github.com/Vexa-ai/vexa" target="_blank" rel="noopener noreferrer" className="text-gray-950 dark:text-gray-200 underline underline-offset-2">self-hosted Vexa</a>.
                              Try Google Meet or Teams to get started.
                            </p>
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
                          disabled={parsed?.platform === "zoom"}
                          className="flex items-center justify-center gap-2 w-full h-[44px] rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-950 dark:disabled:hover:bg-white"
                        >
                          Get started
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Supported platforms */}
                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-neutral-800">
                    <div className="flex items-center justify-center gap-8">
                      {(["google_meet", "teams", "zoom"] as const).map(
                        (platform) => (
                          <div
                            key={platform}
                            className="flex items-center gap-2.5 text-[14px] text-gray-400 dark:text-gray-500"
                          >
                            <Image
                              src={platformConfig[platform].logo}
                              alt={platformConfig[platform].label}
                              width={28}
                              height={28}
                              className="h-[28px] w-[28px] object-contain"
                            />
                            {platformConfig[platform].label}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column — API preview */}
              <div className="hidden lg:block">
                <ApiPreview parsed={parsed} />
              </div>
            </div>
          </div>
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
