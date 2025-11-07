import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PostDetailContent } from '@/components/PostDetailContent'
import { PostDetailHeader } from '@/components/PostDetailHeader'
import { Suspense } from 'react'

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

  // Verify post exists
  const { prisma } = await import('@/lib/prisma')
  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!post) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <Suspense fallback={<div className="h-16" />}>
        <PostDetailHeader postId={id} />
      </Suspense>

      {/* Main Content */}
      <Suspense fallback={
        <div className="p-8 text-center">
          <div className="inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <PostDetailContent postId={id} />
      </Suspense>
    </div>
  )
}
