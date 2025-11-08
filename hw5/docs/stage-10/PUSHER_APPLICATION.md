# Where Pusher is Currently Applied

This document explains exactly where and how Pusher is used in the application.

---

## Overview

Pusher is used for **real-time updates** in two scenarios:
1. **Like/Unlike** - When users like or unlike posts
2. **Comments** - When users create or delete comments

---

## 🔴 Server-Side: Broadcasting Events (Where Events Are Sent)

Pusher broadcasts events from these API routes:

### 1. Like/Unlike Events
**File:** `app/api/posts/[id]/like/route.ts`

**When:** User clicks like/unlike button
**Broadcasts:**
- `like` event when user likes a post
- `unlike` event when user unlikes a post
**Channel:** `post-{postId}`
**Data:** `{ postId, userId, count, liked }`

```typescript
// After user likes/unlikes, broadcast to all connected clients
await broadcastEvent(
  PUSHER_CHANNELS.post(postId),
  PUSHER_EVENTS.LIKE,  // or UNLIKE
  { postId, userId, count, liked }
)
```

### 2. Comment Created Events
**Files:**
- `app/api/posts/[id]/comments/route.ts` - When replying to a post
- `app/api/comments/[id]/replies/route.ts` - When replying to a comment

**When:** User creates a comment/reply
**Broadcasts:** `comment-created` event
**Channel:** `post-{rootPostId}` (the original post)
**Data:** `{ postId, commentId, userId, count }`

```typescript
// After comment is created, broadcast to all connected clients
await broadcastEvent(
  PUSHER_CHANNELS.post(rootPostId),
  PUSHER_EVENTS.COMMENT_CREATED,
  { postId, commentId, userId, count }
)
```

### 3. Comment Deleted Events
**File:** `app/api/comments/[id]/route.ts`

**When:** User deletes a comment
**Broadcasts:** `comment-deleted` event
**Channel:** `post-{rootPostId}` (the original post)
**Data:** `{ postId, commentId, userId, count }`

```typescript
// After comment is deleted, broadcast to all connected clients
await broadcastEvent(
  PUSHER_CHANNELS.post(rootPostId),
  PUSHER_EVENTS.COMMENT_DELETED,
  { postId, commentId, userId, count }
)
```

---

## 🟢 Client-Side: Listening to Events (Where Events Are Received)

Pusher listens for events in these components/hooks:

### 1. Like Count Updates
**File:** `hooks/usePostInteractions.ts`
**Hook:** `usePostLike()`

**Listens for:**
- `like` events on channel `post-{postId}`
- `unlike` events on channel `post-{postId}`

**Used in:** `PostCard` component (every post card)

**What happens:**
- When another user likes/unlikes a post, the like count updates in real-time
- Only updates if the event is from a different user (prevents double updates)

```typescript
// Listens for like events from other users
usePusherChannel(
  PUSHER_CHANNELS.post(postId),
  PUSHER_EVENTS.LIKE,
  (data) => {
    if (data.userId !== session?.user?.id) {
      setLikeCount(data.count)  // Update count in real-time
    }
  }
)
```

### 2. Reply Count Updates
**File:** `hooks/usePostReplyCount.ts`
**Hook:** `usePostReplyCount()`

**Listens for:**
- `comment-created` events on channel `post-{postId}`
- `comment-deleted` events on channel `post-{postId}`

**Used in:** `PostCard` component (shows reply count)

**What happens:**
- When another user creates/deletes a comment, the reply count updates in real-time

```typescript
// Listens for comment events from other users
usePusherChannel(
  PUSHER_CHANNELS.post(postId),
  PUSHER_EVENTS.COMMENT_CREATED,
  (data) => {
    if (data.userId !== session?.user?.id) {
      setReplyCount(data.count)  // Update count in real-time
    }
  }
)
```

### 3. Comments List Updates
**File:** `components/CommentsList.tsx`

**Listens for:**
- `comment-created` events on channel `post-{postId}`
- `comment-deleted` events on channel `post-{postId}`

**Used in:** Post detail pages (shows list of comments)

**What happens:**
- When another user creates a comment, the comments list refreshes automatically
- When another user deletes a comment, the comments list refreshes automatically

```typescript
// Listens for comment events and refreshes the list
usePusherChannel(
  PUSHER_CHANNELS.post(postId),
  PUSHER_EVENTS.COMMENT_CREATED,
  (data) => {
    if (data.userId !== session?.user?.id) {
      fetchComments()  // Refresh comments list
    }
  }
)
```

---

## 📊 Complete Flow Example

### Example: User A likes a post that User B is viewing

```
┌─────────────────────────────────────────────────────────────┐
│  USER A (Window 1)                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Clicks like button on Post #123                   │   │
│  │ 2. POST /api/posts/123/like                           │   │
│  │ 3. Server updates database                            │   │
│  │ 4. Server broadcasts:                                 │   │
│  │    Channel: "post-123"                                │   │
│  │    Event: "like"                                      │   │
│  │    Data: { postId: "123", userId: "A", count: 5 }   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Pusher Cloud
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  USER B (Window 2)                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Listening to channel "post-123"                   │   │
│  │ 2. Receives "like" event                              │   │
│  │ 3. Updates like count: 4 → 5                         │   │
│  │ 4. UI updates automatically (no refresh needed!)     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Where Pusher is NOT Applied (Yet)

These features don't use Pusher yet, but could be added:

- ❌ **Post Creation** - New posts don't appear in real-time
- ❌ **Repost** - Repost counts don't update in real-time
- ❌ **Post Deletion** - Deleted posts don't disappear in real-time
- ❌ **Follow/Unfollow** - Follower counts don't update in real-time
- ❌ **Profile Updates** - Profile changes don't appear in real-time
- ❌ **Notifications** - No push notifications for new interactions

---

## 📍 Summary Table

| Feature | Broadcasts From | Listens In | Channel | Events |
|---------|---------------|------------|---------|--------|
| **Like** | `POST /api/posts/[id]/like` | `usePostLike` hook | `post-{postId}` | `like`, `unlike` |
| **Unlike** | `POST /api/posts/[id]/like` | `usePostLike` hook | `post-{postId}` | `like`, `unlike` |
| **Comment Created** | `POST /api/posts/[id]/comments`<br>`POST /api/comments/[id]/replies` | `usePostReplyCount` hook<br>`CommentsList` component | `post-{rootPostId}` | `comment-created` |
| **Comment Deleted** | `DELETE /api/comments/[id]` | `usePostReplyCount` hook<br>`CommentsList` component | `post-{rootPostId}` | `comment-deleted` |

---

## 🔍 How to Verify Pusher is Working

1. **Open browser console** (F12) - You should see:
   ```
   ✅ Pusher: Connected successfully
   ✅ Pusher: Subscribed to channel "post-xxx"
   ```

2. **Open two browser windows** with different users

3. **In Window 1:** Like a post or create a comment

4. **In Window 2:** Watch the count update automatically (no refresh!)

5. **Check console in Window 2:** You should see:
   ```
   📨 Pusher: Received event "like" on channel "post-xxx"
   ```

---

## 🚀 Future Enhancements

Pusher can be extended to:
- Real-time post creation (new posts appear instantly)
- Real-time repost updates
- Real-time notifications
- Real-time typing indicators
- Real-time online/offline status

