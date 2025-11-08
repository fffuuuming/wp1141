# Fix Production OAuth Error

This guide will help you fix the "Configuration Error" when signing in with GitHub/Google on your production Vercel deployment.

---

## The Problem

The error shows `http://localhost:3000` because:
1. Your GitHub OAuth app callback URL is still set to localhost
2. Your `NEXTAUTH_URL` in Vercel might not be set correctly
3. OAuth providers require exact callback URL matches

---

## Solution: Update 3 Things

### Step 1: Update GitHub OAuth Callback URL

1. **Go to GitHub OAuth Apps**: [https://github.com/settings/developers](https://github.com/settings/developers)
2. **Click on your OAuth App** (or create one if you don't have it)
3. **Find "Authorization callback URL"** field
4. **Update it to your production URL**:
   ```
   https://wp-hw5-heya.vercel.app/api/auth/callback/github
   ```
5. **Click "Update application"**
6. **Save the changes**

**Important:** 
- Remove any `http://localhost:3000` callback URLs (or keep them for local development)
- Make sure the URL is exactly: `https://wp-hw5-heya.vercel.app/api/auth/callback/github`
- Use `https://` not `http://`

---

### Step 2: Update Google OAuth Callback URL (if using Google)

1. **Go to Google Cloud Console**: [https://console.cloud.google.com](https://console.cloud.google.com)
2. **Navigate to**: APIs & Services → Credentials
3. **Click on your OAuth 2.0 Client ID**
4. **Find "Authorized redirect URIs"** section
5. **Add your production URL**:
   ```
   https://wp-hw5-heya.vercel.app/api/auth/callback/google
   ```
6. **Click "Save"**

**Note:** You can keep localhost URLs for local development, just add the production one.

---

### Step 3: Update NEXTAUTH_URL in Vercel

1. **Go to Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. **Click on your project**: `wp-hw5-heya`
3. **Go to**: Settings → Environment Variables
4. **Find `NEXTAUTH_URL`**:
   - If it exists: Click **Edit** → Change to: `https://wp-hw5-heya.vercel.app`
   - If it doesn't exist: Click **Add New** → 
     - Name: `NEXTAUTH_URL`
     - Value: `https://wp-hw5-heya.vercel.app`
     - Environment: Select **Production** (and Preview/Development if needed)
5. **Click "Save"**

---

### Step 4: Verify Environment Variables in Vercel

Make sure these are all set in Vercel:

- ✅ `NEXTAUTH_URL` = `https://wp-hw5-heya.vercel.app`
- ✅ `NEXTAUTH_SECRET` = (your secret key)
- ✅ `GITHUB_CLIENT_ID` = (your GitHub client ID)
- ✅ `GITHUB_CLIENT_SECRET` = (your GitHub client secret)
- ✅ `GOOGLE_CLIENT_ID` = (if using Google)
- ✅ `GOOGLE_CLIENT_SECRET` = (if using Google)

---

### Step 5: Redeploy Your App

After updating the OAuth callback URLs and environment variables:

**Option A: Automatic (if GitHub integration is set up)**
```bash
# Just push a commit (even a small change)
git commit --allow-empty -m "Trigger redeploy for OAuth fix"
git push origin main
```

**Option B: Manual Redeploy**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

**Option C: Using Vercel CLI**
```bash
vercel --prod
```

---

## Verify It Works

1. **Wait for deployment to complete** (usually 1-2 minutes)
2. **Visit your app**: `https://wp-hw5-heya.vercel.app`
3. **Try signing in with GitHub**
4. **Should work now!** ✅

---

## Troubleshooting

### Still seeing "Configuration Error"?

1. **Double-check callback URLs match exactly**:
   - GitHub: `https://wp-hw5-heya.vercel.app/api/auth/callback/github`
   - Google: `https://wp-hw5-heya.vercel.app/api/auth/callback/google`
   - No trailing slashes, exact match required

2. **Verify environment variables are set**:
   - Go to Vercel → Settings → Environment Variables
   - Make sure `NEXTAUTH_URL` is `https://wp-hw5-heya.vercel.app` (not localhost)
   - Make sure all OAuth credentials are set

3. **Check deployment logs**:
   - Go to Vercel → Deployments → Latest deployment
   - Check "Build Logs" for any errors
   - Check "Function Logs" for runtime errors

4. **Wait a few minutes**:
   - OAuth provider changes can take 1-2 minutes to propagate
   - Vercel environment variable changes require a redeploy

### Error: "redirect_uri_mismatch"

This means the callback URL in your OAuth app doesn't match what NextAuth is sending.

**Fix:**
- Make sure the callback URL in GitHub/Google settings is exactly: `https://wp-hw5-heya.vercel.app/api/auth/callback/github`
- No `http://`, no trailing `/`, exact match

### Error: "NEXTAUTH_URL not set"

**Fix:**
- Add `NEXTAUTH_URL` to Vercel environment variables
- Set it to: `https://wp-hw5-heya.vercel.app`
- Redeploy

---

## Quick Checklist

- [ ] Updated GitHub OAuth callback URL to production URL
- [ ] Updated Google OAuth callback URL (if using Google)
- [ ] Set `NEXTAUTH_URL` in Vercel to `https://wp-hw5-heya.vercel.app`
- [ ] Verified all OAuth credentials are in Vercel environment variables
- [ ] Redeployed the app
- [ ] Tested sign-in on production

---

## Summary

The issue was that your OAuth apps were still configured for localhost. After updating:
1. GitHub OAuth callback URL → Production URL
2. `NEXTAUTH_URL` in Vercel → Production URL
3. Redeploy

Your OAuth should work in production! 🎉

