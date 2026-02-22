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
              Transcription, recording, and bot control — all via API.
            </h2>
            <p className="text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7]">
              Real-time transcripts, audio capture, and interactive bots.
              Use the full platform or pick individual primitives.
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
            <div className="rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 p-4 space-y-3">
              {/* File info row */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">standup-2026-02-22.webm</div>
                  <div className="text-[9px] text-gray-400">34:12 &middot; 48kHz &middot; Opus</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-[9px] text-red-400 font-medium font-mono">REC</span>
                </div>
              </div>
              {/* Waveform timeline */}
              <div className="relative">
                <div className="flex items-center gap-[2px] h-8">
                  {[35,55,40,70,50,85,65,95,60,80,45,70,35,55,75,90,50,65,40,55,30,45,25,35,20,15,10,8,5,3].map((h, i) => (
                    <div key={i} className={`flex-1 rounded-[1px] ${i < 20 ? 'bg-red-300 dark:bg-red-400/50' : 'bg-gray-200 dark:bg-neutral-700'}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
                {/* Playhead */}
                <div className="absolute top-0 bottom-0 w-[1.5px] bg-red-500" style={{ left: '66%' }} />
              </div>
              {/* Time */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-gray-400 font-mono">22:34</span>
                <span className="text-[9px] text-gray-400 font-mono">34:12</span>
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
            <div className="flex items-center gap-2.5 mb-1">
              {/* MCP Logo — official knot mark */}
              <svg width="22" height="22" viewBox="0 0 186 186" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 97.853L92.882 29.97a24 24 0 0 1 33.941 0 24 24 0 0 1 0 33.941L75.558 115.177" className="stroke-gray-900 dark:stroke-gray-100" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M76.265 114.47l50.558-50.558a24 24 0 0 1 33.942 0l.353.354a24 24 0 0 1 0 33.94l-61.393 61.394a5.003 5.003 0 0 0 0 7.072l12.606 12.607" className="stroke-gray-900 dark:stroke-gray-100" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M109.853 46.941L59.648 97.146a24 24 0 0 0 0 33.941 24 24 0 0 0 33.941 0l50.205-50.205" className="stroke-gray-900 dark:stroke-gray-100" strokeWidth="12" strokeLinecap="round" fill="none" />
              </svg>
              <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50">
                MCP Server
              </h3>
            </div>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-3">
              A toolkit for any AI agent. Connect Cursor, Claude, ChatGPT,
              OpenClaw, or any MCP-compatible client directly to live meeting data.
            </p>
            <ArrowButton />
            <div className="flex flex-wrap gap-2">
              {/* Cursor */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
                </svg>
                Cursor
              </span>
              {/* Claude */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97757">
                  <path d="m4.714 15.956 4.717-2.648.08-.23-.08-.128h-.23l-.79-.049-2.695-.073-2.338-.097-2.265-.121-.57-.122-.535-.704.055-.352.48-.322.686.061 1.518.103 2.277.158 1.651.097 2.447.255h.389l.054-.158-.134-.097-.103-.097-2.532-1.7-2.55-1.688-1.336-.971-.722-.492-.365-.461-.157-1.008.655-.722.88.06.225.061.892.686 1.907 1.475 2.489 1.834.365.303.145-.103.018-.073-.163-.273-1.354-2.447-1.445-2.489-.644-1.032-.17-.62c-.06-.254-.103-.467-.103-.728L6.287.134 6.7 0l.996.134.419.364.619 1.415 1.002 2.228 1.554 3.03.456.898.243.832.09.255h.158v-.146l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.583.28.48.685-.067.444-.285 1.852-.559 2.902-.364 1.943h.212l.243-.243.984-1.305 1.651-2.065.729-.82.85-.904.546-.431h1.032l.76 1.13-.34 1.165-1.063 1.348-.88 1.141-1.263 1.7-.79 1.36.073.11.189-.019 2.853-.607 1.542-.28 1.84-.315.831.388.091.395-.328.807-1.967.486-2.307.461-3.436.814-.043.03.049.061 1.548.146.662.036h1.621l3.018.225.789.522.474.637-.08.486-1.214.62-1.64-.389-3.825-.911-1.311-.328h-.182v.11l1.093 1.068 2.004 1.81 2.507 2.331.128.577-.322.455-.34-.048-2.204-1.658-.85-.747-1.925-1.621h-.127v.17l.443.65 2.344 3.521.121 1.081-.17.352-.607.212-.668-.121-1.372-1.925-1.457-2.046-1.141-1.943-.14.08-.674 7.255-.316.37-.728.28-.607-.462-.322-.747.322-1.475.389-1.925.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.433 1.967-2.18 2.945-1.724 1.846-.413.163-.716-.37.067-.662.4-.589 2.387-3.036 1.439-1.882.929-1.087-.006-.158h-.055l-6.338 4.117-1.13.145-.485-.455.06-.747.231-.243 1.906-1.311z" />
                </svg>
                Claude
              </span>
              {/* ChatGPT / OpenAI */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.041l.141-.08 4.778-2.758a.795.795 0 0 0 .393-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.471 4.471 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.354-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.124 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.41-.681zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.681 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.074a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.361l2.602-1.501 2.607 1.501v3.001l-2.607 1.501-2.602-1.501z" />
                </svg>
                ChatGPT
              </span>
              {/* OpenClaw */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                <span className="text-[13px] leading-none">🐾</span>
                OpenClaw
              </span>
              {/* Any MCP Client */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                <svg width="14" height="14" viewBox="0 0 186 186" fill="none">
                  <path d="M25 97.853L92.882 29.97a24 24 0 0 1 33.941 0 24 24 0 0 1 0 33.941L75.558 115.177" stroke="currentColor" strokeWidth="12" strokeLinecap="round" fill="none" />
                  <path d="M76.265 114.47l50.558-50.558a24 24 0 0 1 33.942 0l.353.354a24 24 0 0 1 0 33.94l-61.393 61.394a5.003 5.003 0 0 0 0 7.072l12.606 12.607" stroke="currentColor" strokeWidth="12" strokeLinecap="round" fill="none" />
                  <path d="M109.853 46.941L59.648 97.146a24 24 0 0 0 0 33.941 24 24 0 0 0 33.941 0l50.205-50.205" stroke="currentColor" strokeWidth="12" strokeLinecap="round" fill="none" />
                </svg>
                Any MCP Client
              </span>
            </div>
          </div>

          {/* Multi-tenant Platform */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
              Team Management
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-3">
              Multiple users per organization. Invite your team, manage
              access, and share meeting data across your company.
            </p>
            <ArrowButton />
            {/* Team members visual */}
            <div className="rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Acme Corp</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">3 members</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-blue-500">A</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Alice Chen</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 font-medium">Admin</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-purple-500">B</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Bob Martin</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 font-medium">Member</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-amber-600">C</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Carol Wu</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 font-medium">Member</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
