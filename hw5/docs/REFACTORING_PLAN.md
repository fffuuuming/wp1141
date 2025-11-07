# Refactoring Plan for heya Social Media Platform

## Executive Summary

This document outlines a comprehensive refactoring plan for the heya social media platform. The refactoring focuses on improving code maintainability, reducing duplication, enhancing type safety, and establishing better architectural patterns.

**Current State Analysis:**
- Next.js 16 with App Router
- TypeScript with Prisma ORM
- NextAuth for authentication
- PostgreSQL database
- Multiple API routes with repetitive patterns
- Components with duplicated logic
- Scattered type definitions

**Refactoring Goals:**
1. Reduce code duplication by 40-50%
2. Improve type safety and consistency
3. Establish clear architectural patterns
4. Enhance maintainability and testability
5. Improve error handling and validation
6. Create reusable utilities and hooks

---

## Phase 1: Foundation & Infrastructure

### 1.1 Type System Consolidation

**Problem:**
- Types are scattered across components
- Inconsistent interfaces for similar entities (Post, Comment)
- No shared type definitions for API responses
- Duplicate type definitions

**Solution:**
Create a centralized type system:

```
types/
  ├── api/
  │   ├── responses.ts      # Standard API response types
  │   ├── requests.ts       # API request types
  │   └── errors.ts         # Error response types
  ├── entities/
  │   ├── user.ts           # User-related types
  │   ├── post.ts           # Post-related types
  │   ├── comment.ts        # Comment-related types
  │   └── draft.ts           # Draft-related types
  ├── components/
  │   └── props.ts          # Shared component prop types
  └── index.ts              # Re-export all types
```

**Benefits:**
- Single source of truth for types
- Better IDE autocomplete
- Easier refactoring
- Type consistency across the app

**Estimated Impact:** High
**Effort:** Medium (2-3 days)

---

### 1.2 API Client Abstraction

**Problem:**
- Direct `fetch` calls scattered throughout components
- No centralized error handling
- Inconsistent request/response handling
- No request interceptors or retry logic

**Solution:**
Create a typed API client:

```
lib/
  ├── api/
  │   ├── client.ts         # Base API client with interceptors
  │   ├── endpoints.ts      # Typed endpoint definitions
  │   ├── posts.ts          # Post API methods
  │   ├── comments.ts       # Comment API methods
  │   ├── users.ts          # User API methods
  │   └── drafts.ts         # Draft API methods
```

**Features:**
- Automatic authentication header injection
- Centralized error handling
- Request/response transformation
- Type-safe endpoints
- Retry logic for failed requests

**Benefits:**
- Consistent API usage
- Better error handling
- Easier to mock for testing
- Type safety for all API calls

**Estimated Impact:** High
**Effort:** Medium (3-4 days)

---

### 1.3 API Route Middleware & Helpers

**Problem:**
- Repetitive authentication checks in every route
- Duplicate error handling patterns
- Inconsistent response formats
- No input validation middleware
- Similar Prisma query patterns

**Solution:**
Create reusable middleware and helpers:

```
lib/
  ├── api/
  │   ├── middleware/
  │   │   ├── auth.ts       # Authentication middleware
  │   │   ├── validate.ts   # Input validation middleware
  │   │   └── error.ts       # Error handling middleware
  │   ├── helpers/
  │   │   ├── response.ts   # Standardized response helpers
  │   │   ├── validation.ts # Validation helpers
  │   │   └── queries.ts     # Prisma query builders
  │   └── handlers/
  │       └── wrapper.ts     # Route handler wrapper
```

**Example Usage:**
```typescript
// Before
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ... rest of logic
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// After
export const POST = withAuth(async (request, session) => {
  const body = await validateRequest(request, postSchema)
  // ... rest of logic
})
```

**Benefits:**
- 50-70% reduction in route boilerplate
- Consistent error handling
- Automatic validation
- Better type safety

**Estimated Impact:** Very High
**Effort:** Medium (4-5 days)

---

## Phase 2: Component Refactoring

### 2.1 Custom Hooks for Common Operations

**Problem:**
- Duplicate logic for like/repost checking
- Repeated fetch patterns
- Similar state management across components
- No reusable interaction logic

**Solution:**
Create custom hooks:

