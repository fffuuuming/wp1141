'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProfileLikesProps {
  userID: string
  isOwnProfile: boolean
}

interface LikedPost {
  id: string
  post: {
    id: string
    content: string
    createdAt: string
    parentId: string | null
    author: {
      userID: string
      name: string | null
      image: string | null
    }
    _count: {
      likes: number
      replies: number
      reposts: number
    }
  }
  isComment?: boolean
  createdAt: string
}

export function ProfileLikes({ userID, isOwnProfile }: ProfileLikesProps) {
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Only show likes if it's the user's own profile
    if (!isOwnProfile) {
      setLoading(false)
      return
    }

    const fetchLikedPosts = async () => {
      try {
        // userID here is the database user.id
        const response = await fetch(`/api/user/likes-by-id/${userID}`)
        if (response.ok) {
          const data = await response.json()
          setLikedPosts(data.likedPosts || [])
        }
      } catch (error) {
        console.error('Error fetching liked posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLikedPosts()
  }, [userID, isOwnProfile])

  if (!isOwnProfile) {
    return (
      <div className="px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Likes are private</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You can only see your own likes
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading likes...</p>
        </div>
      </div>
    )
  }

  if (likedPosts.length === 0) {
    return (
      <div className="px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No likes yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Posts and comments you like will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <div className="space-y-4">
        {likedPosts.map((like) => {
          const isComment = like.isComment || like.post.parentId !== null
          
          return (
            <div
              key={like.id}
              className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0"
            >
              {isComment && (
                <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <Link 
                    href={`/post/${like.post.parentId || like.post.id}`}
                    className="hover:text-blue-500 dark:hover:text-blue-400 hover:underline"
                  >
                    Comment on post
                  </Link>
                </div>
              )}
              <div className="flex gap-3">
                {like.post.author.image ? (
                  <img
                    src={like.post.author.image}
                    alt={like.post.author.name || 'User'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                      {like.post.author.name?.[0]?.toUpperCase() || like.post.author.userID[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {like.post.author.name || 'User'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      @{like.post.author.userID}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">·</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(like.post.createdAt).toLocaleDateString()}
                    </span>
                    {isComment && (
                      <>
                        <span className="text-gray-500 dark:text-gray-400">·</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                          Comment
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap mb-2">
                    {like.post.content}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <span>{like.post._count.likes} likes</span>
                    <span>{like.post._count.replies} replies</span>
                    {!isComment && <span>{like.post._count.reposts} reposts</span>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

