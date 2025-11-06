# Database Schema Design

## Overview
This document describes the complete database schema for heya social media platform.

## Models

### 1. User Model
**Purpose**: Store user account information from OAuth providers

**Fields**:
- `id` (String, @id, @default(cuid())) - Primary key
- `userID` (String, @unique) - Custom userID chosen during registration (unique, required)
- `name` (String?) - Display name from OAuth provider
- `email` (String?) - Email from OAuth provider
- `emailVerified` (DateTime?) - Email verification timestamp
- `image` (String?) - Profile picture URL from OAuth provider
- `provider` (String) - OAuth provider name (google, github, facebook)
- `providerId` (String) - User ID from OAuth provider
- `bio` (String?) - User biography/description (editable)
- `backgroundImage` (String?) - Profile background image URL (editable)
- `createdAt` (DateTime, @default(now())) - Account creation timestamp
- `updatedAt` (DateTime, @updatedAt) - Last update timestamp

**Relations**:
- `posts` (Post[]) - Posts authored by this user
- `comments` (Comment[]) - Comments authored by this user
- `likes` (Like[]) - Likes given by this user
- `reposts` (Repost[]) - Reposts made by this user
- `drafts` (Draft[]) - Drafts saved by this user
- `following` (Follow[]) - Users this user follows (as follower)
- `followers` (Follow[]) - Users following this user (as following)

**Indexes**:
- `userID` (unique index)
- `provider_providerId` (composite unique - same OAuth provider + ID = same user)

**Constraints**:
- `userID` must be unique across all users
- Same person with different OAuth providers = different userIDs (handled by unique userID)

---

### 2. Post Model
**Purpose**: Store user posts/tweets

**Fields**:
- `id` (String, @id, @default(cuid())) - Primary key
- `authorId` (String) - Foreign key to User
- `content` (String) - Post content (max 280 chars, but stored as text for flexibility)
- `createdAt` (DateTime, @default(now())) - Post creation timestamp
- `updatedAt` (DateTime, @updatedAt) - Last update timestamp

**Relations**:
- `author` (User, @relation) - Post author
- `comments` (Comment[]) - Comments on this post
- `likes` (Like[]) - Likes on this post
- `reposts` (Repost[]) - Reposts of this post

**Indexes**:
- `authorId` (for filtering posts by user)
- `createdAt` (for sorting by date)

**Constraints**:
- `authorId` must reference existing User
- Cannot delete post if it has reposts (business logic - reposts cannot be deleted)

---

### 3. Comment Model
**Purpose**: Store comments on posts or other comments (recursive/nested)

**Fields**:
- `id` (String, @id, @default(cuid())) - Primary key
- `authorId` (String) - Foreign key to User
- `postId` (String?) - Foreign key to Post (nullable - if comment is on a post)
- `parentId` (String?) - Foreign key to Comment (nullable - if comment is on another comment)
- `content` (String) - Comment content
- `createdAt` (DateTime, @default(now())) - Comment creation timestamp
- `updatedAt` (DateTime, @updatedAt) - Last update timestamp

**Relations**:
- `author` (User, @relation) - Comment author
- `post` (Post?, @relation) - Parent post (if comment is on a post)
- `parent` (Comment?, @relation("CommentReplies")) - Parent comment (if comment is on another comment)
- `replies` (Comment[], @relation("CommentReplies")) - Child comments (recursive)
- `likes` (Like[]) - Likes on this comment

**Indexes**:
- `authorId` (for filtering comments by user)
- `postId` (for filtering comments by post)
- `parentId` (for filtering replies to a comment)
- `createdAt` (for sorting by date)

**Constraints**:
- Either `postId` OR `parentId` must be set (not both, not neither)
- `authorId` must reference existing User

**Business Logic**:
- If `postId` is set: comment is on a post
- If `parentId` is set: comment is a reply to another comment
- Comments can be nested infinitely (recursive structure)

---

### 4. Like Model
**Purpose**: Store likes on posts or comments

**Fields**:
- `id` (String, @id, @default(cuid())) - Primary key
- `userId` (String) - Foreign key to User
- `postId` (String?) - Foreign key to Post (nullable)
- `commentId` (String?) - Foreign key to Comment (nullable)
- `createdAt` (DateTime, @default(now())) - Like timestamp

