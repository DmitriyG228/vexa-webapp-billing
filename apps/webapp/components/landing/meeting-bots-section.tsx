import { TerminalAnimation } from "./terminal-animation";

export function MeetingBotsSection() {
  return (
    <section className="py-16 lg:py-20 border-t border-gray-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col gap-10">
          {/* Top: copy */}
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-3">
              Meeting Bots
            </span>
            <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50 mb-4">
              One API, every
              <br />
              <em className="not-italic font-light text-gray-400 dark:text-gray-500">
                meeting platform
              </em>
            </h2>
            <p className="text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] mb-6 max-w-[440px]">
              Deploy meeting bots to Google Meet and Microsoft Teams with a
              single API call. The bot joins, records, transcribes, and can even
              speak — all controlled from your backend.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14.5px] text-gray-800 dark:text-gray-200 font-medium">
                    Automatic join &amp; leave
                  </p>
                  <p className="text-[13.5px] text-gray-500 dark:text-gray-400">
                    Bots join via meeting URL, stay for the meeting duration, and
                    leave automatically.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14.5px] text-gray-800 dark:text-gray-200 font-medium">
                    Custom bot identity
                  </p>
                  <p className="text-[13.5px] text-gray-500 dark:text-gray-400">
                    Set the bot&apos;s display name, avatar, and branding for
                    each meeting.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14.5px] text-gray-800 dark:text-gray-200 font-medium">
                    Platform-agnostic API
                  </p>
                  <p className="text-[13.5px] text-gray-500 dark:text-gray-400">
                    Same API surface for Meet and Teams. Zoom support coming
                    soon.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: terminal */}
          <div className="w-full">
            <TerminalAnimation />
          </div>
        </div>
      </div>
    </section>
  );
}
