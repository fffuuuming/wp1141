'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string | null) => {
    if (!errorCode) {
      return {
        title: 'Authentication Error',
        message: 'An error occurred during authentication. Please try again.',
        details: null,
      }
    }

    const errorMap: Record<string, { title: string; message: string; details: string | null }> = {
      Configuration: {
        title: 'Configuration Error',
        message: 'There is a problem with the server configuration.',
        details: 'Please check your environment variables. For Google: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET. For GitHub: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET. Also ensure AUTH_SECRET (or NEXTAUTH_SECRET) and AUTH_URL (or NEXTAUTH_URL) are set in Vercel. After adding variables, you must redeploy your application.',
      },
      AccessDenied: {
        title: 'Access Denied',
        message: 'You do not have permission to sign in.',
        details: null,
      },
      Verification: {
        title: 'Verification Error',
        message: 'The verification token has expired or has already been used.',
        details: 'Please try signing in again.',
      },
      OAuthAccountNotLinked: {
        title: 'Account Not Linked',
        message: 'This email is already registered with a different provider.',
        details: 'Please sign in with the provider you originally used.',
      },
      OAuthCallback: {
        title: 'OAuth Callback Error',
        message: 'Error in OAuth callback.',
        details: 'Please check your OAuth app callback URLs match your deployment URL. For production, use: https://your-domain.vercel.app/api/auth/callback/{provider}',
      },
      OAuthCreateAccount: {
        title: 'Account Creation Error',
        message: 'Could not create OAuth account.',
        details: 'Please try again or contact support.',
      },
      EmailCreateAccount: {
        title: 'Email Account Error',
        message: 'Could not create email account.',
        details: null,
      },
      Callback: {
        title: 'Callback Error',
        message: 'Error in OAuth callback.',
        details: 'Please check your OAuth app settings and callback URLs for the provider you are using.',
      },
      OAuthSignin: {
        title: 'OAuth Sign In Error',
        message: 'Error attempting to sign in with OAuth provider.',
        details: 'Please check your OAuth credentials in your .env file. For Google: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET. For GitHub: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.',
      },
      EmailSignin: {
        title: 'Email Sign In Error',
        message: 'Error sending email.',
        details: null,
      },
      CredentialsSignin: {
        title: 'Sign In Error',
        message: 'The credentials you provided are incorrect.',
        details: null,
      },
      SessionRequired: {
        title: 'Session Required',
        message: 'You must be signed in to view this page.',
        details: null,
      },
      Default: {
        title: 'Authentication Error',
        message: `An error occurred: ${errorCode}`,
        details: 'Please try again or contact support if the problem persists.',
      },
    }

    return errorMap[errorCode] || errorMap.Default
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-10 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{errorInfo.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{errorInfo.message}</p>
          {errorInfo.details && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">{errorInfo.details}</p>
            </div>
          )}
          {error && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
              Error code: {error}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-center"
          >
            Back to Sign In
          </Link>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p className="font-semibold mb-1">Common OAuth Issues:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Callback URLs must match your deployment URL: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">https://your-domain.vercel.app/api/auth/callback/{'{provider}'}</code></li>
              <li>For production: Update OAuth app callback URLs in GitHub/Google settings</li>
              <li>Google: Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel environment variables</li>
              <li>GitHub: Check GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Vercel environment variables</li>
              <li>Ensure AUTH_SECRET (or NEXTAUTH_SECRET) and AUTH_URL (or NEXTAUTH_URL) are set in Vercel</li>
              <li><strong>Important:</strong> After adding/updating environment variables, you must redeploy your application</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}

