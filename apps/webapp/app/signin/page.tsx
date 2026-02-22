"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/account";
  const error = searchParams?.get("error");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f8f7] dark:bg-black">
      <div className="w-full max-w-[400px] mx-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-6">
            <Image
              src="/logodark.svg"
              alt="Vexa"
              width={32}
              height={32}
              className="h-8 w-8 rounded-[9px]"
            />
            <span className="text-[18px] font-semibold tracking-[-0.01em] text-gray-950 dark:text-gray-50">
              vexa
            </span>
          </Link>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-gray-950 dark:text-gray-50">
            Sign in to Vexa
          </h1>
          <p className="mt-2 text-[14px] text-gray-500 dark:text-gray-400">
            Meeting Intelligence API for developers
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-[13px] text-red-600 dark:text-red-400">
            {error === "OAuthAccountNotLinked"
              ? "This email is already associated with another provider. Please sign in with your original provider."
              : error === "AccessDenied"
                ? "Access denied. Please contact support if you believe this is an error."
                : "An error occurred during sign in. Please try again."}
          </div>
        )}

        {/* Sign-in card */}
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_-8px_rgba(0,0,0,0.06)] dark:shadow-none">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="flex items-center justify-center gap-3 w-full h-[44px] rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[14px] font-medium text-gray-800 dark:text-gray-200 hover:border-gray-400 dark:hover:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-750 transition-all"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <button
              onClick={() => signIn("microsoft", { callbackUrl })}
              className="flex items-center justify-center gap-3 w-full h-[44px] rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[14px] font-medium text-gray-800 dark:text-gray-200 hover:border-gray-400 dark:hover:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-750 transition-all"
            >
              <MicrosoftIcon />
              Continue with Microsoft
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[13px] text-gray-400 dark:text-gray-500">
          By continuing, you agree to our{" "}
          <Link
            href="/legal/terms"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline underline-offset-2"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline underline-offset-2"
          >
            Privacy Policy
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-[13px] text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
