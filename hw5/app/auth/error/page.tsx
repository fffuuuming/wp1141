'use client'

import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
          <p className="mt-2 text-sm text-gray-600">
            An error occurred during authentication. Please try again.
          </p>
        </div>

        <Link
          href="/auth/signin"
          className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}

