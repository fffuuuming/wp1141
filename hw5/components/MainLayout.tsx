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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Sidebar />
      <main id="main-content" className="ml-20 lg:ml-[27vw] xl:mr-[28vw] bg-white dark:bg-gray-900 min-h-screen" tabIndex={-1}>
        {children}
      </main>
      <RightSidebar />
    </div>
  )
}

