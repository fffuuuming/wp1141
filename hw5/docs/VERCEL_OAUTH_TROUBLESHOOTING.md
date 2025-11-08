# Vercel OAuth Configuration Troubleshooting

This guide helps you fix the "Configuration Error" when using OAuth (Google/GitHub) on Vercel.

## Quick Fix Checklist

If you're seeing a "Configuration Error" page, check these in order:

### 1. Required Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and ensure ALL of these are set:

#### NextAuth Configuration (REQUIRED)
- ✅ `AUTH_SECRET` OR `NEXTAUTH_SECRET` - **This is critical!**
  - Generate with: `openssl rand -base64 32`
  - Must be set for NextAuth to work
- ✅ `AUTH_URL` OR `NEXTAUTH_URL` - Set to: `https://wp-hw5-heya.vercel.app`

#### Google OAuth (if using Google)
- ✅ `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- ✅ `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret

#### GitHub OAuth (if using GitHub)
- ✅ `GITHUB_CLIENT_ID` - Your GitHub OAuth Client ID
- ✅ `GITHUB_CLIENT_SECRET` - Your GitHub OAuth Client Secret

### 2. Important Notes

**NextAuth v5 Variable Names:**
- NextAuth v5 (which this project uses) supports both:
  - `AUTH_SECRET` (new) OR `NEXTAUTH_SECRET` (legacy)
  - `AUTH_URL` (new) OR `NEXTAUTH_URL` (legacy)
- **You only need ONE of each** - use either the new or legacy name
- **Recommendation**: Use `AUTH_SECRET` and `AUTH_URL` for NextAuth v5

**Environment Scope:**
- Make sure to select **Production**, **Preview**, and **Development** when adding variables
- Or at minimum, select **Production** for your live site

### 3. Verify Your OAuth App Settings

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, ensure you have:
   ```
   https://wp-hw5-heya.vercel.app/api/auth/callback/google
   ```

#### GitHub OAuth
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Find your OAuth app
3. Under **Authorization callback URL**, ensure it's set to:
   ```
   https://wp-hw5-heya.vercel.app/api/auth/callback/github
   ```

### 4. After Adding/Updating Environment Variables

**Important**: After adding or updating environment variables in Vercel:

1. **Redeploy your application** - Environment variables are only loaded during build
2. Go to Vercel Dashboard → Your Project → **Deployments**
3. Click the **"..."** menu on the latest deployment → **Redeploy**
4. Or push a new commit to trigger a new deployment

### 5. Verify Variables Are Set

You can verify your environment variables are set correctly by:

1. Check Vercel Dashboard → Settings → Environment Variables
2. Look for the variables listed above
3. Make sure they're not empty (no spaces, no typos)

## Common Issues

### Issue: "Configuration Error" still appears after setting variables

**Solution:**
1. Double-check variable names (case-sensitive!)
2. Make sure you redeployed after adding variables
3. Check Vercel build logs for any errors
4. Verify the secret was generated correctly (should be a long random string)

### Issue: OAuth redirects to error page

**Solution:**
1. Verify callback URLs match exactly:
   - Google: `https://wp-hw5-heya.vercel.app/api/auth/callback/google`
   - GitHub: `https://wp-hw5-heya.vercel.app/api/auth/callback/github`
2. Check that `AUTH_URL` or `NEXTAUTH_URL` is set to `https://wp-hw5-heya.vercel.app`
3. Ensure OAuth app settings match the callback URLs

### Issue: "AUTH_SECRET not set" error

**Solution:**
1. Generate a new secret: `openssl rand -base64 32`
2. Add it to Vercel as `AUTH_SECRET` (or `NEXTAUTH_SECRET`)
3. Make sure to select all environments (Production, Preview, Development)
4. Redeploy your application

## Step-by-Step Fix

1. **Generate AUTH_SECRET** (if you don't have one):
   ```bash
   openssl rand -base64 32
   ```
   Copy the output.

2. **Add to Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Click "Add New"
   - Name: `AUTH_SECRET`
   - Value: (paste the generated secret)
   - Environments: Select all (Production, Preview, Development)
   - Click "Save"

3. **Add AUTH_URL**:
   - Click "Add New" again
   - Name: `AUTH_URL`
   - Value: `https://wp-hw5-heya.vercel.app`
   - Environments: Select all
   - Click "Save"

4. **Verify OAuth Credentials**:
   - Ensure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` are set (if using Google)
   - Ensure `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` are set (if using GitHub)

5. **Redeploy**:
   - Go to Deployments tab
   - Click "..." on latest deployment → "Redeploy"
   - Wait for deployment to complete

6. **Test**:
   - Visit `https://wp-hw5-heya.vercel.app`
   - Try signing in with Google or GitHub
   - Should work now!

## Still Having Issues?

If you've followed all steps and still see errors:

1. Check Vercel build logs for specific error messages
2. Verify all environment variable names are correct (case-sensitive)
3. Ensure OAuth apps are configured with the correct callback URLs
4. Try generating a new `AUTH_SECRET` and updating it
5. Check that your database connection (`DATABASE_URL`) is also set correctly

## Quick Reference

**Required Variables:**
```
AUTH_SECRET=<generated-secret>
AUTH_URL=https://wp-hw5-heya.vercel.app
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
```

**OAuth Callback URLs:**
- Google: `https://wp-hw5-heya.vercel.app/api/auth/callback/google`
- GitHub: `https://wp-hw5-heya.vercel.app/api/auth/callback/github`

