'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'

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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-64">
        <div className="max-w-4xl mx-auto p-4">{children}</div>
      </main>
    </div>
  )
}

