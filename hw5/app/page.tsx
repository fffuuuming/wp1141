import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import HomeContent from './HomeContent'
import { HomeFeed } from '@/components/HomeFeed'

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Home</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto">
        <HomeFeed />
      </div>
    </div>
  )
}