```
hooks/
  ├── usePostInteractions.ts  # Like, repost, delete operations
  ├── useComments.ts          # Comment fetching and creation
  ├── useUser.ts              # User data fetching
  ├── useFeed.ts              # Feed data fetching
  ├── useDrafts.ts            # Draft management
  └── useOptimisticUpdate.ts  # Optimistic UI updates
```

**Example:**
```typescript
// Before (in PostCard)
const [liked, setLiked] = useState(false)
const [likeCount, setLikeCount] = useState(post._count.likes)
// ... 50+ lines of like handling logic

// After
const { liked, likeCount, toggleLike, loading } = usePostLike(post.id, post._count.likes)
```

**Benefits:**
- 60-80% reduction in component complexity
- Reusable interaction logic
- Consistent behavior across components
- Easier testing

**Estimated Impact:** Very High
**Effort:** Medium (3-4 days)

---

### 2.2 Component Composition & Shared UI

**Problem:**
- Duplicate UI patterns (avatars, timestamps, action buttons)
- Similar card layouts
- Repeated loading/error states
- No shared UI primitives

**Solution:**
Create shared UI components:

```
components/
  ├── ui/                    # Base UI components
  │   ├── Avatar.tsx
  │   ├── Button.tsx
  │   ├── LoadingSpinner.tsx
  │   ├── ErrorMessage.tsx
  │   └── Timestamp.tsx
  ├── shared/                # Shared feature components
  │   ├── PostActions.tsx     # Like, repost, comment buttons
  │   ├── PostHeader.tsx      # Author info + timestamp
  │   ├── PostContent.tsx     # Content rendering
  │   └── DeleteButton.tsx
```

**Benefits:**
- Consistent UI across the app
- Easier to maintain and update
- Better accessibility
- Reduced bundle size

**Estimated Impact:** High
**Effort:** Medium (2-3 days)

---

### 2.3 Component Type Safety

**Problem:**
- Props interfaces defined inline
- Inconsistent prop naming
- No shared base types
- Missing optional prop handling

**Solution:**
- Use centralized prop types from `types/components/props.ts`
- Create base component interfaces
- Use discriminated unions for variants

**Benefits:**
- Better type inference
- Consistent component APIs
- Easier refactoring

**Estimated Impact:** Medium
**Effort:** Low (1-2 days)

---

## Phase 3: Database & Business Logic

### 3.1 Prisma Query Builders

**Problem:**
- Repeated Prisma query patterns
- Similar include/select patterns across routes
- No query optimization
- Inconsistent data fetching

**Solution:**
Create query builder utilities:

```
lib/
  ├── db/
  │   ├── queries/
  │   │   ├── posts.ts       # Post query builders
  │   │   ├── comments.ts    # Comment query builders
  │   │   ├── users.ts        # User query builders
  │   │   └── feed.ts         # Feed query builders
  │   └── selectors/
  │       ├── user.ts        # User field selectors
  │       ├── post.ts        # Post field selectors
  │       └── comment.ts     # Comment field selectors
```

**Example:**
```typescript
// Before
const post = await prisma.post.findUnique({
  where: { id },
  include: {
    author: {
      select: {
        id: true,
        userID: true,
        name: true,
        image: true,
      },
    },
    _count: {
      select: {
        likes: true,
        replies: true,
        reposts: true,
      },
    },
  },
})

// After
const post = await getPostWithAuthor(id)
```

**Benefits:**
- Consistent data fetching
- Easier to optimize queries
- Single place to update query logic
- Better type inference

**Estimated Impact:** High
**Effort:** Medium (2-3 days)

---

### 3.2 Service Layer

**Problem:**
- Business logic mixed with API routes
- No separation of concerns
- Difficult to test business logic
- Duplicate business rules

**Solution:**
Create service layer:

```
lib/
  ├── services/
  │   ├── post.service.ts    # Post business logic
  │   ├── comment.service.ts # Comment business logic
  │   ├── user.service.ts     # User business logic
  │   ├── feed.service.ts     # Feed business logic
  │   └── interaction.service.ts # Like/repost logic
```

**Benefits:**
- Separation of concerns
- Testable business logic
- Reusable across API routes and server components
- Easier to maintain

**Estimated Impact:** High
**Effort:** Medium (3-4 days)

---

### 3.3 Validation Layer

**Problem:**
- Validation logic scattered
- Inconsistent validation rules
- No schema-based validation
- Manual validation in routes

