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
  if (session.user.userID && session.user.userID.startsWith('temp_')) {
    redirect('/auth/signin')
  }

  // Authenticated user with valid userID
  return (
    <HomeFilterProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <HomeHeader />
        <div className="max-w-2xl mx-auto">
          <HomeFeed />
        </div>
      </div>
    </HomeFilterProvider>
  )
}
