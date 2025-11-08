# Twitter-like Social Media App - Stage-by-Stage Development Plan

## Project Name: **heya** 🐦

---

## Overview

This document outlines a comprehensive 14-stage development plan for building a Twitter-like social media application. Each stage must be verified before proceeding to the next.

---

## Stage 1: Project Setup & Initial Configuration

### Tasks:
- [ ] Initialize Next.js 14+ project with TypeScript
- [ ] Install core dependencies:
  - `next-auth` (authentication)
  - `@prisma/client` or `mongoose` (database ORM)
  - `prisma` or MongoDB setup (database)
  - `pusher` and `pusher-js` (real-time)
  - `bcryptjs` (if needed)
  - `zod` (validation)
  - UI library (optional: `shadcn/ui`, `tailwindcss`)
- [ ] Configure project structure:
  ```
  /app
    /api
    /auth
    /(routes)
  /components
  /lib
  /types
  /prisma (or /models)
  ```
- [ ] Set up ESLint, Prettier
- [ ] Configure environment variables template (.env.example)
- [ ] Initialize git repository

### Verification Criteria:
- ✅ Project runs without errors (`npm run dev`)
- ✅ TypeScript compilation succeeds
- ✅ All dependencies installed correctly
- ✅ Folder structure matches plan
- ✅ Environment variables template created

---

## Stage 2: Database Schema Design & Setup

### Tasks:
- [ ] Choose database (PostgreSQL or MongoDB)
- [ ] Design schema for:
  - **Users**: id, userID (unique), name, email, image, provider, providerId, bio, createdAt, updatedAt
  - **Posts**: id, authorId, content, createdAt, updatedAt
  - **Comments**: id, postId, authorId, parentId (for nesting), content, createdAt
  - **Likes**: id, userId, postId, commentId (nullable), createdAt
  - **Reposts**: id, userId, postId, createdAt
  - **Follows**: id, followerId, followingId, createdAt
  - **Drafts**: id, userId, content, createdAt, updatedAt
- [ ] Set up database connection
- [ ] Create migration scripts or schemas
- [ ] Test database connection

### Verification Criteria:
- ✅ Database schema created and documented
- ✅ Database connection successful
- ✅ Can perform basic CRUD operations manually
- ✅ All relationships defined correctly

---

## Stage 3: Authentication System

### Tasks:
- [ ] Configure NextAuth with Google provider
- [ ] Configure NextAuth with GitHub provider
- [ ] Configure NextAuth with Facebook provider
- [ ] Create userID registration flow:
  - Validate userID format (length, characters)
  - Check uniqueness
  - Handle multiple OAuth providers for same userID
- [ ] Implement session management
- [ ] Create login UI components
- [ ] Create logout functionality
- [ ] Handle OAuth callbacks
- [ ] Test all three OAuth providers

### Verification Criteria:
- ✅ Can register with Google OAuth
- ✅ Can register with GitHub OAuth
- ✅ Can register with Facebook OAuth
- ✅ UserID validation works correctly
- ✅ Same person with different OAuth = different userIDs
- ✅ Session persists after page refresh
- ✅ Logout works correctly
- ✅ Cannot access protected routes without login

---

## Stage 4: Core Layout & Navigation

### Tasks:
- [ ] Design and create app logo/branding
- [ ] Build left sidebar component:
  - Home button (icon + text)
  - Profile button (icon + text)
  - Post button (highlighted, different background)
  - User section (avatar, name, userID) with logout popup
- [ ] Implement hover effects on sidebar buttons
- [ ] Create main layout wrapper
- [ ] Set up routing structure
- [ ] Make layout responsive

### Verification Criteria:
- ✅ Sidebar renders correctly
- ✅ All menu items visible and clickable
- ✅ Post button has distinct styling
- ✅ Hover effects work on all buttons
- ✅ Clicking user section shows logout option
- ✅ Layout is responsive
- ✅ Navigation routes correctly

