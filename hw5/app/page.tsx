import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import HomeContent from './HomeContent'
import { HomeFeed } from '@/components/HomeFeed'
import { HomeHeader, HomeFilterProvider } from '@/components/HomeHeader'

export default async function Home() {
  const session = await auth()

  // If not authenticated, show login form
  if (!session?.user) {
    return <HomeContent />
  }

  // If authenticated but has temporary userID, redirect to sign-in to set userID
  // Type assertion: session.user has userID from our extended Session type
  const user = session.user as { id: string; userID: string; name?: string | null; email?: string | null; image?: string | null }
  if (user.userID && user.userID.startsWith('temp_')) {
    redirect('/auth/signin')
  }

  // Authenticated user with valid userID
  return (
    <HomeFilterProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <HomeHeader />
        <div className="w-full">
          <HomeFeed />
        </div>
      </div>
    </HomeFilterProvider>
  )
}
