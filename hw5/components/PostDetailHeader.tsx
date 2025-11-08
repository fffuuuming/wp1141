'use client'

import { useRouter } from 'next/navigation'

interface PostDetailHeaderProps {
  postId: string
}

export function PostDetailHeader({ postId }: PostDetailHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full px-4 py-3 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Post</h1>
      </div>
    </div>
  )
}
