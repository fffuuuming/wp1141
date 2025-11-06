# Testing Guide - Stages 1-3

This guide provides step-by-step instructions for testing all currently implemented stages.

---

## Prerequisites

Before testing, ensure you have:
- Node.js installed (v18+)
- PostgreSQL database (local or cloud)
- OAuth app credentials (Google, GitHub, Facebook) - optional for basic testing

---

## Stage 1: Project Setup & Configuration

### Test 1.1: Verify Project Builds

```bash
# Navigate to project directory
cd /Users/fffuuuming/Desktop/study/master/master_2_2/wp/wp1141/hw5

# Install dependencies (if not already done)
npm install

# Build the project
npm run build
```

**Expected Result:**
- ✅ Build completes successfully
- ✅ No TypeScript errors
- ✅ No compilation errors

### Test 1.2: Verify Development Server

```bash
# Start development server
npm run dev
```

**Expected Result:**
- ✅ Server starts on http://localhost:3000
- ✅ No errors in console
- ✅ Home page loads (shows "Welcome to heya")

**Verify:**
- Open http://localhost:3000 in browser
- Should see "Welcome to heya" message

### Test 1.3: Verify Project Structure

```bash
# Check key directories exist
ls -la app/
ls -la lib/
ls -la prisma/
ls -la components/
```

**Expected Result:**
- ✅ All directories exist
- ✅ Key files present (layout.tsx, page.tsx, etc.)

---

## Stage 2: Database Schema Design & Setup

### Test 2.1: Verify Prisma Schema

```bash
# Validate Prisma schema
npx prisma validate
```

**Expected Result:**
- ✅ Schema is valid
- ✅ No validation errors

### Test 2.2: Generate Prisma Client

```bash
# Generate Prisma Client
npm run db:generate
```

**Expected Result:**
- ✅ Prisma Client generated successfully
- ✅ Types available in `node_modules/@prisma/client`

### Test 2.3: Set Up Database Connection

**Option A: Using Local PostgreSQL**

1. Create database:
```bash
psql postgres
CREATE DATABASE heya;
CREATE USER heya_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE heya TO heya_user;
\q
```

2. Update `.env`:
```env
DATABASE_URL="postgresql://heya_user:your_password@localhost:5432/heya?schema=public"
```

**Option B: Using Supabase (Free Cloud)**

1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Update `.env`:
```env
DATABASE_URL="your-supabase-connection-string"
```

### Test 2.4: Push Schema to Database

```bash
# Push schema to database (creates tables)
npm run db:push
```

**Expected Result:**
- ✅ Tables created successfully
- ✅ No errors

**Verify Tables:**
```bash
# Open Prisma Studio to view database
npm run db:studio
```

**Expected Tables:**
- ✅ users
- ✅ posts
- ✅ comments
- ✅ likes
- ✅ reposts
- ✅ follows
- ✅ drafts

### Test 2.5: Verify Database Connection

```bash
# Test connection (create a simple test)
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('✅ Database connected'))
  .catch((e) => console.error('❌ Connection failed:', e))
  .finally(() => prisma.\$disconnect());
"
```

**Expected Result:**
- ✅ "Database connected" message
- ✅ No connection errors

---

## Stage 3: Authentication System

### Test 3.1: Set Up OAuth Credentials

**For each provider (Google, GitHub, Facebook), you need:**

1. **Google OAuth:**
   - Go to https://console.cloud.google.com
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **GitHub OAuth:**
   - Go to https://github.com/settings/developers
   - Create a new OAuth App
   - Add callback URL: `http://localhost:3000/api/auth/callback/github`

3. **Facebook OAuth:**
   - Go to https://developers.facebook.com
   - Create a new app
   - Add Facebook Login product
   - Add redirect URI: `http://localhost:3000/api/auth/callback/facebook`

**Update `.env` file:**
```env
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Test 3.2: Test Sign In Page

```bash
# Start development server
npm run dev
```

**Steps:**
1. Open http://localhost:3000/auth/signin
2. Verify the page loads correctly
3. Check that OAuth buttons are visible:
   - ✅ "Continue with Google" button
   - ✅ "Continue with GitHub" button
   - ✅ "Continue with Facebook" button

**Expected Result:**
- ✅ Sign in page renders without errors
- ✅ All three OAuth buttons visible
- ✅ No console errors

### Test 3.3: Test OAuth Flow (With Credentials)

**Note:** This requires actual OAuth credentials set up.

**Steps:**
1. Click on an OAuth provider button (e.g., "Continue with Google")
2. You should be redirected to the OAuth provider's login page
3. After logging in, you'll be redirected back
4. If it's a new user, you should see the UserID registration form
5. Enter a valid UserID (3-20 chars, alphanumeric + underscore)
6. Submit the form

**Expected Result:**
- ✅ OAuth redirect works
- ✅ User is created in database
- ✅ UserID registration form appears for new users
- ✅ UserID validation works (try invalid formats)
- ✅ After registration, user is redirected to home

**Verify in Database:**
```bash
npm run db:studio
```

Check the `users` table:
- ✅ New user record created
- ✅ userID is set (not temp_*)
- ✅ provider and providerId are set
- ✅ OAuth data (name, email, image) is stored

### Test 3.4: Test UserID Validation

**Test Invalid UserIDs:**
1. Try UserID shorter than 3 characters → Should show error
2. Try UserID longer than 20 characters → Should show error
3. Try UserID with special characters → Should show error
4. Try UserID starting with a number → Should show error
5. Try an already taken UserID → Should show error

**Test Valid UserID:**
1. Try "testuser123" → Should work
2. Try "user_name" → Should work
3. Try "TestUser" → Should work (case-insensitive uniqueness)

**Expected Result:**
- ✅ All validation rules work correctly
- ✅ Error messages are clear
- ✅ Uniqueness check works

### Test 3.5: Test Session Management

**Steps:**
1. Sign in with OAuth
2. Complete UserID registration (if new user)
3. Navigate to different pages
4. Refresh the page
5. Check browser console for session data

**Expected Result:**
- ✅ Session persists after page refresh
- ✅ User data is available across pages
- ✅ Session cookie is set

**Verify Session:**
```javascript
// In browser console (after signing in)
// Check if session exists
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

