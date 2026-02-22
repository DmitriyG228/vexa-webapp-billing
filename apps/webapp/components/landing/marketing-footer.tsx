import Image from "next/image";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-neutral-800 py-12">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
            <Link href="https://docs.vexa.ai" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Docs
            </Link>
            <Link href="https://github.com/Vexa-ai/vexa" target="_blank" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              GitHub
            </Link>
            <Link href="#pricing" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Pricing
            </Link>
            <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Contact
            </Link>
          </div>
        </div>
        {/* Legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
          <span className="text-[12px] text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Vexa AI, Inc. All rights reserved.
          </span>
          <div className="flex items-center gap-4 text-[12px] text-gray-400 dark:text-gray-500">
            <Link href="/legal/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="/legal/cookies" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Cookies
            </Link>
            <Link href="/legal/dpa" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              DPA
            </Link>
            <Link href="/legal/security" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
