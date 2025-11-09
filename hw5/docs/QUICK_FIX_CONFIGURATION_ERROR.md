# Quick Fix: Configuration Error

If you're seeing the "Configuration Error" page, follow these steps **in order**:

## Step 1: Verify Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Verify these variables exist and are set for **Production**:

### Required Variables (Check ALL):

```
✅ AUTH_SECRET (or NEXTAUTH_SECRET)
✅ AUTH_URL (or NEXTAUTH_URL) = https://wp-hw5-heya.vercel.app
✅ GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_SECRET
✅ GITHUB_CLIENT_ID
✅ GITHUB_CLIENT_SECRET
```

**Important Notes:**
- Variable names are **case-sensitive**
- No extra spaces before/after values
- Values must not be empty

## Step 2: Add AUTH_SECRET (if using NEXTAUTH_SECRET)

NextAuth v5 **prefers** `AUTH_SECRET` over `NEXTAUTH_SECRET`. Even though both work, add `AUTH_SECRET`:

1. In Vercel Environment Variables
2. Click "Add New"
3. Name: `AUTH_SECRET`
4. Value: (copy the same value from `NEXTAUTH_SECRET`)
5. Environments: Select **Production**, **Preview**, **Development**
6. Click "Save"

Do the same for `AUTH_URL` (copy value from `NEXTAUTH_URL`).

## Step 3: Clear Build Cache

**This is critical!** Environment variables are cached during builds.

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General**
2. Scroll to **"Build & Development Settings"**
3. Click **"Clear Build Cache"**
4. Confirm the action

## Step 4: Redeploy

After clearing cache, redeploy:

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**
4. Wait for deployment to complete (usually 1-2 minutes)

## Step 5: Check Build Logs

After redeployment, check the logs:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"Build Logs"** or **"Function Logs"**
4. Look for `[Auth]` prefixed messages:

**Good signs:**
```
[Auth] ✅ Secret found: Set
[Auth] ✅ Auth URL found: https://wp-hw5-heya.vercel.app
[Auth] ✅ Google OAuth provider configured
[Auth] ✅ GitHub OAuth provider configured
[Auth] ✅ 2 OAuth provider(s) configured
```

**Bad signs:**
```
[Auth] ❌ CRITICAL: AUTH_SECRET or NEXTAUTH_SECRET must be set!
[Auth] ⚠️ Google OAuth credentials not found.
[Auth] ❌ No OAuth providers configured!
```

## Step 6: Test Debug Endpoint

Visit this URL to check configuration:
```
https://wp-hw5-heya.vercel.app/api/auth/debug
```

This will show you exactly which variables are set/missing.

**Expected response:**
```json
{
  "summary": {
    "hasSecret": true,
    "hasUrl": true,
    "hasGoogle": true,
    "hasGitHub": true,
    "hasAnyProvider": true,
    "isConfigured": true
  }
}
```

If `isConfigured` is `false`, check which variables are missing.

## Step 7: Verify OAuth App Callback URLs

### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Under **"Authorized redirect URIs"**, ensure you have:
   ```
   https://wp-hw5-heya.vercel.app/api/auth/callback/google
   ```
5. **No trailing slash!**
6. Must be **exactly** this URL

### GitHub OAuth:
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Find your OAuth app
3. Under **"Authorization callback URL"**, ensure it's:
   ```
   https://wp-hw5-heya.vercel.app/api/auth/callback/github
   ```
4. **No trailing slash!**
5. Must be **exactly** this URL

## Common Mistakes

### ❌ Wrong: Environment variable set for wrong environment
- Variable set for "Development" but not "Production"
- **Fix**: Set for **Production** (or all environments)

### ❌ Wrong: Typo in variable name
- `NEXTAUTH_SECRET` vs `NEXTAUTH_SECRET` (extra space)
- `GOOGLE_CLIENT_ID` vs `GOOGLE_CLIENTID` (missing underscore)
- **Fix**: Copy variable names exactly

### ❌ Wrong: Empty values
- Variable exists but value is empty or just spaces
- **Fix**: Ensure value is not empty

### ❌ Wrong: Didn't redeploy after adding variables
- Added variables but didn't redeploy
- **Fix**: Always redeploy after adding/updating variables

### ❌ Wrong: Callback URL mismatch
- OAuth app callback URL doesn't match exactly
- **Fix**: Must match `https://wp-hw5-heya.vercel.app/api/auth/callback/{provider}` exactly

## Still Not Working?

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → **Logs**
   - Look for errors or `[Auth]` messages
   - Share the error messages

2. **Verify Secret Format**:
   - Secret should be a long random string
   - Generated with: `openssl rand -base64 32`
   - Should be ~44 characters long

3. **Test Locally**:
   ```bash
   # Create .env.local with same variables
   cp .env.example .env.local
   # Add all variables
   npm run dev
   # Test OAuth locally
   ```

4. **Check NextAuth Version**:
   ```bash
   npm list next-auth
   # Should show: next-auth@5.0.0-beta.30
   ```

## Quick Checklist

Before asking for help, verify:

- [ ] `AUTH_SECRET` or `NEXTAUTH_SECRET` is set in Vercel (Production)
- [ ] `AUTH_URL` or `NEXTAUTH_URL` is set to `https://wp-hw5-heya.vercel.app` (Production)
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set (Production)
- [ ] `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set (Production)
- [ ] Build cache has been cleared
- [ ] Application has been redeployed after adding variables
- [ ] OAuth app callback URLs match exactly
- [ ] Checked build logs for `[Auth]` messages
- [ ] Tested `/api/auth/debug` endpoint

If all of these are checked and it still doesn't work, the issue might be:
- NextAuth v5 beta bug
- Vercel environment variable loading issue
- Database connection issue (check `DATABASE_URL`)

