import Link from "next/link";
import { TerminalAnimation } from "./terminal-animation";
import { WorkflowDiagram } from "./workflow-diagram";

export function HeroSection() {
  return (
    <main className="relative dot-grid dot-mask overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 to-transparent"
        style={{ height: 200 }}
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-12 lg:pt-16 pb-6 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="animate-fade-up d1">
              <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 bg-white text-[11.5px] text-gray-500 font-medium shadow-sm">
                <span className="w-[7px] h-[7px] rounded-full bg-emerald-400 flex-shrink-0" />
                Open Source &middot; Developer-first &middot; API-first
              </span>
            </div>

            {/* Headline */}
            <div className="animate-fade-up d2">
              <h1 className="text-[46px] sm:text-[52px] lg:text-[56px] font-semibold leading-[1.05] tracking-[-0.03em] text-gray-950">
                Meeting
                <br />
                Intelligence
                <br />
                <em className="not-italic font-light text-gray-400 tracking-[-0.02em]">
                  API
                </em>
              </h1>
            </div>

            {/* Subheading */}
            <p className="animate-fade-up d3 text-[15.5px] text-gray-500 leading-[1.7] max-w-[420px]">
              The developer toolkit for meeting intelligence. Real-time
              transcription, bot control, and open APIs for Google Meet and
              Microsoft Teams. Open source, self-hostable, REST + MCP.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up d4 flex flex-col sm:flex-row gap-3">
              <Link
                href="https://docs.vexa.ai/quickstart"
                className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full bg-gray-950 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                Quick Start
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
              </Link>
              <Link
                href="https://github.com/Vexa-ai/vexa"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-full border border-gray-200 bg-white text-gray-800 text-[14px] font-medium hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
                </svg>
                View on GitHub
              </Link>
            </div>

            {/* Social proof */}
            <div className="animate-fade-up d5 flex items-center gap-3 pt-1">
              <div className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.pravatar.cc/64?img=45"
                  alt=""
                  className="av h-6 w-6 rounded-full ring-[2px] ring-white object-cover"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.pravatar.cc/64?img=23"
                  alt=""
                  className="av h-6 w-6 rounded-full ring-[2px] ring-white object-cover"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.pravatar.cc/64?img=67"
                  alt=""
                  className="av h-6 w-6 rounded-full ring-[2px] ring-white object-cover"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.pravatar.cc/64?img=12"
                  alt=""
                  className="av h-6 w-6 rounded-full ring-[2px] ring-white object-cover"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.pravatar.cc/64?img=34"
                  alt=""
                  className="av h-6 w-6 rounded-full ring-[2px] ring-white object-cover"
                />
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5 text-[13px] text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-amber-400"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Starred by{" "}
                <span className="text-gray-700 font-semibold">1.3k+</span>{" "}
                developers
              </div>
            </div>
          </div>

          {/* Right column: terminal */}
          <div className="animate-fade-up d7 w-full">
            <TerminalAnimation />
          </div>
        </div>

        {/* Workflow diagram card */}
        <div className="animate-fade-up d8 mt-12 lg:mt-14">
          <WorkflowDiagram />
        </div>
      </div>
    </main>
  );
}
