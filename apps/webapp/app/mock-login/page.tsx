"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function MockLoginPage() {
  const [email, setEmail] = useState("test@vexa.ai")
  const [isLoading, setIsLoading] = useState(false)

  if (process.env.NEXT_PUBLIC_MOCK_AUTH !== "true") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Mock login is not enabled.</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await signIn("mock", { email, callbackUrl: "/account" })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 p-8 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-200 dark:border-neutral-800"
      >
        <h1 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100">
          Mock Login (Dev Only)
        </h1>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="test@vexa.ai"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  )
}
