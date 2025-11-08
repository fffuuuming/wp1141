# Stage 10: Real-time Updates with Pusher - Implementation Plan

## Overview

Implement real-time updates using Pusher to broadcast like/unlike and comment events across all connected clients, providing a seamless real-time experience without page refreshes.

---

## Tasks Breakdown

### Step 10.1: Pusher Server-Side Configuration
- [x] Create Pusher server-side utility (`lib/pusher.ts`)
- [x] Implement singleton pattern for Pusher instance
- [x] Create broadcast helper function
- [x] Define channel and event name constants

### Step 10.2: Pusher Client-Side Configuration
- [x] Create Pusher client-side utility (`lib/pusher-client.ts`)
- [x] Implement singleton pattern for Pusher client
- [x] Create `usePusherChannel` hook for subscribing to events
- [x] Create `usePusherChannelEvents` hook for multiple events

### Step 10.3: Broadcast Like/Unlike Events
- [x] Update POST `/api/posts/[id]/like` to broadcast events
- [x] Broadcast like events with postId, userId, count, and liked status
- [x] Broadcast unlike events with same data structure

### Step 10.4: Broadcast Comment Events
- [x] Update POST `/api/posts/[id]/comments` to broadcast comment created events
- [x] Update POST `/api/comments/[id]/replies` to broadcast comment created events
- [x] Update DELETE `/api/comments/[id]` to broadcast comment deleted events
- [x] Include postId, commentId, userId, and count in events

### Step 10.5: Real-time Like Updates
- [x] Update `usePostLike` hook to listen for Pusher events
- [x] Update like count in real-time when other users like/unlike
- [x] Avoid double updates from current user's actions

### Step 10.6: Real-time Comment Updates
- [x] Create `usePostReplyCount` hook for real-time reply count updates
- [x] Update `PostCard` to use real-time reply count
- [x] Update `CommentsList` to listen for comment created/deleted events
- [x] Refresh comments list when new comments are created by other users

### Step 10.7: Notification UI (Optional Enhancement)
- [x] Create `NotificationToast` component
- [x] Create `NotificationManager` component (placeholder for future use)
- [x] Non-intrusive notification design

---

## Implementation Details

### Pusher Configuration

**Server-side** (`lib/pusher.ts`):
- Singleton Pusher instance
- Graceful handling when credentials are missing
- Channel naming: `post-{postId}`
- Event types: `like`, `unlike`, `comment-created`, `comment-deleted`

**Client-side** (`lib/pusher-client.ts`):
- Singleton Pusher client instance
- React hooks for subscribing to channels
- Automatic cleanup on unmount

### Event Broadcasting

**Like Events**:
- Channel: `post-{postId}`
- Events: `like`, `unlike`
- Data: `{ postId, userId, count, liked }`

**Comment Events**:
- Channel: `post-{postId}` (root post)
- Events: `comment-created`, `comment-deleted`
- Data: `{ postId, commentId, userId, count }`

### Real-time Updates

**Like Updates**:
- `usePostLike` hook listens to `like` and `unlike` events
- Updates count only if event is from another user
- Prevents double updates from optimistic UI

**Comment Updates**:
- `usePostReplyCount` hook listens to comment events
- Updates reply count in real-time
- `CommentsList` refreshes when comments are created/deleted by others

---

## Environment Variables

### Required Server-Side Variables
```env
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"
```

### Required Client-Side Variables (NEXT_PUBLIC_*)
```env
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
```

**Note**: The Pusher key and cluster must be exposed to the client via `NEXT_PUBLIC_*` prefix.

---

## Files Created/Modified

### Created Files
- `lib/pusher.ts` - Server-side Pusher configuration
- `lib/pusher-client.ts` - Client-side Pusher configuration
- `hooks/usePostReplyCount.ts` - Hook for real-time reply count updates
- `components/ui/NotificationToast.tsx` - Notification component

### Modified Files
- `app/api/posts/[id]/like/route.ts` - Added Pusher broadcasting
- `app/api/posts/[id]/comments/route.ts` - Added Pusher broadcasting
- `app/api/comments/[id]/replies/route.ts` - Added Pusher broadcasting
- `app/api/comments/[id]/route.ts` - Added Pusher broadcasting
- `hooks/usePostInteractions.ts` - Added Pusher event listeners
- `components/PostCard.tsx` - Uses real-time reply count
- `components/CommentsList.tsx` - Listens for real-time comment events
- `hooks/index.ts` - Exported new hook
- `components/ui/index.ts` - Exported notification component

---

## Testing Checklist

- [ ] Pusher connection established (check browser console)
- [ ] Like count updates in real-time across multiple browser sessions
- [ ] Unlike count updates in real-time across multiple browser sessions
- [ ] Comment count updates in real-time when comments are created
- [ ] Comment count updates in real-time when comments are deleted
- [ ] Comments list refreshes when new comments are created by other users
- [ ] No double updates when user performs their own actions
- [ ] Works with 2+ concurrent users
- [ ] Graceful degradation when Pusher credentials are missing

---

## Next Steps

After completing Stage 10:
- Stage 11: UI/UX Polish
- Stage 12: RESTful API Completion
- Stage 13: Testing & Bug Fixes
- Stage 14: Deployment to Vercel

