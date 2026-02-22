import Image from "next/image";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-neutral-800 py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Image
            src="/logodark.svg"
            alt="Vexa"
            width={20}
            height={20}
            className="h-5 w-5 rounded-[5px]"
          />
          <span className="text-[13px] text-gray-400 dark:text-gray-500">vexa</span>
        </div>
        <div className="flex items-center gap-6 text-[13px] text-gray-400 dark:text-gray-500">
          <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Docs
          </Link>
          <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            GitHub
          </Link>
          <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Pricing
          </Link>
          <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
