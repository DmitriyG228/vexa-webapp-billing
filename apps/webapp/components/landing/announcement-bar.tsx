import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="bg-gray-100 dark:bg-neutral-800 text-center py-2 px-4 border-b border-gray-200 dark:border-neutral-700">
      <p className="text-[11.5px] text-gray-500 dark:text-gray-400">
        <span className="text-gray-900 dark:text-gray-200 font-medium">v0.7 is live</span>
        <span className="mx-2 text-gray-700">&middot;</span>
        Microsoft Teams bot support has arrived
        <Link
          href="#"
          className="ml-3 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white underline underline-offset-2 transition-colors"
        >
          Read more &rarr;
        </Link>
      </p>
    </div>
  );
}
