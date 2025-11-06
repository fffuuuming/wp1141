# Authentication Flow Documentation

## Overview

The authentication system uses NextAuth.js with a custom adapter that ensures **each OAuth provider creates a separate account**, even if they share the same email address.

## Key Features

1. **Provider Isolation**: Different OAuth providers (Google, GitHub, Facebook) always create separate accounts
2. **Temporary UserIDs**: New users get a temporary `userID` (format: `temp_{timestamp}_{random}`)
3. **UserID Registration**: Users must set a permanent, unique `userID` after first OAuth login
4. **UserID-based Login**: Users can log in using their `userID`, which automatically redirects to the correct OAuth provider

## Authentication Flow

### 1. New User Registration (OAuth)

```
User clicks "Sign in with Google/GitHub/Facebook"
  ↓
OAuth provider authentication
  ↓
NextAuth callback → Custom Adapter
  ↓
createUser() → Creates user with temporary userID
  ↓
createUser event → Syncs provider info from Account
  ↓
Redirect to /auth/signin
  ↓
User sees "Choose Your UserID" form
  ↓
User sets permanent userID
  ↓
Redirect to home page
```

### 2. Existing User Login (OAuth)

```
User clicks "Sign in with Google/GitHub/Facebook"
  ↓
OAuth provider authentication
  ↓
NextAuth callback → Custom Adapter
  ↓
getUserByAccount() → Finds user by provider + providerAccountId
  ↓
Session created
  ↓
Redirect to home page
```

### 3. UserID-based Login

```
User enters userID
  ↓
POST /api/user/lookup → Finds user by userID
  ↓
Returns provider information
  ↓
Redirect to OAuth provider (Google/GitHub/Facebook)
  ↓
OAuth authentication
  ↓
Session created
  ↓
Redirect to home page
```

## Custom Adapter Methods

### `createUser(user)`
- Generates a unique temporary `userID`
- Creates user with provider defaults
- Called when a new OAuth account is created

### `linkAccount(account)`
- **Prevents account linking** by creating a new user instead
- Ensures different providers always create separate accounts
- Called if NextAuth attempts to link accounts

### `getUserByEmail(email)`
- **Always returns `null`**
- Prevents email-based account linking
- Forces creation of new accounts for different providers

### `getUserByAccount({ provider, providerAccountId })`
- **Only method that finds users**
- Finds users by exact `provider + providerAccountId` combination
- Ensures provider isolation

## Database Schema

### User Model
- `id`: Unique identifier (cuid)
- `userID`: Unique username (can be temporary)
- `email`: Not unique (same email can be used with different providers)
- `provider`: OAuth provider name (e.g., "google", "github", "facebook")
- `providerId`: Provider's user ID
- `@@unique([provider, providerId])`: Ensures same provider + ID = same user

### Account Model (NextAuth)
- Links OAuth accounts to users
- `@@unique([provider, providerAccountId])`: Ensures uniqueness per provider

## Session Management

- **Strategy**: Database (sessions stored in DB)
- **Max Age**: 30 days
- **Update Age**: 24 hours (session refreshed every 24h of activity)

## API Routes

### `POST /api/auth/register-userid`
- Registers a permanent `userID` for a user
- Validates format and uniqueness
- Only works for users with temporary `userID`

### `POST /api/user/lookup`
- Looks up a user by `userID`
- Returns provider information for OAuth redirect
- Falls back to Account model if provider not set

### `GET /api/user/list`
- Lists all registered users (excluding temporary userIDs)
- Used for quick login on sign-in page

## Testing the Flow

### Clean Test (Fresh Database)

1. **Clear database**:
   ```bash
   npm run db:clear
   ```

2. **Test new user registration**:
   - Go to `/auth/signin`
   - Click "Sign in with GitHub"
   - Complete OAuth flow
   - Set a `userID` (e.g., "test_user_1")
   - Should redirect to home page

3. **Test same email, different provider**:
   - Sign out
   - Go to `/auth/signin`
   - Click "Sign in with Google" (same email)
   - Should create a NEW account (not link to GitHub account)
   - Set a different `userID` (e.g., "test_user_2")
   - Should redirect to home page

4. **Test userID-based login**:
   - Sign out
   - Enter "test_user_1" in the UserID login form
   - Should redirect to GitHub OAuth
   - After authentication, should log into GitHub account

5. **Verify account separation**:
   ```bash
   npm run check:accounts
   ```
   - Should show 2 separate users (one for GitHub, one for Google)
   - Each should have only 1 account

## Troubleshooting

### Accounts are being linked together

**Solution**: Run the unlink script:
```bash
npm run unlink:accounts
```

### Provider info not synced

**Solution**: Run the fix script:
```bash
npm run fix:providers
```

### Check account status

**Solution**: Check accounts:
```bash
npm run check:accounts
```

## Files

- `lib/auth.ts`: Main authentication configuration
- `app/auth/signin/page.tsx`: Sign-in page with OAuth and UserID login
- `app/api/auth/register-userid/route.ts`: UserID registration endpoint
- `app/api/user/lookup/route.ts`: UserID lookup endpoint
- `app/api/user/list/route.ts`: User listing endpoint

