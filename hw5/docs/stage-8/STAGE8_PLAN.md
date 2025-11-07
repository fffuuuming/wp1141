# Stage 8: Post Interactions - Implementation Plan

## Overview

Implement complete interaction system for posts: likes, comments, and reposts, with real-time counter updates and visual feedback.

---

## Tasks Breakdown

### Step 8.1: Like/Unlike Functionality
- [ ] Create POST /api/posts/[id]/like route (toggle like)
- [ ] Create GET /api/posts/[id]/liked route (check if liked)
- [ ] Update PostCard to show liked state
- [ ] Add visual feedback (color change when liked)
- [ ] Update like count in real-time
- [ ] Handle like/unlike toggle

### Step 8.2: Comment System
- [ ] Create POST /api/posts/[id]/comments route (create comment)
- [ ] Create GET /api/posts/[id]/comments route (get comments)
- [ ] Create DELETE /api/comments/[id] route (delete comment)
- [ ] Build CommentInput component
- [ ] Display comments on post detail page
- [ ] Show comment count on PostCard
- [ ] Support nested/reply comments (optional for now)

### Step 8.3: Repost Functionality
- [ ] Create POST /api/posts/[id]/repost route (toggle repost)
- [ ] Create GET /api/posts/[id]/reposted route (check if reposted)
- [ ] Update PostCard to show reposted state
- [ ] Add visual feedback (color change when reposted)
- [ ] Update repost count in real-time
- [ ] Handle repost/unrepost toggle

### Step 8.4: Update Interaction Counters
- [ ] Update like count after like/unlike
- [ ] Update comment count after comment creation/deletion
- [ ] Update repost count after repost/unrepost
- [ ] Optimistic UI updates for better UX

---

## API Routes to Create

1. `POST /api/posts/[id]/like` - Toggle like on a post
2. `GET /api/posts/[id]/liked` - Check if current user liked the post
3. `POST /api/posts/[id]/comments` - Create a comment
4. `GET /api/posts/[id]/comments` - Get comments for a post
5. `DELETE /api/comments/[id]` - Delete a comment
6. `POST /api/posts/[id]/repost` - Toggle repost on a post
7. `GET /api/posts/[id]/reposted` - Check if current user reposted the post

---

## Components to Create/Update

1. `components/CommentInput.tsx` - Comment creation input
2. `components/CommentCard.tsx` - Individual comment display
3. `components/CommentsList.tsx` - List of comments
4. Update `components/PostCard.tsx` - Add interactive buttons
5. Update `app/post/[id]/page.tsx` - Add comments display

---

## Implementation Order

1. **Like/Unlike** (Step 8.1-8.2) - Core interaction
2. **Comment System** (Step 8.3-8.5) - Full comment functionality
3. **Repost** (Step 8.6-8.7) - Repost functionality
4. **Counter Updates** (Step 8.4) - Real-time updates

---

## Verification Checklist

- [ ] Like/unlike works (toggle)
- [ ] Liked posts have visual distinction (red heart)
- [ ] Like count updates in real-time
- [ ] Comments can be added
- [ ] Comments display correctly
- [ ] Comment count updates
- [ ] Can delete own comments
- [ ] Reposts work correctly
- [ ] Reposted posts have visual distinction
- [ ] Repost count updates
- [ ] All interaction counters update correctly

---

## Notes

- Use optimistic UI updates for better UX
- Handle loading states for all interactions
- Show error messages if interactions fail
- Comments should be ordered by newest first
- Support basic comment deletion (own comments only for now)