**Solution:**
Use Zod for schema validation:

```
lib/
  ├── validation/
  │   ├── schemas/
  │   │   ├── post.schema.ts
  │   │   ├── comment.schema.ts
  │   │   ├── user.schema.ts
  │   │   └── draft.schema.ts
  │   └── middleware.ts      # Validation middleware
```

**Benefits:**
- Type-safe validation
- Consistent validation rules
- Automatic error messages
- Runtime type checking

**Estimated Impact:** High
**Effort:** Low (1-2 days) - Zod already in dependencies

---

## Phase 4: Code Organization & Structure

### 4.1 Feature-Based Organization (Optional)

**Problem:**
- Files organized by type (components/, lib/, app/)
- Related files scattered
- Hard to find related code
- Difficult to understand feature boundaries

**Solution (Optional - Major Refactor):**
Consider feature-based structure:

```
app/
  ├── (features)/
  │   ├── posts/
  │   │   ├── components/
  │   │   ├── api/
  │   │   ├── hooks/
  │   │   └── types.ts
  │   ├── comments/
  │   ├── users/
  │   └── feed/
  └── (shared)/
      ├── components/
      └── lib/
```

**Note:** This is a major refactor. Consider if the current structure is causing issues.

**Benefits:**
- Clear feature boundaries
- Easier to find related code
- Better code organization
- Easier to scale

**Estimated Impact:** Medium
**Effort:** High (5-7 days)

---

### 4.2 Constants & Configuration

**Problem:**
- Magic numbers and strings scattered
- No centralized configuration
- Inconsistent limits and rules

**Solution:**
Create constants file:

```
lib/
  ├── constants/
  │   ├── limits.ts          # Character limits, pagination
  │   ├── validation.ts      # Validation rules
  │   └── config.ts           # App configuration
```

**Benefits:**
- Single source of truth
- Easier to update
- Better maintainability

**Estimated Impact:** Low
**Effort:** Low (1 day)

---

## Phase 5: Error Handling & Logging

### 5.1 Centralized Error Handling

**Problem:**
- Inconsistent error messages
- No error logging strategy
- Generic error responses
- No error tracking

**Solution:**
Create error handling system:

```
lib/
  ├── errors/
  │   ├── types.ts           # Error type definitions
  │   ├── handlers.ts        # Error handlers
  │   └── logger.ts          # Error logging
```

**Benefits:**
- Consistent error responses
- Better debugging
- User-friendly error messages
- Error tracking capability

**Estimated Impact:** Medium
**Effort:** Low (1-2 days)

---

## Phase 6: Testing Infrastructure

### 6.1 Testing Setup

**Problem:**
- No testing infrastructure
- Difficult to test components
- No API route testing
- No integration tests

**Solution:**
Set up testing infrastructure:

```
__tests__/
  ├── unit/
  │   ├── lib/
  │   └── components/
  ├── integration/
  │   └── api/
  └── setup.ts
```

**Tools:**
- Jest + React Testing Library
- MSW for API mocking
- Prisma test database

**Benefits:**
- Confidence in refactoring
- Catch regressions
- Better code quality

**Estimated Impact:** High
**Effort:** Medium (2-3 days)

---

## Implementation Priority

### High Priority (Do First)
1. **API Route Middleware & Helpers** (Phase 1.3)
   - Biggest impact on code reduction
   - Improves consistency immediately
   - Foundation for other improvements

2. **Custom Hooks for Common Operations** (Phase 2.1)
   - Reduces component complexity significantly
   - Improves maintainability
   - Better user experience

3. **Type System Consolidation** (Phase 1.1)
   - Foundation for type safety
   - Enables better tooling
   - Prevents bugs

### Medium Priority (Do Second)
4. **API Client Abstraction** (Phase 1.2)
5. **Prisma Query Builders** (Phase 3.1)
6. **Service Layer** (Phase 3.2)
7. **Shared UI Components** (Phase 2.2)

### Low Priority (Do When Time Permits)
8. **Validation Layer** (Phase 3.3)
9. **Error Handling** (Phase 5.1)
10. **Constants & Configuration** (Phase 4.2)
11. **Testing Infrastructure** (Phase 6.1)
12. **Feature-Based Organization** (Phase 4.1) - Optional

---

