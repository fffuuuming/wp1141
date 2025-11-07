'use client'

import { useState } from 'react'
import { CommentCard } from './CommentCard'
import { CommentInput } from './CommentInput'
import { useSession } from 'next-auth/react'

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    userID: string
    name: string | null
    image: string | null
  }
  _count: {
    likes: number
    replies: number
  }
  postId?: string | null
  replies?: Comment[]
  updatedAt?: string
}

interface CommentTreeProps {
  comment: Comment
  onDelete?: (commentId: string) => void
  depth?: number
  maxDepth?: number
}

export function CommentTree({ comment, onDelete, depth = 0, maxDepth = 10 }: CommentTreeProps) {
  const { data: session } = useSession()
  const [showReplies, setShowReplies] = useState(true)
  const [showReplyInput, setShowReplyInput] = useState(false)

  const hasReplies = comment.replies && comment.replies.length > 0
  const canReply = depth < maxDepth && !!session

  const handleReplyCreated = () => {
    setShowReplyInput(false)
    // Refresh will be handled by parent component
    window.dispatchEvent(new Event('commentCreated'))
  }

  return (
    <div>
      <CommentCard
        comment={{ ...comment, postId: comment.postId }}
        onDelete={onDelete}
        onReply={() => setShowReplyInput(!showReplyInput)}
        showReplyButton={canReply}
      />

      {/* Reply Input */}
      {showReplyInput && canReply && comment.postId && (
        <div className="ml-12 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
          <CommentInput
            postId={comment.postId}
            parentId={comment.id}
            onCommentCreated={handleReplyCreated}
          />
        </div>
      )}

      {/* Nested Replies */}
      {hasReplies && showReplies && (
        <div className="ml-12 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
          {comment.replies!.map((reply) => (
            <CommentTree
              key={reply.id}
              comment={reply}
              onDelete={onDelete}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}

      {/* Show/Hide Replies Toggle */}
      {hasReplies && (
        <div className="ml-12 pl-4">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mt-2 mb-2"
          >
            {showReplies ? (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Hide {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Show {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

