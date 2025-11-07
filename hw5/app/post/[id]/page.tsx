import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PostCard } from '@/components/PostCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          userID: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          reposts: true,
        },
      },
    },
  })

  if (!post) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Post</h1>
        </div>
      </div>

      {/* Post Detail */}
      <div className="max-w-2xl mx-auto">
        <PostCard
          post={{
            id: post.id,
            content: post.content,
            createdAt: post.createdAt.toISOString(),
            author: post.author,
            _count: post._count,
          }}
        />

        {/* Comments Section - Placeholder for Stage 8 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Comments
          </h2>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Comments will be available in Stage 8</p>
          </div>
        </div>
      </div>
    </div>
  )
}

