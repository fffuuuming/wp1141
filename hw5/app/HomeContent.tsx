'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RegisteredUser {
  userID: string
  name: string | null
  provider: string
  image: string | null
}

export default function HomeContent() {
  const [userID, setUserID] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Load registered users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/user/list')
        if (response.ok) {
          const data = await response.json()
          setRegisteredUsers(data.users || [])
        }
      } catch (err) {
        console.error('Error loading users:', err)
      } finally {
        setLoadingUsers(false)
      }
    }
    loadUsers()
  }, [])

  const handleUserIDLogin = async (inputUserID: string) => {
    setError('')
    setLoading(true)

    try {
      // Look up user by userID
      const response = await fetch('/api/user/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID: inputUserID.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'User not found')
        setLoading(false)
        return
      }

      // Validate provider
      const provider = data.provider as 'google' | 'github'
      if (!provider || !['google', 'github'].includes(provider)) {
        setError('Invalid provider. Please contact support.')
        setLoading(false)
        return
      }

      console.log(`Redirecting to ${provider} OAuth for userID: ${inputUserID}`)
      
      // Redirect to the appropriate OAuth provider
      // signIn will redirect the page, so we don't need to handle the return value
      await signIn(provider, {
        callbackUrl: '/',
        redirect: true,
      })
    } catch (err: any) {
      console.error('Error during userID login:', err)
      setError(err.message || 'An error occurred while logging in')
      setLoading(false)
    }
  }

  const handleUserIDSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleUserIDLogin(userID)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-xl">
              <span className="text-5xl font-bold text-white">h</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Welcome to heya
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Connect with your community
            </p>
          </div>

          {/* UserID Login Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 space-y-6 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Login with UserID
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your UserID to continue
              </p>
            </div>

            <form onSubmit={handleUserIDSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={userID}
                  onChange={(e) => setUserID(e.target.value)}
                  placeholder="Enter your UserID"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !userID.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Registered Users List */}
            {registeredUsers.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                  Or click a registered account:
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {registeredUsers.map((user) => (
                    <button
                      key={user.userID}
                      onClick={() => handleUserIDLogin(user.userID)}
                      disabled={loading}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-600 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || user.userID}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {(user.name || user.userID)[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          @{user.userID}
                        </div>
                        {user.name && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.name}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 capitalize px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        {user.provider}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadingUsers && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}

            <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <Link
              href="/auth/signin"
              className="block w-full text-center px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Sign in with OAuth
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

