'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Logo } from './Logo'
import { LogoutButton } from './LogoutButton'
import { PostModal } from './PostModal'
import Link from 'next/link'

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [showLogout, setShowLogout] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const logoutRef = useRef<HTMLDivElement>(null)

  // Close logout popup when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (logoutRef.current && !logoutRef.current.contains(event.target as Node)) {
        setShowLogout(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && showLogout) {
        setShowLogout(false)
      }
    }

    if (showLogout) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showLogout])

  const isActive = (path: string) => pathname === path

  // Extract current user ID to avoid TypeScript issues
  // Type assertion: session.user has userID from our extended Session type
  const currentUserID = session?.user ? (session.user as { userID?: string }).userID ?? null : null

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Profile',
      path: currentUserID ? `/profile/${currentUserID}` : '/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  const handlePostClick = () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    setShowPostModal(true)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 lg:w-[27vw] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col z-10" aria-label="Main navigation">
      <div className="flex flex-col h-full ml-auto w-[52%] lg:w-[300px]">
        {/* Logo */}
        <div className="p-4">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            aria-label={item.name}
            aria-current={isActive(item.path) ? 'page' : undefined}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 w-full ${
              isActive(item.path)
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span className="text-lg hidden lg:inline">{item.name}</span>
          </Link>
        ))}

        {/* Post Button - Highlighted */}
        <button
          onClick={handlePostClick}
          aria-label="Create new post"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 mt-4"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-lg hidden lg:inline">Post</span>
        </button>
      </nav>

        {/* User Section */}
        {session?.user ? (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="relative" ref={logoutRef}>
            {(() => {
              // Type assertion: session.user has userID from our extended Session type
              const user = session.user as { id: string; userID: string; name?: string | null; email?: string | null; image?: string | null }
              return (
                <button
                  onClick={() => setShowLogout(!showLogout)}
                  aria-label={`User menu for ${user.name || 'User'} (@${user.userID || 'userid'})`}
                  aria-expanded={showLogout}
                  aria-haspopup="menu"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={`${user.name || 'User'}'s avatar`}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center" aria-hidden="true">
                      <span className="text-gray-600 dark:text-gray-300 font-semibold">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 text-left hidden lg:block">
                    <p className="font-bold text-sm text-white">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{user.userID || 'userid'}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              )
            })()}

            {/* Logout Popup */}
            {showLogout && (
              <div 
                className="absolute bottom-full left-0 mb-2 w-[calc(100%-0.5rem)] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2"
                role="menu"
                aria-label="User account menu"
              >
                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/auth/signin"
            aria-label="Sign in to your account"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            Sign In
          </Link>
        </div>
        )}
      </div>

      {/* Post Modal */}
      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
      />
    </aside>
  )
}

