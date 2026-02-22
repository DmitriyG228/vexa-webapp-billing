import Link from "next/link";

const cardShadow =
  "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)";

function ArrowButton() {
  return (
    <Link
      href="#"
      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600 transition-colors mb-4"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export function BentoGrid() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Row 1: Heading + 2 feature cards (bento grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Left: big heading (spans 2 rows on desktop) */}
          <div className="lg:row-span-2 flex flex-col justify-center py-4">
            <h2 className="text-[30px] sm:text-[36px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50 mb-4">
              All the components to build exactly what you need.
            </h2>
            <p className="text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7]">
              Everything to integrate AI into meetings. Use the full platform or
              pick individual primitives.
            </p>
          </div>

          {/* Real-time Transcription */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
              Real-time Transcription
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-3">
              Sub-second latency, speaker-diarized, delivered via WebSocket.
              Feed directly into LLMs.
            </p>
            <ArrowButton />
            {/* Mini terminal */}
            <div className="rounded-lg bg-[#111] border border-gray-800 p-3 font-mono text-[10.5px] leading-[1.7] space-y-1.5">
              <div>
                <span className="text-[#7dd3fc] font-semibold">Alice</span>{" "}
                <span className="text-gray-300">
                  We need to finalize the API contracts.
                </span>
              </div>
              <div>
                <span className="text-[#c4b5fd] font-semibold">Bob</span>{" "}
                <span className="text-gray-300">
                  I&apos;ll have the spec ready by
                </span>
                <span className="text-gray-600"> tomorrow.</span>
                <span className="animate-blink text-gray-500">&#9612;</span>
              </div>
            </div>
          </div>

          {/* Interactive Bot */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
              Interactive Bot
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-3">
              Conversational, bi-directional. Speaks via TTS, listens, responds
              in real time.
            </p>
            <ArrowButton />
            {/* Capability pills */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                TTS Speak
              </span>
              <span className="px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                Listen
              </span>
              <span className="px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                Respond
              </span>
              <span className="px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                Screenshare
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: 3 equal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Recording */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
              Recording
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-3">
              Capture full meeting audio. Post-meeting transcription from
              recordings.
            </p>
            <ArrowButton />
            <div className="rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono font-medium">
                    REC
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  00:34:12
                </span>
              </div>
              {/* Waveform bars */}
              <div className="flex items-end gap-[3px] h-10">
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "35%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "60%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "45%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "80%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "55%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "90%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "70%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "100%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "65%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "85%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "50%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "75%" }}
                />
                <div
                  className="flex-1 bg-gray-300 rounded-sm"
                  style={{ height: "40%" }}
                />
                <div
                  className="flex-1 bg-red-300 rounded-sm"
                  style={{ height: "60%" }}
                />
                <div
                  className="flex-1 bg-red-300 rounded-sm"
                  style={{ height: "45%" }}
                />
                <div
                  className="flex-1 bg-gray-200 rounded-sm"
                  style={{ height: "20%" }}
                />
                <div
                  className="flex-1 bg-gray-200 rounded-sm"
                  style={{ height: "15%" }}
                />
                <div
                  className="flex-1 bg-gray-200 rounded-sm"
                  style={{ height: "25%" }}
                />
                <div
                  className="flex-1 bg-gray-200 rounded-sm"
                  style={{ height: "10%" }}
                />
                <div
                  className="flex-1 bg-gray-200 rounded-sm"
                  style={{ height: "18%" }}
                />
              </div>
            </div>
          </div>

          {/* Screenshare */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
              Screenshare
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-3">
              Present slides and dashboards into the meeting programmatically
              from your backend.
            </p>
            <ArrowButton />
            <div className="rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 overflow-hidden">
              {/* Mini browser chrome */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-neutral-700">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="text-[8px] text-gray-400 ml-2 font-mono">
                  slides.pdf
                </span>
              </div>
              {/* Slide content */}
              <div className="p-3 h-[72px] flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-1.5 bg-gray-300 rounded w-3/4 mb-1.5" />
                  <div className="h-1 bg-gray-200 rounded w-full mb-1" />
                  <div className="h-1 bg-gray-200 rounded w-5/6" />
                </div>
                <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Storage */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
              Storage
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-3">
              All data in Postgres. Query history, search conversations, export
              via API. Your database.
            </p>
            <ArrowButton />
            <div className="rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 overflow-hidden">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100">
                    <th className="text-left px-3 py-1.5 text-gray-400 font-medium">
                      meeting_id
                    </th>
                    <th className="text-left px-3 py-1.5 text-gray-400 font-medium">
                      speaker
                    </th>
                    <th className="text-left px-3 py-1.5 text-gray-400 font-medium">
                      text
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono text-gray-500">
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-1.5 text-blue-500">m_9f2a</td>
                    <td className="px-3 py-1.5">Alice</td>
                    <td className="px-3 py-1.5 truncate max-w-[100px]">
                      We need to finalize...
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-1.5 text-blue-500">m_9f2a</td>
                    <td className="px-3 py-1.5">Bob</td>
                    <td className="px-3 py-1.5 truncate max-w-[100px]">
                      I&apos;ll have the spec...
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 text-blue-500">m_3b7c</td>
                    <td className="px-3 py-1.5">Carol</td>
                    <td className="px-3 py-1.5 truncate max-w-[100px]">
                      Let&apos;s review the...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Row 3: MCP Server + Multi-tenant Platform */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* MCP Server */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
              MCP Server
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-3">
              AI-native interface via Model Context Protocol. Give Claude, GPT,
              or any MCP agent direct access to meeting data.
            </p>
            <ArrowButton />
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                REST API
              </span>
              <span className="px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                WebSocket
              </span>
              <span className="px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                MCP
              </span>
              <span className="px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                Webhooks
              </span>
              <span className="px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                SDKs
              </span>
              <span className="px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                Self-hosted
              </span>
            </div>
          </div>

          {/* Multi-tenant Platform */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
              Multi-tenant Platform
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-3">
              Isolated data per customer, scoped API keys, per-tenant webhooks.
              Build a SaaS on top of Vexa.
            </p>
            <ArrowButton />
            {/* Tenant isolation visual */}
            <div className="rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-blue-500">
                      A
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                        Acme Corp
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
                        12 bots
                      </span>
                    </div>
                    <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: "72%" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-purple-500">
                      N
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                        NovaTech
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
                        8 bots
                      </span>
                    </div>
                    <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-400 rounded-full"
                        style={{ width: "48%" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-amber-600">
                      S
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                        StartupXYZ
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
                        3 bots
                      </span>
                    </div>
                    <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: "24%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
