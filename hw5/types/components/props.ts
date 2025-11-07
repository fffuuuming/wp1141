/**
 * Component prop types
 * Shared prop type definitions for React components
 */

import { PostWithDetails, PostVariant } from '../entities/post'
import { CommentWithDetails } from '../entities/comment'
import { UserProfile } from '../entities/user'
import { DraftDisplay } from '../entities/draft'

/**
 * PostCard component props
 */
export interface PostCardProps {
  post: PostWithDetails
  onDelete?: (postId: string) => void
  onUpdate?: () => void
  clickable?: boolean
  variant?: PostVariant
}

/**
 * CommentCard component props
 */
export interface CommentCardProps {
  comment: CommentWithDetails
  onDelete?: (commentId: string) => void
  onUpdate?: () => void
  clickable?: boolean
}

/**
 * CommentsList component props
 */
export interface CommentsListProps {
  postId: string
  onCommentClick?: (commentId: string) => void
}

/**
 * CommentInput component props
 */
export interface CommentInputProps {
  postId: string
  parentId?: string | null
  onCommentCreated?: () => void
  replyingTo?: {
    userID: string
    name: string | null
  }
  placeholder?: string
}

/**
 * ProfileContent component props
 */
export interface ProfileContentProps {
  userID: string
}

/**
 * ProfilePosts component props
 */
export interface ProfilePostsProps {
  userID: string
}

/**
 * ProfileLikes component props
 */
export interface ProfileLikesProps {
  userID: string
}

/**
 * FollowButton component props
 */
export interface FollowButtonProps {
  userID: string
  initialFollowing?: boolean
  onFollowChange?: (following: boolean) => void
}

/**
 * EditProfileModal component props
 */
export interface EditProfileModalProps {
  user: UserProfile
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

/**
 * PostModal component props
 */
export interface PostModalProps {
  isOpen: boolean
  onClose: () => void
  draftContent?: string
  draftId?: string
}

/**
 * DraftList component props
 */
export interface DraftListProps {
  drafts: DraftDisplay[]
  onSelectDraft?: (draft: DraftDisplay) => void
  onDeleteDraft?: (draftId: string) => void
}

/**
 * PostDetailContent component props
 */
export interface PostDetailContentProps {
  postId: string
}

/**
 * CommentDetailContent component props
 */
export interface CommentDetailContentProps {
  comment: CommentWithDetails
  backUrl?: string
  backLabel?: string
}

