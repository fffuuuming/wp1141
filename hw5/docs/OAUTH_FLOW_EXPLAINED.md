# OAuth Flow Explained - Comprehensive Guide

This document explains the complete OAuth authentication flow in this Next.js application, including how NextAuth.js v5 handles OAuth providers (Google and GitHub).

## Table of Contents

1. [Overview](#overview)
2. [OAuth Flow Diagram](#oauth-flow-diagram)
3. [Step-by-Step Flow](#step-by-step-flow)
4. [Code Implementation](#code-implementation)
5. [Configuration Requirements](#configuration-requirements)
6. [Troubleshooting](#troubleshooting)

---

## Overview

OAuth (Open Authorization) is an industry-standard protocol for authorization. In this application, we use OAuth 2.0 to allow users to sign in with their Google or GitHub accounts without sharing their passwords.

### Key Components

- **OAuth Provider**: Google or GitHub (the service that authenticates the user)
- **NextAuth.js**: The authentication library that handles the OAuth flow
- **Your Application**: The app that wants to authenticate users
- **Database**: Stores user accounts and sessions

---

## OAuth Flow Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │         │  Your App    │         │   Google/   │
│  (User)     │         │  (NextAuth)   │         │   GitHub    │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │  1. Click "Sign in    │                        │
       │     with Google"      │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │                       │  2. Redirect to        │
       │                       │     OAuth provider     │
       │                       │───────────────────────>│
       │                       │                        │
       │  3. Redirect to       │                        │
       │     Google/GitHub     │                        │
       │<──────────────────────│                        │
       │                       │                        │
       │  4. User logs in     │                        │
       │     and authorizes    │                        │
       │───────────────────────────────────────────────>│
       │                       │                        │
       │  5. Redirect back    │                        │
       │     with code         │                        │
       │<───────────────────────────────────────────────│
       │                       │                        │
       │  6. Redirect to       │                        │
       │     callback URL      │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │                       │  7. Exchange code     │
       │                       │     for tokens         │
       │                       │───────────────────────>│
       │                       │                        │
       │                       │  8. Return access      │
       │                       │     token & user info  │
       │                       │<───────────────────────│
       │                       │                        │
       │                       │  9. Create/update      │
       │                       │     user in database   │
       │                       │                        │
       │  10. Redirect to      │                        │
       │      home page        │                        │
       │<──────────────────────│                        │
       │                       │                        │
```

---

## Step-by-Step Flow

### Step 1: User Initiates Sign-In

**Location**: `app/auth/signin/page.tsx`

When a user clicks "Sign in with Google" or "Sign in with GitHub":

```typescript
// User clicks button
<button onClick={() => signIn('google')}>
  Sign in with Google
</button>
```

**What happens:**
- The `signIn()` function from NextAuth is called with the provider name
- NextAuth generates a unique state parameter (CSRF protection)
- NextAuth creates an authorization URL

### Step 2: Redirect to OAuth Provider

**Location**: `lib/auth.ts` → NextAuth handles this automatically

NextAuth redirects the user to the OAuth provider's authorization page:

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_GOOGLE_CLIENT_ID&
  redirect_uri=https://wp-hw5-heya.vercel.app/api/auth/callback/google&
  response_type=code&
  scope=openid%20email%20profile&
  state=RANDOM_STATE_STRING
```

**Key Parameters:**
- `client_id`: Your OAuth app's client ID
- `redirect_uri`: Where to send the user after authorization (must match exactly)
- `response_type=code`: We want an authorization code
- `scope`: What permissions we're requesting
- `state`: CSRF protection token

### Step 3: User Authorizes

The user sees the OAuth provider's login page (Google/GitHub). They:
1. Enter their credentials
2. Review the permissions requested
3. Click "Allow" or "Authorize"

### Step 4: OAuth Provider Redirects Back

After authorization, the provider redirects back to your callback URL:

```
https://wp-hw5-heya.vercel.app/api/auth/callback/google?
  code=AUTHORIZATION_CODE&
  state=RANDOM_STATE_STRING
```

**What's in the URL:**
- `code`: Authorization code (short-lived, ~10 minutes)
- `state`: The same state we sent (NextAuth verifies this)

### Step 5: NextAuth Handles Callback

**Location**: `app/api/auth/[...nextauth]/route.ts`

```typescript
// This route handles: /api/auth/callback/google
export const { GET, POST } = handlers
```

NextAuth:
1. Verifies the `state` parameter (CSRF protection)
2. Extracts the `code` from the URL
3. Calls the `signIn` callback (if configured)

### Step 6: Exchange Code for Tokens

**Location**: NextAuth handles this internally

NextAuth makes a server-to-server request to exchange the code for tokens:

```http
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET&
code=AUTHORIZATION_CODE&
redirect_uri=https://wp-hw5-heya.vercel.app/api/auth/callback/google&
grant_type=authorization_code
```

**Response:**
```json
{
  "access_token": "ya29.a0AfH6...",
  "token_type": "Bearer",
  "expires_in": 3599,
  "refresh_token": "1//0g...",
  "id_token": "eyJhbGc..."
}
```

### Step 7: Fetch User Profile

**Location**: NextAuth handles this automatically

NextAuth uses the access token to fetch user information:

```http
GET https://www.googleapis.com/oauth2/v2/userinfo
Authorization: Bearer ya29.a0AfH6...
```

**Response:**
```json
{
  "id": "123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

### Step 8: Custom Sign-In Callback

**Location**: `lib/auth.ts` → `callbacks.signIn`

```typescript
async signIn({ user, account, profile }) {
  // Check if user already exists with this provider + providerId
  let existingUser = await prisma.user.findFirst({
    where: {
      provider: account.provider,        // "google" or "github"
      providerId: account.providerAccountId,  // OAuth provider's user ID
    },
  })
  
  if (existingUser) {
    // User exists - allow sign in
    return true
  }
  
  // New user - will be created by adapter
  return true
}
```

**What this does:**
- Checks if a user with this OAuth account already exists
- Prevents account linking (each provider = separate account)
- Returns `true` to allow sign-in

### Step 9: Create User (if new)

**Location**: `lib/auth.ts` → `customAdapter.createUser`

If this is a new user:

```typescript
async createUser(user: any) {
  // Generate temporary userID
  const tempUserID = await generateTempUserID()  // "temp_1234567890_abc123"
  
  // Create user in database
  const createdUser = await prisma.user.create({
    data: {
      ...user,
      userID: tempUserID,
      provider: '',  // Will be synced from Account
      providerId: '',  // Will be synced from Account
    },
  })
  
  return createdUser
}
```

**Database Records Created:**
1. **User** table: Basic user info
2. **Account** table: OAuth provider connection
3. **Session** table: Active session

### Step 10: Link Account

**Location**: `lib/auth.ts` → `customAdapter.linkAccount`

```typescript
async linkAccount(account: any) {
  // Link OAuth account to user
  const linkedAccount = await baseAdapter.linkAccount(account)
  
  // Sync provider info to User model
  await prisma.user.update({
    where: { id: userId },
    data: {
      provider: account.provider,  // "google" or "github"
      providerId: account.providerAccountId,  // OAuth user ID
    },
  })
  
  return linkedAccount
}
```

### Step 11: Create Session

**Location**: NextAuth handles this automatically

NextAuth creates a session in the database:

```typescript
// Session record in database
{
  sessionToken: "abc123...",
  userId: "user-db-id",
  expires: "2024-01-15T10:00:00Z"
}
```

### Step 12: Session Callback

**Location**: `lib/auth.ts` → `callbacks.session`

```typescript
async session({ session, user }) {
  // Fetch full user data including userID
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      userID: true,  // The custom userID
      name: true,
      email: true,
      image: true,
    },
  })
  
  // Add userID to session
  session.user.id = dbUser.id
  session.user.userID = dbUser.userID
  
  return session
}
```

### Step 13: Redirect to Home

NextAuth redirects the user to the home page (or the page they were trying to access).

---

## Code Implementation

### 1. NextAuth Configuration

**File**: `lib/auth.ts`

```typescript
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions: NextAuthConfig = {
  // Database adapter (handles user/account/session storage)
  adapter: customAdapter,
  
  // Secret for encrypting tokens
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  
  // Trust host (required for Vercel)
  trustHost: true,
  
  // OAuth providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  
  // Callbacks
  callbacks: {
    async signIn({ user, account, profile }) {
      // Validate and allow sign-in
      return true
    },
    async session({ session, user }) {
      // Add custom data to session
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
```

### 2. Route Handler

**File**: `app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/lib/auth'

// This handles ALL NextAuth routes:
// - GET /api/auth/signin
// - GET /api/auth/signout
// - GET /api/auth/callback/google
// - GET /api/auth/callback/github
// - GET /api/auth/session
// - POST /api/auth/signin
export const { GET, POST } = handlers
```

### 3. Sign-In Page

**File**: `app/auth/signin/page.tsx`

```typescript
'use client'

import { signIn } from 'next-auth/react'

export default function SignInPage() {
  return (
    <div>
      <button onClick={() => signIn('google')}>
        Sign in with Google
      </button>
      <button onClick={() => signIn('github')}>
        Sign in with GitHub
      </button>
    </div>
  )
}
```

### 4. Using Session

**File**: Any component or API route

```typescript
import { auth } from '@/lib/auth'

// In API route
export async function GET() {
  const session = await auth()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  return Response.json({ user: session.user })
}
```

---

## Configuration Requirements

### Environment Variables

**Required for NextAuth:**
```env
# NextAuth v5 supports both naming conventions
AUTH_SECRET=your-secret-key-here
# OR
NEXTAUTH_SECRET=your-secret-key-here

AUTH_URL=https://wp-hw5-heya.vercel.app
# OR
NEXTAUTH_URL=https://wp-hw5-heya.vercel.app
```

**Required for Google OAuth:**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Required for GitHub OAuth:**
```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### OAuth App Configuration

#### Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID
3. **Authorized redirect URIs** must include:
   ```
   https://wp-hw5-heya.vercel.app/api/auth/callback/google
   ```

#### GitHub OAuth App

1. Go to [GitHub Settings → Developer settings](https://github.com/settings/developers)
2. Create new OAuth App
3. **Authorization callback URL** must be:
   ```
   https://wp-hw5-heya.vercel.app/api/auth/callback/github
   ```

**⚠️ IMPORTANT**: Callback URLs must match **exactly** (including protocol, domain, and path).

---

## Troubleshooting

### Error: "Configuration Error"

**Cause**: NextAuth can't find required configuration.

**Check:**
1. ✅ `AUTH_SECRET` or `NEXTAUTH_SECRET` is set
2. ✅ `AUTH_URL` or `NEXTAUTH_URL` is set to your production URL
3. ✅ At least one OAuth provider has both `CLIENT_ID` and `CLIENT_SECRET` set
4. ✅ You've **redeployed** after adding environment variables

**Solution:**
```bash
# 1. Generate secret
openssl rand -base64 32

# 2. Add to Vercel:
#    - AUTH_SECRET = (generated secret)
#    - AUTH_URL = https://wp-hw5-heya.vercel.app
#    - GOOGLE_CLIENT_ID = (your ID)
#    - GOOGLE_CLIENT_SECRET = (your secret)
#    - GITHUB_CLIENT_ID = (your ID)
#    - GITHUB_CLIENT_SECRET = (your secret)

# 3. Clear build cache and redeploy
```

### Error: "OAuthCallback" or "Callback Error"

**Cause**: Callback URL mismatch or OAuth app misconfiguration.

**Check:**
1. ✅ OAuth app callback URL matches exactly: `https://wp-hw5-heya.vercel.app/api/auth/callback/{provider}`
2. ✅ `AUTH_URL` or `NEXTAUTH_URL` is set correctly
3. ✅ OAuth app is in the same Google Cloud project (for Google)

### Error: "AccessDenied"

**Cause**: User denied authorization or OAuth app is restricted.

**Check:**
1. ✅ OAuth app is not in testing mode (Google)
2. ✅ User email is added to test users (if in testing mode)
3. ✅ OAuth app has correct scopes/permissions

### Debugging Tips

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for `[Auth]` prefixed messages
   - Check for error messages

2. **Verify Environment Variables**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure all variables are set for **Production** environment
   - Check for typos or extra spaces

3. **Test Locally**:
   ```bash
   # Create .env.local with same variables
   npm run dev
   # Test OAuth flow locally
   ```

4. **Check OAuth App Settings**:
   - Verify callback URLs match exactly
   - Check that client ID and secret are correct
   - Ensure OAuth app is not deleted or disabled

---

## Common Issues and Solutions

### Issue: Environment variables not loading

**Solution**: 
- Environment variables are only loaded during build
- **You must redeploy** after adding/updating variables
- Clear build cache before redeploying

### Issue: "Invalid redirect URI"

**Solution**:
- Check OAuth app callback URL matches exactly
- No trailing slashes
- Must use `https://` (not `http://`)
- Must match your `AUTH_URL` or `NEXTAUTH_URL`

### Issue: Works locally but not in production

**Solution**:
- Check that environment variables are set for **Production** in Vercel
- Verify `AUTH_URL` or `NEXTAUTH_URL` is set to production URL (not localhost)
- Ensure OAuth app callback URLs point to production URL

---

## Next Steps

After understanding the OAuth flow:

1. **Verify Configuration**: Check all environment variables are set
2. **Test OAuth Apps**: Ensure callback URLs are correct
3. **Redeploy**: Clear cache and redeploy on Vercel
4. **Check Logs**: Monitor Vercel logs for any errors
5. **Test Flow**: Try signing in and watch the logs

For more help, see:
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