**Expected Output:**
```json
{
  "user": {
    "id": "...",
    "userID": "testuser123",
    "name": "Your Name",
    "email": "your@email.com",
    "image": "https://..."
  }
}
```

### Test 3.6: Test Logout

**Steps:**
1. Sign in with OAuth
2. Use the logout button (or call `signOut()`)
3. Verify you're redirected to sign in page
4. Try accessing protected routes

**Expected Result:**
- ✅ Logout works correctly
- ✅ Session is cleared
- ✅ Redirected to sign in page
- ✅ Cannot access protected routes after logout

### Test 3.7: Test Multiple OAuth Providers

**Test Scenario:** Same person using different OAuth providers

**Steps:**
1. Sign in with Google → Choose UserID "testuser"
2. Logout
3. Sign in with GitHub → Choose UserID "testuser2"
4. Verify both accounts exist separately

**Expected Result:**
- ✅ Same person with different OAuth = different userIDs
- ✅ Both accounts are separate in database
- ✅ Each has unique userID

**Verify in Database:**
- ✅ Two separate user records
- ✅ Different provider values
- ✅ Different userIDs

### Test 3.8: Test Error Handling

**Test Error Scenarios:**
1. Try signing in with invalid OAuth credentials → Should show error
2. Try accessing `/api/auth/register-userid` without session → Should return 401
3. Try registering UserID without being signed in → Should fail

**Expected Result:**
- ✅ Error pages display correctly
- ✅ API routes return proper error codes
- ✅ User-friendly error messages

---

## Quick Test Checklist

### Stage 1 ✅
- [ ] Project builds successfully
- [ ] Development server starts
- [ ] Home page loads

### Stage 2 ✅
- [ ] Prisma schema validates
- [ ] Database connection works
- [ ] Tables created successfully
- [ ] Can view database in Prisma Studio

### Stage 3 ✅
- [ ] Sign in page loads
- [ ] OAuth buttons visible
- [ ] OAuth flow works (with credentials)
- [ ] UserID registration works
- [ ] UserID validation works
- [ ] Session persists
- [ ] Logout works
- [ ] Multiple OAuth providers work separately

---

## Troubleshooting

### Database Connection Issues

**Error:** "Can't reach database server"
- ✅ Check DATABASE_URL in `.env`
- ✅ Verify database is running
- ✅ Check firewall settings
- ✅ Verify credentials

**Error:** "Table does not exist"
- ✅ Run `npm run db:push`
- ✅ Check if DATABASE_URL is correct

### OAuth Issues

**Error:** "OAuth callback error"
- ✅ Check OAuth credentials in `.env`
- ✅ Verify redirect URIs match
- ✅ Check NEXTAUTH_URL is correct
- ✅ Ensure NEXTAUTH_SECRET is set

**Error:** "UserID already taken"
- ✅ This is expected behavior
- ✅ Try a different UserID
- ✅ Check database for existing UserIDs

### Build Issues

**Error:** TypeScript errors
- ✅ Run `npm run build` to see all errors
- ✅ Check type definitions in `types/`
- ✅ Verify all imports are correct

**Error:** Prerendering errors
- ✅ Check for `'use client'` directive
- ✅ Verify `export const dynamic = 'force-dynamic'` for dynamic pages

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Stage 1-3 are verified and working
2. ✅ Ready to proceed to Stage 4: Core Layout & Navigation
3. ✅ Database is set up and ready
4. ✅ Authentication is functional

---

## Testing Without OAuth Credentials

If you don't have OAuth credentials yet, you can still test:
- ✅ Stage 1 (Project setup)
- ✅ Stage 2 (Database schema)
- ✅ Stage 3 UI (Sign in page renders)
- ⚠️ Stage 3 OAuth flow (requires credentials)

The authentication system is fully implemented and will work once OAuth credentials are configured.

---

**Last Updated:** After Stage 3 Completion