## Migration Strategy

### Incremental Refactoring
1. **Start with new code**: Apply new patterns to new features
2. **Refactor incrementally**: Update existing code as you touch it
3. **Create parallel implementations**: Build new utilities alongside old code
4. **Gradual migration**: Migrate routes/components one at a time
5. **Remove old code**: Once new patterns are proven, remove old code

### Backward Compatibility
- Keep existing API routes working during migration
- Maintain component interfaces during refactoring
- Use feature flags if needed
- Test thoroughly before removing old code

---

## Success Metrics

### Code Quality Metrics
- **Lines of Code Reduction**: Target 30-40% reduction
- **Code Duplication**: Reduce from ~25% to <10%
- **Type Coverage**: Increase to 95%+
- **Test Coverage**: Target 70%+ for critical paths

### Developer Experience Metrics
- **Time to add new feature**: Reduce by 40-50%
- **Time to fix bugs**: Reduce by 30-40%
- **Onboarding time**: Reduce by 50%

### Performance Metrics
- **Bundle size**: Monitor for increases
- **API response times**: Should remain same or improve
- **Page load times**: Should remain same or improve

---

## Risks & Mitigation

### Risks
1. **Breaking changes**: Could break existing functionality
   - **Mitigation**: Incremental migration, thorough testing

2. **Time investment**: Refactoring takes time
   - **Mitigation**: Prioritize high-impact changes, do incrementally

3. **Learning curve**: Team needs to learn new patterns
   - **Mitigation**: Good documentation, code reviews, examples

4. **Scope creep**: Refactoring can expand beyond original scope
   - **Mitigation**: Stick to plan, track progress

---

## Timeline Estimate

### Phase 1 (Foundation): 2-3 weeks
- Type System: 2-3 days
- API Client: 3-4 days
- API Middleware: 4-5 days

### Phase 2 (Components): 1-2 weeks
- Custom Hooks: 3-4 days
- Shared UI: 2-3 days
- Component Types: 1-2 days

### Phase 3 (Database & Logic): 1-2 weeks
- Query Builders: 2-3 days
- Service Layer: 3-4 days
- Validation: 1-2 days

### Phase 4-6 (Polish): 1 week
- Error Handling: 1-2 days
- Constants: 1 day
- Testing Setup: 2-3 days

**Total Estimated Time: 5-8 weeks** (depending on team size and priorities)

---

## Next Steps

1. **Review this plan** with the team
2. **Prioritize phases** based on current needs
3. **Start with Phase 1.3** (API Middleware) for quick wins
4. **Set up tracking** for metrics
5. **Begin incremental migration**

---

## Appendix: Code Examples

### Example: API Route Before/After

**Before:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { content } = body
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }
    // ... rest of logic
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
```

**After:**
```typescript
import { withAuth } from '@/lib/api/middleware/auth'
import { validateRequest } from '@/lib/api/middleware/validate'
import { postSchema } from '@/lib/validation/schemas/post.schema'
import { createPost } from '@/lib/services/post.service'
import { successResponse } from '@/lib/api/helpers/response'

export const POST = withAuth(async (request, session) => {
  const { content } = await validateRequest(request, postSchema)
  const post = await createPost(session.user.id, content)
  return successResponse({ post })
})
```

### Example: Component Before/After

**Before:**
```typescript
export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  // ... 50+ lines of like handling logic
  // ... similar logic for repost
  // ... similar logic for delete
}
```

**After:**
```typescript
export function PostCard({ post }: PostCardProps) {
  const { liked, likeCount, toggleLike } = usePostLike(post.id, post._count.likes)
  const { reposted, repostCount, toggleRepost } = usePostRepost(post.id, post._count.reposts)
  const { deletePost } = usePostDelete(post.id)
  
  return (
    <Card>
      <PostHeader author={post.author} createdAt={post.createdAt} />
      <PostContent content={post.content} />
      <PostActions
        liked={liked}
        likeCount={likeCount}
        onLike={toggleLike}
        reposted={reposted}
        repostCount={repostCount}
        onRepost={toggleRepost}
        replyCount={post._count.replies}
        onDelete={isOwnPost ? deletePost : undefined}
      />
    </Card>
  )
}
```

---

**Document Version:** 1.0
**Last Updated:** 2024
**Author:** Refactoring Analysis

