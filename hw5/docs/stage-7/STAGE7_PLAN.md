# Stage 7: Home Feed & Post Display - Implementation Plan

## Overview

Build a complete home feed system that displays posts from all users or only followed users, with proper post rendering, interaction buttons, and post detail views.

---

## Tasks Breakdown

### Step 7.1: Home Feed API
- [ ] Create GET /api/feed route
- [ ] Support "all" and "following" filters
- [ ] Fetch posts with author info
- [ ] Include engagement counts (likes, comments, reposts)
- [ ] Sort by newest first
- [ ] Handle pagination (optional for now)

### Step 7.2: PostCard Component
- [ ] Create PostCard component
- [ ] Display author avatar
- [ ] Display author name and userID (clickable)
- [ ] Display relative time (e.g., "2h ago", "3d ago")
- [ ] Render post content with links/hashtags/mentions
- [ ] Show engagement counts
- [ ] Add interaction buttons (like, comment, repost) - UI only for now
- [ ] Add "..." menu for own posts (delete option)

### Step 7.3: Home Feed Component
- [ ] Create HomeFeed component
- [ ] Implement "All" and "Following" tabs
- [ ] Fetch and display posts
- [ ] Handle loading states
- [ ] Handle empty states
- [ ] Refresh after post creation

### Step 7.4: Inline Post Creation
- [ ] Add post input at top of feed
- [ ] Expand on focus
- [ ] Use same PostModal or create inline version
- [ ] Refresh feed after posting

### Step 7.5: Post Detail View
- [ ] Create /post/[id] route
- [ ] Display single post with all details
- [ ] Show comments (basic display for now)
- [ ] Navigation from feed to detail

### Step 7.6: Content Rendering
- [ ] Render links as clickable
- [ ] Render hashtags as highlighted
- [ ] Render mentions as profile links
- [ ] Use parsePostContent utility

---

## API Routes to Create

1. `GET /api/feed?filter=all|following` - Get home feed posts
   - Query params: `filter` (all or following)
   - Returns: Array of posts with author and engagement data

2. `GET /api/posts/[id]` - Get single post detail
   - Returns: Post with author, engagement, and comments

---

## Components to Create

1. `components/PostCard.tsx` - Individual post display
2. `components/HomeFeed.tsx` - Main feed component with tabs
3. `components/PostDetail.tsx` - Single post detail view
4. `app/post/[id]/page.tsx` - Post detail page

---

## Implementation Order

1. **Home Feed API** (Step 7.1) - Backend for fetching posts
2. **PostCard Component** (Step 7.2) - Display individual posts
3. **Home Feed Component** (Step 7.3) - Main feed with tabs
4. **Content Rendering** (Step 7.6) - Links/hashtags/mentions
5. **Inline Post Creation** (Step 7.4) - Post input at top
6. **Post Detail View** (Step 7.5) - Single post page

---

## Verification Checklist

- [ ] Home feed displays posts correctly
- [ ] "All" tab shows all posts
- [ ] "Following" tab shows only followed users' posts
- [ ] Posts sorted by newest first
- [ ] Time displays correctly (relative format)
- [ ] Clicking author navigates to profile
- [ ] Links are clickable in posts
- [ ] Hashtags are highlighted
- [ ] Mentions link to profiles
- [ ] Interaction buttons visible (functionality in Stage 8)
- [ ] Post detail view accessible
- [ ] Empty states handled

---

## Notes

- Interaction buttons (like, comment, repost) will be functional in Stage 8
- For now, just display the buttons and counts
- Post detail view can show basic comment structure (full functionality in Stage 8)
- Use `date-fns` for relative time formatting
- Use `parsePostContent` from `lib/postUtils.ts` for content rendering

