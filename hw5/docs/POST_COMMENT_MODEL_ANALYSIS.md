# Post vs Comment Model Analysis

## Summary

**Finding**: Posts and comments use the **SAME model** (`Post`), but the codebase has inconsistent usage.

## Database Schema

The Prisma schema only defines a **`Post` model** with:
- `parentId` field for self-referential replies
- Comments are stored as Posts with `parentId !== null`
- Top-level posts have `parentId === null`

```prisma
model Post {
  id        String   @id @default(cuid())
  authorId  String
  content   String
  parentId  String?  // Self-referential: null for posts, non-null for comments
  // ...
  parent   Post?  @relation("PostReplies", fields: [parentId], references: [id])
  replies  Post[] @relation("PostReplies")
}
```

## Code Inconsistency

### ✅ Correct Usage (Using `prisma.post`)
- `/api/posts/[id]/comments` - Creates replies as Posts
- `/api/posts/[id]/route.ts` - Uses Posts
- `/api/feed/route.ts` - Uses Posts
- `/api/user/[userID]/posts` - Uses Posts

### ❌ Incorrect Usage (Using `prisma.comment` - DOESN'T EXIST)
- `/api/comments/[id]/route.ts` - Uses `prisma.comment` (BUG)
- `/api/comments/[id]/replies/route.ts` - Uses `prisma.comment` (BUG)

## Impact

**Critical Bug**: Routes using `prisma.comment` will fail at runtime because the model doesn't exist in the schema.

## Solution

1. **✅ Fixed the bug**: Updated all `prisma.comment` references to use `prisma.post`
2. **✅ Created query builders**: Added helper functions in `lib/db/queries/posts.ts` to:
   - Distinguish between posts and comments
   - Find root posts by traversing parent chain
   - Handle nested replies recursively
3. **✅ Updated routes**: Fixed all API routes to use `prisma.post` consistently

## Implementation

### Query Helpers Created:
- `findRootPost()` - Traverses parent chain to find original post
- `isTopLevelPost()` - Checks if post is top-level (not a comment)
- `isComment()` - Checks if post is a comment/reply
- `getPostRepliesRecursive()` - Fetches nested replies

### Routes Fixed:
- `/api/comments/[id]/route.ts` - Now uses `prisma.post`
- `/api/comments/[id]/replies/route.ts` - Now uses `prisma.post`
- `/app/comment/[id]/page.tsx` - Now uses `prisma.post`
- `scripts/clear-database.ts` - Removed `prisma.comment` reference

## Recommendation

Since posts and comments are the same model:
- ✅ Use `Post` model consistently
- ✅ Use `parentId === null` to distinguish top-level posts
- ✅ Use `parentId !== null` for comments/replies
- ✅ Use query helpers to make the distinction clear in code