---

## Stage 5: Profile Page

### Tasks:
- [ ] Build profile view component:
  - Background image
  - Avatar (aligned to bottom of background)
  - Name, userID (@userID)
  - Bio/description
  - Posts count, Following count, Followers count
  - Edit Profile button (for own profile)
  - Follow/Following button (for others' profiles)
- [ ] Create edit profile modal:
  - Editable fields (bio, background image, avatar)
  - Save/Cancel buttons
- [ ] Implement follow/unfollow functionality
- [ ] Create posts list on profile (user's posts and reposts)
- [ ] Implement profile routing:
  - Click @userID → navigate to profile
  - Click avatar/name in posts → navigate to profile
- [ ] Add back arrow navigation

### Verification Criteria:
- ✅ Profile page displays all required information
- ✅ Edit profile modal works (own profile)
- ✅ Can follow/unfollow other users
- ✅ Profile shows correct post count
- ✅ Profile shows correct follow/following counts
- ✅ Clicking @userID navigates to profile
- ✅ Posts list shows user's posts and reposts
- ✅ Back arrow returns to previous page

---

## Stage 6: Post Creation System

### Tasks:
- [ ] Create post modal component (triggered from sidebar "Post" button)
- [ ] Implement text input with character counter:
  - 280 character limit for text
  - Links count as 23 characters (detect and count)
  - Hashtags (#) don't count toward limit
  - Mentions (@) don't count toward limit
  - Display remaining characters
- [ ] Implement link detection:
  - Auto-detect URLs in text
  - Convert to clickable hyperlinks
  - Display in preview
- [ ] Implement hashtag parsing and highlighting
- [ ] Implement mention parsing and linking
- [ ] Create draft save functionality:
  - Save on "x" close (with confirmation modal)
  - "Save as Draft" option
  - "Discard" option
- [ ] Create drafts list UI
- [ ] Implement post submission API

### Verification Criteria:
- ✅ Post modal opens/closes correctly
- ✅ Character counter works (280 limit enforced)
- ✅ Links detected and counted as 23 chars
- ✅ Hashtags and mentions don't count toward limit
- ✅ Links are clickable in rendered posts
- ✅ Drafts can be saved and loaded
- ✅ Discard confirmation works
- ✅ Posts are created successfully

---

## Stage 7: Home Feed & Post Display

### Tasks:
- [ ] Create home feed component
- [ ] Implement "All" and "Following" tabs
- [ ] Build post display component:
  - Author avatar
  - Author name and userID (clickable)
  - Relative time display (seconds/minutes/hours/days ago, or date)
  - Post content (with links, hashtags, mentions rendered)
  - Interaction buttons (comment, repost, like)
  - Interaction counts
  - Delete option (for own posts, via "..." menu)
- [ ] Create inline post creation (expands on input focus)
- [ ] Implement post sorting (newest first)
- [ ] Add post detail view routing

### Verification Criteria:
- ✅ Home feed displays posts correctly
- ✅ "All" shows all posts
- ✅ "Following" shows only followed users' posts
- ✅ Posts sorted by newest first
- ✅ Time displays correctly (relative format)
- ✅ Clicking author navigates to profile
- ✅ Inline post creation works
- ✅ Post detail view accessible

---

## Stage 8: Post Interactions

### Tasks:
- [ ] Implement like/unlike functionality:
  - Toggle on click
  - Visual feedback (color change when liked)
  - Update count in real-time
- [ ] Build comment system:
  - Comment button opens comment input
  - Submit comment
  - Display comment count
- [ ] Implement repost functionality:
  - Repost button toggles repost
  - Update repost count
  - Reposts appear in user's profile
- [ ] Add delete post feature:
  - "..." menu on own posts
  - Delete option
  - Confirmation before delete
  - Cannot delete reposts
- [ ] Update interaction counters

### Verification Criteria:
- ✅ Like/unlike works (toggle)
- ✅ Liked posts have visual distinction
- ✅ Comments can be added
- ✅ Reposts work correctly
- ✅ Delete works for own posts only
- ✅ Cannot delete reposts
- ✅ All counters update correctly

---

## Stage 9: Recursive Comments System

### Tasks:
- [ ] Design nested comment structure
- [ ] Build comment display component (recursive)
- [ ] Implement comment routing:
  - Click comment → route to comment detail view
  - Comment detail shows comment at top
  - Replies shown below
- [ ] Create comment detail page:
  - Selected comment at top
  - All replies below
  - Can reply to comment
- [ ] Add back navigation:
  - Left arrow + "Post" button
  - Returns to previous level
- [ ] Handle deep nesting (multiple levels)

### Verification Criteria:
- ✅ Comments display in nested structure
- ✅ Clicking comment routes to comment view
- ✅ Comment detail page shows correctly
- ✅ Can reply to comments
- ✅ Back navigation works correctly
- ✅ Multiple nesting levels work

---

## Stage 10: Real-time Updates with Pusher

### Tasks:
- [ ] Set up Pusher account and get credentials
- [ ] Configure Pusher server-side (Next.js API routes)
- [ ] Configure Pusher client-side (React components)
- [ ] Implement real-time like updates:
  - Broadcast like/unlike events
  - Update UI without page refresh
- [ ] Implement real-time comment updates:
  - Broadcast new comments
  - Update comment count
- [ ] Create notification UI:
  - Show "New post/interaction" notices
  - Non-intrusive (doesn't interrupt reading)
- [ ] Test with multiple browser sessions

### Verification Criteria:
- ✅ Pusher connection established
- ✅ Likes update in real-time across sessions
- ✅ Comments update in real-time across sessions
- ✅ Notifications appear correctly
- ✅ No interference with user reading experience
- ✅ Works with 2+ concurrent users

---

## Stage 11: UI/UX Polish

**Status:** ⚠️ **PARTIALLY COMPLETE** (~60-70%)

See `docs/stage-11/STAGE11_ANALYSIS.md` for detailed analysis.

### Tasks:
- [x] Implement loading states (spinners, skeletons) ✅ **COMPLETE**
- [x] Create error handling UI (error messages, fallbacks) ✅ **COMPLETE**
- [x] Add smooth transitions and animations ✅ **MOSTLY COMPLETE**
- [⚠️] Add hover effects to all interactive elements ⚠️ **PARTIALLY COMPLETE** (many done, some missing)
- [⚠️] Improve responsive design (mobile, tablet, desktop) ⚠️ **BASIC IMPLEMENTATION** (needs testing/optimization)
- [⚠️] Ensure consistent color scheme and typography ⚠️ **APPEARS CONSISTENT** (needs verification)
- [⚠️] Polish spacing, alignment, and visual hierarchy ⚠️ **GENERALLY GOOD** (needs review)
- [ ] Add accessibility features (ARIA labels, keyboard navigation) ❌ **NOT STARTED** (HIGH PRIORITY)

### Verification Criteria:
- ⚠️ All hover effects work smoothly (most done, some missing)
- ✅ Loading states show during async operations
- ✅ Error messages are user-friendly
- ⚠️ Responsive on all screen sizes (basic implementation, needs testing)
- ✅ Animations are smooth and not jarring
- ⚠️ Consistent design language throughout (appears consistent, needs verification)
- ❌ App is accessible (accessibility features missing - HIGH PRIORITY)

### Next Steps:
1. **HIGH PRIORITY:** Implement accessibility features (ARIA labels, keyboard navigation, focus indicators)
2. Complete hover effects audit for all interactive elements
3. Test and optimize responsive design across devices
4. Create design system documentation

---

## Stage 12: RESTful API Completion

### Tasks:
- [ ] Create API routes for all operations:
  - `/api/posts` (GET, POST)
  - `/api/posts/[id]` (GET, DELETE)
  - `/api/posts/[id]/comments` (GET, POST)
  - `/api/posts/[id]/like` (POST, DELETE)
  - `/api/posts/[id]/repost` (POST, DELETE)
  - `/api/comments/[id]` (GET, DELETE)
  - `/api/comments/[id]/comments` (GET, POST)
  - `/api/comments/[id]/like` (POST, DELETE)
  - `/api/users/[userID]` (GET, PUT)
  - `/api/users/[userID]/follow` (POST, DELETE)
  - `/api/drafts` (GET, POST, DELETE)
- [ ] Implement proper error handling
- [ ] Add input validation (Zod schemas)
- [ ] Use correct HTTP status codes
- [ ] Add authentication middleware
- [ ] Document API endpoints

### Verification Criteria:
- ✅ All API endpoints created
- ✅ Proper HTTP methods used
- ✅ Error handling works correctly
- ✅ Input validation prevents invalid data
- ✅ Authentication required for protected routes
- ✅ Status codes are appropriate

---

## Stage 13: Testing & Bug Fixes

### Tasks:
- [ ] Test all OAuth flows (Google, GitHub, Facebook)
- [ ] Test all CRUD operations:
  - Create posts, comments
  - Read feeds, profiles
  - Update profile
  - Delete posts, comments, drafts
- [ ] Test real-time features with multiple users
- [ ] Test edge cases:
  - Long posts, special characters
  - Multiple hashtags/mentions
  - Deep comment nesting
  - Following/unfollowing edge cases
- [ ] Cross-browser testing
- [ ] Fix all identified bugs
- [ ] Verify all requirements from spec are met

### Verification Criteria:
- ✅ All OAuth providers work
- ✅ All CRUD operations work correctly
- ✅ Real-time features work with multiple users
- ✅ Edge cases handled gracefully
- ✅ No critical bugs
- ✅ All requirements from spec implemented

---

## Stage 14: Deployment to Vercel

### Tasks:
- [ ] Set up Vercel account
- [ ] Configure environment variables in Vercel:
  - Database connection string
  - NextAuth secrets
  - OAuth provider credentials
  - Pusher credentials
- [ ] Set up production database
- [ ] Configure Vercel project settings
- [ ] Deploy application
- [ ] Test deployed application:
  - Registration/login works
  - All features functional
  - OAuth works in production
  - Real-time features work
- [ ] Set up custom domain (optional)
- [ ] Document deployment process

### Verification Criteria:
- ✅ Application deployed successfully
- ✅ Can register and login in production
- ✅ All OAuth providers work in production
- ✅ Database connection works
- ✅ Real-time features work in production
- ✅ No production errors
- ✅ Application is accessible and functional

---

## Development Order & Dependencies

```
Stage 1 (Setup)
    ↓
Stage 2 (Database)
    ↓
Stage 3 (Auth) ──┐
    ↓            │
Stage 4 (Layout) │
    ↓            │
Stage 5 (Profile)│
    ↓            │
Stage 6 (Posting)│
    ↓            │
Stage 7 (Feed)   │
    ↓            │
Stage 8 (Interactions) ──┐
    ↓                    │
Stage 9 (Comments)       │
    ↓                    │
Stage 10 (Real-time) ────┤
    ↓                    │
Stage 11 (UI Polish)     │
    ↓                    │
Stage 12 (API) ──────────┤
    ↓                    │
Stage 13 (Testing) ──────┘
    ↓
Stage 14 (Deploy)
```

---

## Notes

- Each stage should be completed and verified before moving to the next
- Keep code organized and documented
- Commit frequently with meaningful messages
- Test as you build, don't wait until the end
- Consider user experience at every step

---

## Verification Process

For each stage:
1. Complete all tasks in the stage
2. Self-verify against verification criteria
3. Request review/verification
4. Fix any issues identified
5. Mark stage as complete
6. Proceed to next stage

---

**Ready to begin Stage 1!** 🚀

