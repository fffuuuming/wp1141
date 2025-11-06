import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileContent } from '@/components/ProfileContent'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface ProfilePageProps {
  params: Promise<{ userID: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userID } = await params
  const session = await auth()
  const currentUserId = session?.user?.id

  // Fetch user profile data
  const user = await prisma.user.findUnique({
    where: { userID },
    select: {
      id: true,
      userID: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      backgroundImage: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          following: true,
          followers: true,
        },
      },
    },
  })

  if (!user) {
    redirect('/')
  }

  // Check if current user follows this user
  let isFollowing = false
  if (currentUserId && currentUserId !== user.id) {
    const follow = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    })
    isFollowing = !!follow
  }

  // Check if this is the current user's own profile
  const isOwnProfile = currentUserId === user.id

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Top Header: Back Arrow, Name, Post Count, Search Icon */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              {/* Back Arrow */}
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              
              {/* Name and Post Count */}
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.name || 'User'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user._count.posts} posts
                </p>
              </div>
            </div>

            {/* Search Icon */}
            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <ProfileContent
        user={{
          id: user.id,
          userID: user.userID,
          name: user.name,
          image: user.image,
          bio: user.bio,
          backgroundImage: user.backgroundImage,
          createdAt: user.createdAt,
        }}
        stats={{
          posts: user._count.posts,
          following: user._count.following,
          followers: user._count.followers,
        }}
        isFollowing={isFollowing}
        isOwnProfile={isOwnProfile}
      />
    </div>
  )
}