**Relations**:
- `user` (User, @relation) - User who liked
- `post` (Post?, @relation) - Liked post (if applicable)
- `comment` (Comment?, @relation) - Liked comment (if applicable)

**Indexes**:
- `userId_postId` (composite unique - user can only like a post once)
- `userId_commentId` (composite unique - user can only like a comment once)
- `postId` (for counting likes on a post)
- `commentId` (for counting likes on a comment)

**Constraints**:
- Either `postId` OR `commentId` must be set (not both, not neither)
- User can only like a post/comment once (enforced by unique indexes)

**Business Logic**:
- Like is toggled: if exists, delete (unlike); if not exists, create (like)

---

### 5. Repost Model
**Purpose**: Store reposts of posts

**Fields**:
- `id` (String, @id, @default(cuid())) - Primary key
- `userId` (String) - Foreign key to User
- `postId` (String) - Foreign key to Post
- `createdAt` (DateTime, @default(now())) - Repost timestamp

**Relations**:
- `user` (User, @relation) - User who reposted
- `post` (Post, @relation) - Reposted post

**Indexes**:
- `userId_postId` (composite unique - user can only repost a post once)
- `postId` (for counting reposts on a post)
- `userId` (for filtering reposts by user)

**Constraints**:
- User can only repost a post once (enforced by unique index)
- Cannot repost a repost (business logic - reposts are of original posts only)

**Business Logic**:
- Repost is toggled: if exists, delete (unrepost); if not exists, create (repost)
- Reposts appear in user's profile and feed
- Original post author is preserved

---

### 6. Follow Model
**Purpose**: Store follow relationships between users

**Fields**:
- `id` (String, @id, @default(cuid())) - Primary key
- `followerId` (String) - Foreign key to User (who is following)
- `followingId` (String) - Foreign key to User (who is being followed)
- `createdAt` (DateTime, @default(now())) - Follow timestamp

**Relations**:
- `follower` (User, @relation("UserFollowers")) - User who follows
- `following` (User, @relation("UserFollowing")) - User being followed

**Indexes**:
- `followerId_followingId` (composite unique - prevent duplicate follows)
- `followerId` (for getting users I follow)
- `followingId` (for getting my followers)

**Constraints**:
- User cannot follow themselves (business logic check)
- User can only follow another user once (enforced by unique index)

**Business Logic**:
- Follow is toggled: if exists, delete (unfollow); if not exists, create (follow)

---

### 7. Draft Model
**Purpose**: Store draft posts

**Fields**:
- `id` (String, @id, @default(cuid())) - Primary key
- `userId` (String) - Foreign key to User
- `content` (String) - Draft content
- `createdAt` (DateTime, @default(now())) - Draft creation timestamp
- `updatedAt` (DateTime, @updatedAt) - Last update timestamp

**Relations**:
- `user` (User, @relation) - Draft owner

**Indexes**:
- `userId` (for filtering drafts by user)
- `updatedAt` (for sorting by last modified)

**Constraints**:
- `userId` must reference existing User
- Drafts are private to the user

---

## Relationships Summary

```
User (1) ──< (N) Post
User (1) ──< (N) Comment
User (1) ──< (N) Like
User (1) ──< (N) Repost
User (1) ──< (N) Draft
User (1) ──< (N) Follow (as follower)
User (1) ──< (N) Follow (as following)

Post (1) ──< (N) Comment
Post (1) ──< (N) Like
Post (1) ──< (N) Repost

Comment (1) ──< (N) Comment (self-referential, parent-child)
Comment (1) ──< (N) Like
```

## Key Design Decisions

1. **Recursive Comments**: Comments can be nested infinitely using `parentId` self-reference
2. **Flexible Likes**: Likes work on both posts and comments using nullable foreign keys
3. **Unique Constraints**: Prevent duplicate likes, reposts, and follows using composite unique indexes
4. **Soft Deletes**: Not implemented (can add `deletedAt` field later if needed)
5. **Timestamps**: All models have `createdAt`, editable models have `updatedAt`
6. **OAuth Handling**: Multiple OAuth providers per user handled by unique `userID` + provider combination

## Performance Considerations

- Indexes on frequently queried fields (userID, authorId, postId, createdAt)
- Composite unique indexes prevent duplicate operations
- Foreign key indexes for join performance
- Consider adding pagination for large result sets

---

**Status**: ✅ Design Complete - Ready for Prisma Schema Implementation

