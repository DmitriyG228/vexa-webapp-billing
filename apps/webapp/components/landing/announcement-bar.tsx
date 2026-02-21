import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="bg-gray-950 text-center py-2 px-4">
      <p className="text-[11.5px] text-gray-400">
        <span className="text-gray-200 font-medium">v0.6 is live</span>
        <span className="mx-2 text-gray-700">&middot;</span>
        Microsoft Teams bot support has arrived
        <Link
          href="#"
          className="ml-3 text-white/70 hover:text-white underline underline-offset-2 transition-colors"
        >
          Read more &rarr;
        </Link>
      </p>
    </div>
  );
}
