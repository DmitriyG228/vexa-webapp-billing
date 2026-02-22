import Link from "next/link";

const cardShadow =
  "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)";

export function AgenticSection() {
  return (
    <section className="py-16 lg:py-20 border-t border-gray-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-6">
        {/* Bento grid: heading left + 2 cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: heading */}
          <div className="flex flex-col justify-center py-2">
            <h2 className="text-[30px] sm:text-[36px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50 mb-4">
              Agentic-first by design.
            </h2>
            <p className="text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7]">
              Built for the age of AI agents. Connect meeting intelligence to
              coding assistants, automation workflows, and custom agents.
            </p>
          </div>

          {/* Skills -- coding agents */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
              Skills
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-3">
              Give AI coding agents access to meeting context. Decisions and
              requirements as tool calls.
            </p>
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
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                <span className="text-[13px]">&#x1F980;</span>
                OpenClaw
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97757">
                  <path d="m4.714 15.956 4.717-2.648.08-.23-.08-.128h-.23l-.79-.049-2.695-.073-2.338-.097-2.265-.121-.57-.122-.535-.704.055-.352.48-.322.686.061 1.518.103 2.277.158 1.651.097 2.447.255h.389l.054-.158-.134-.097-.103-.097-2.532-1.7-2.55-1.688-1.336-.971-.722-.492-.365-.461-.157-1.008.655-.722.88.06.225.061.892.686 1.907 1.475 2.489 1.834.365.303.145-.103.018-.073-.163-.273-1.354-2.447-1.445-2.489-.644-1.032-.17-.62c-.06-.254-.103-.467-.103-.728L6.287.134 6.7 0l.996.134.419.364.619 1.415 1.002 2.228 1.554 3.03.456.898.243.832.09.255h.158v-.146l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.583.28.48.685-.067.444-.285 1.852-.559 2.902-.364 1.943h.212l.243-.243.984-1.305 1.651-2.065.729-.82.85-.904.546-.431h1.032l.76 1.13-.34 1.165-1.063 1.348-.88 1.141-1.263 1.7-.79 1.36.073.11.189-.019 2.853-.607 1.542-.28 1.84-.315.831.388.091.395-.328.807-1.967.486-2.307.461-3.436.814-.043.03.049.061 1.548.146.662.036h1.621l3.018.225.789.522.474.637-.08.486-1.214.62-1.64-.389-3.825-.911-1.311-.328h-.182v.11l1.093 1.068 2.004 1.81 2.507 2.331.128.577-.322.455-.34-.048-2.204-1.658-.85-.747-1.925-1.621h-.127v.17l.443.65 2.344 3.521.121 1.081-.17.352-.607.212-.668-.121-1.372-1.925-1.457-2.046-1.141-1.943-.14.08-.674 7.255-.316.37-.728.28-.607-.462-.322-.747.322-1.475.389-1.925.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.433 1.967-2.18 2.945-1.724 1.846-.413.163-.716-.37.067-.662.4-.589 2.387-3.036 1.439-1.882.929-1.087-.006-.158h-.055l-6.338 4.117-1.13.145-.485-.455.06-.747.231-.243 1.906-1.311z" />
                </svg>
                Claude Code
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#10a37f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 17V7l8 5 8-5v10" />
                  <path d="M4 7l8-5 8 5" />
                </svg>
                Codex
              </span>
            </div>
          </div>

          {/* n8n / Workflow automation */}
          <div
            className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6"
            style={{ boxShadow: cardShadow }}
          >
            <h3 className="text-[17px] font-semibold text-gray-950 dark:text-gray-50 mb-1">
              Integrations
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] mb-3">
              Trigger n8n workflows when meetings end. Push to CRM, create
              tickets, send summaries.
            </p>
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
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                <svg height="14" width="14" viewBox="0 0 24 24">
                  <path
                    d="M24 8.4c0 1.325-1.102 2.4-2.462 2.4-1.146 0-2.11-.765-2.384-1.8h-3.436c-.602 0-1.115.424-1.214 1.003l-.101.592a2.38 2.38 0 01-.8 1.405c.412.354.704.844.8 1.405l.1.592A1.222 1.222 0 0015.719 15h.975c.273-1.035 1.237-1.8 2.384-1.8 1.36 0 2.461 1.075 2.461 2.4S20.436 18 19.078 18c-1.147 0-2.11-.765-2.384-1.8h-.975c-1.204 0-2.23-.848-2.428-2.005l-.101-.592a1.222 1.222 0 00-1.214-1.003H10.97c-.308.984-1.246 1.7-2.356 1.7-1.11 0-2.048-.716-2.355-1.7H4.817c-.308.984-1.246 1.7-2.355 1.7C1.102 14.3 0 13.225 0 11.9s1.102-2.4 2.462-2.4c1.183 0 2.172.815 2.408 1.9h1.337c.236-1.085 1.225-1.9 2.408-1.9 1.184 0 2.172.815 2.408 1.9h.952c.601 0 1.115-.424 1.213-1.003l.102-.592c.198-1.157 1.225-2.005 2.428-2.005h3.436c.274-1.035 1.238-1.8 2.384-1.8C22.898 6 24 7.075 24 8.4z"
                    fill="#EA4B71"
                    fillRule="evenodd"
                  />
                </svg>
                n8n
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                Webhooks
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                Zapier
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                Custom
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
