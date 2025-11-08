'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { RightSidebar } from './RightSidebar'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  // Protect routes (except auth pages)
  useEffect(() => {
    if (status === 'loading') return

    const isAuthPage = pathname?.startsWith('/auth')
    if (!session && !isAuthPage) {
      router.push('/auth/signin')
    }
  }, [session, status, pathname, router])

  // Don't show sidebar on auth pages
  if (pathname?.startsWith('/auth')) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 min-w-0 ml-20 lg:ml-64 bg-white dark:bg-gray-900">
        {children}
      </main>
      <RightSidebar />
    </div>
  )
}

