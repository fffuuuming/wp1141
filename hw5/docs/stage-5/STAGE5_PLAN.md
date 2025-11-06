# Stage 5: Profile Page - Implementation Plan

## Overview

Build a complete profile page that displays user information, allows editing own profile, and enables following/unfollowing other users.

---

## Tasks Breakdown

### Step 5.1: Profile View Component
- [ ] Background image (full width, customizable)
- [ ] Avatar (aligned to bottom of background, overlapping)
- [ ] Name and userID (@userID)
- [ ] Bio/description
- [ ] Stats: Posts count, Following count, Followers count
- [ ] Edit Profile button (for own profile)
- [ ] Follow/Following button (for others' profiles)

### Step 5.2: API Routes
- [ ] `GET /api/user/[userID]` - Fetch user profile data
- [ ] `PUT /api/user/[userID]` - Update user profile (own profile only)
- [ ] `POST /api/user/[userID]/follow` - Follow a user
- [ ] `DELETE /api/user/[userID]/follow` - Unfollow a user
- [ ] `GET /api/user/[userID]/posts` - Get user's posts and reposts

### Step 5.3: Edit Profile Modal
- [ ] Modal component with form
- [ ] Editable fields:
  - Bio (textarea)
  - Background image URL (input)
  - Avatar image URL (input)
- [ ] Save/Cancel buttons
- [ ] Validation and error handling

### Step 5.4: Follow/Unfollow Functionality
- [ ] Check if current user follows target user
- [ ] Follow button (if not following)
- [ ] Following button (if already following)
- [ ] Update follow counts in real-time

### Step 5.5: Posts List
- [ ] Display user's posts
- [ ] Display user's reposts
- [ ] Order by creation date (newest first)
- [ ] Placeholder for post cards (will be implemented in Stage 6/7)

### Step 5.6: Navigation
- [ ] Back arrow button (returns to previous page)
- [ ] Click @userID → navigate to profile (future: in posts)
- [ ] Click avatar/name → navigate to profile (future: in posts)

---

## Database Queries Needed

### Get User Profile
```prisma
user.findUnique({
  where: { userID },
  include: {
    _count: {
      select: {
        posts: true,
        following: true,
        followers: true,
      }
    }
  }
})
```

### Check Follow Status
```prisma
follow.findFirst({
  where: {
    followerId: currentUserId,
    followingId: targetUserId,
  }
})
```

### Get User Posts
```prisma
post.findMany({
  where: { authorId: userId },
  orderBy: { createdAt: 'desc' },
  include: {
    author: true,
    _count: {
      select: {
        likes: true,
        comments: true,
        reposts: true,
      }
    }
  }
})
```

### Get User Reposts
```prisma
repost.findMany({
  where: { userId },
  include: {
    post: {
      include: {
        author: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          }
        }
      }
    }
  },
  orderBy: { createdAt: 'desc' }
})
```

---

## UI Components to Create

1. `components/ProfileHeader.tsx` - Profile header with background, avatar, info
2. `components/EditProfileModal.tsx` - Modal for editing profile
3. `components/FollowButton.tsx` - Follow/Following button component
4. `components/ProfilePosts.tsx` - List of user's posts and reposts
5. `app/profile/[userID]/page.tsx` - Main profile page (update existing)

---

## Implementation Order

1. **API Routes** (Step 5.2) - Foundation for data fetching
2. **Profile View Component** (Step 5.1) - Display user information
3. **Edit Profile Modal** (Step 5.3) - Allow editing own profile
4. **Follow/Unfollow** (Step 5.4) - Social features
5. **Posts List** (Step 5.5) - Display user content
6. **Navigation** (Step 5.6) - Back button and routing

---

## Verification Checklist

- [ ] Profile page displays all required information
- [ ] Edit profile modal works (own profile)
- [ ] Can follow/unfollow other users
- [ ] Profile shows correct post count
- [ ] Profile shows correct follow/following counts
- [ ] Clicking @userID navigates to profile
- [ ] Posts list shows user's posts and reposts
- [ ] Back arrow returns to previous page
- [ ] Own profile shows "Edit Profile" button
- [ ] Others' profiles show "Follow/Following" button

---

## Notes

- Profile page should be accessible at `/profile/[userID]`
- Only the profile owner can edit their profile
- Follow/unfollow should update counts immediately
- Posts list will show placeholders until Stage 6/7 is complete
- Background image and avatar should have fallbacks if not set

