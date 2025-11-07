# Stage 6: Post Creation System - Implementation Plan

## Overview

Build a complete post creation system with character counting, link detection, hashtag/mention parsing, and draft functionality.

---

## Tasks Breakdown

### Step 6.1: Post Modal Component
- [ ] Create modal component triggered from sidebar "Post" button
- [ ] Modal with text input area
- [ ] Close button (X) with confirmation if content exists
- [ ] Character counter display
- [ ] Post button (disabled when over limit)

### Step 6.2: Character Counter Logic
- [ ] 280 character limit for text
- [ ] Links count as 23 characters (detect URLs)
- [ ] Hashtags (#) don't count toward limit
- [ ] Mentions (@) don't count toward limit
- [ ] Display remaining characters
- [ ] Show warning when approaching limit
- [ ] Disable post button when over limit

### Step 6.3: Link Detection & Conversion
- [ ] Auto-detect URLs in text
- [ ] Convert to clickable hyperlinks in preview
- [ ] Count links as 23 characters each
- [ ] Display links in preview

### Step 6.4: Hashtag Parsing
- [ ] Detect hashtags (#hashtag)
- [ ] Highlight hashtags in preview
- [ ] Hashtags don't count toward character limit
- [ ] Make hashtags clickable (future: navigate to hashtag page)

### Step 6.5: Mention Parsing
- [ ] Detect mentions (@userID)
- [ ] Link mentions to user profiles
- [ ] Mentions don't count toward character limit
- [ ] Make mentions clickable (navigate to profile)

### Step 6.6: Draft Functionality
- [ ] Save draft on "X" close (with confirmation modal)
- [ ] "Save as Draft" button
- [ ] "Discard" button (with confirmation)
- [ ] Load draft when opening modal
- [ ] Draft auto-save (optional: debounced)

### Step 6.7: Drafts List UI
- [ ] Create drafts list component
- [ ] Display saved drafts
- [ ] Load draft into post modal
- [ ] Delete draft option

### Step 6.8: Post Submission API
- [ ] Create POST /api/posts route
- [ ] Validate content length
- [ ] Create post in database
- [ ] Return created post
- [ ] Handle errors

---

## Character Counting Rules

### Base Limit: 280 characters

### What Counts:
- Regular text characters: 1 character each
- URLs/Links: 23 characters each (regardless of actual length)
- Spaces and punctuation: 1 character each

### What Doesn't Count:
- Hashtags (#hashtag): Entire hashtag doesn't count
- Mentions (@userID): Entire mention doesn't count

### Examples:
- "Hello world" = 11 characters
- "Check out https://example.com" = "Check out " (11) + link (23) = 34 characters
- "Hello #world" = "Hello " (6) + #world (0) = 6 characters
- "@john Hello" = @john (0) + " Hello" (6) = 6 characters

---

## API Routes to Create

1. `POST /api/posts` - Create a new post
2. `GET /api/drafts` - Get user's drafts
3. `POST /api/drafts` - Save a draft
4. `PUT /api/drafts/[id]` - Update a draft
5. `DELETE /api/drafts/[id]` - Delete a draft

---

## Components to Create

1. `components/PostModal.tsx` - Main post creation modal
2. `components/DraftList.tsx` - List of saved drafts
3. `components/CharacterCounter.tsx` - Character counting logic
4. `lib/postUtils.ts` - Utility functions for link/hashtag/mention parsing

---

## Implementation Order

1. **Post Modal Component** (Step 6.1) - Basic modal structure
2. **Character Counter** (Step 6.2) - Core counting logic
3. **Link Detection** (Step 6.3) - URL detection and counting
4. **Hashtag/Mention Parsing** (Step 6.4-6.5) - Parsing and highlighting
5. **Draft Functionality** (Step 6.6) - Save/load drafts
6. **Drafts List** (Step 6.7) - UI for managing drafts
7. **Post API** (Step 6.8) - Backend for creating posts

---

## Verification Checklist

- [ ] Post modal opens from sidebar button
- [ ] Character counter works correctly
- [ ] Links detected and counted as 23 chars
- [ ] Hashtags don't count toward limit
- [ ] Mentions don't count toward limit
- [ ] Post button disabled when over limit
- [ ] Links converted to clickable hyperlinks
- [ ] Hashtags highlighted in preview
- [ ] Mentions linked to profiles
- [ ] Draft save works (on close, Save as Draft)
- [ ] Draft load works
- [ ] Drafts list displays correctly
- [ ] Post submission works
- [ ] Post appears in feed after creation

---

## Notes

- Character counting must be real-time as user types
- Link detection should handle various URL formats
- Hashtags and mentions should be validated (format check)
- Drafts should persist across sessions
- Post creation should refresh the feed

