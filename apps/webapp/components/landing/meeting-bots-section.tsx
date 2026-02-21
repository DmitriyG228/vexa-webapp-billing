import Image from "next/image";

const cardShadow =
  "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)";

export function MeetingBotsSection() {
  return (
    <section className="py-16 lg:py-20 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left: copy */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 bg-white text-[11.5px] text-gray-500 font-medium shadow-sm mb-3">
              Meeting Bots
            </span>
            <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 mb-4">
              One API, every
              <br />
              <em className="not-italic font-light text-gray-400">
                meeting platform
              </em>
            </h2>
            <p className="text-[15.5px] text-gray-500 leading-[1.7] mb-6 max-w-[440px]">
              Deploy meeting bots to Google Meet and Microsoft Teams with a
              single API call. The bot joins, records, transcribes, and can even
              speak — all controlled from your backend.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                  <p className="text-[14.5px] text-gray-800 font-medium">
                    Automatic join &amp; leave
                  </p>
                  <p className="text-[13.5px] text-gray-500">
                    Bots join via meeting URL, stay for the meeting duration, and
                    leave automatically.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                  <p className="text-[14.5px] text-gray-800 font-medium">
                    Custom bot identity
                  </p>
                  <p className="text-[13.5px] text-gray-500">
                    Set the bot&apos;s display name, avatar, and branding for
                    each meeting.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                  <p className="text-[14.5px] text-gray-800 font-medium">
                    Platform-agnostic API
                  </p>
                  <p className="text-[13.5px] text-gray-500">
                    Same API surface for Meet and Teams. Zoom support coming
                    soon.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: visual placeholder */}
          <div
            className="rounded-2xl border border-gray-200 bg-white p-8 h-[320px] flex items-center justify-center"
            style={{ boxShadow: cardShadow }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Image
                  src="/microsoft-teams-logo.png"
                  alt="Teams"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
                <div className="w-px h-10 bg-gray-200" />
                <Image
                  src="/google-meet-logo.png"
                  alt="Meet"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
                <div className="w-px h-10 bg-gray-200" />
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="#0B5CFF"
                >
                  <path d="M5.033 14.649H.743a.74.74 0 0 1-.686-.458.74.74 0 0 1 .16-.808L3.19 10.41H1.06A1.06 1.06 0 0 1 0 9.35h3.957c.301 0 .57.18.686.458a.74.74 0 0 1-.161.808L1.51 13.59h2.464c.585 0 1.06.475 1.06 1.06zM24 11.338c0-1.14-.927-2.066-2.066-2.066-.61 0-1.158.265-1.537.686a2.061 2.061 0 0 0-1.536-.686c-1.14 0-2.066.926-2.066 2.066v3.311a1.06 1.06 0 0 0 1.06-1.06v-2.251a1.004 1.004 0 0 1 2.013 0v2.251c0 .586.474 1.06 1.06 1.06v-3.311a1.004 1.004 0 0 1 2.012 0v2.251c0 .586.475 1.06 1.06 1.06zM16.265 12a2.728 2.728 0 1 1-5.457 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0zm-4.82 0a2.728 2.728 0 1 1-5.458 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0z" />
                </svg>
              </div>
              <span className="text-[13px] text-gray-300 font-mono">
                bot interaction visual
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
