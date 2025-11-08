# Vercel Deployment Guide

Complete step-by-step guide to deploy your Next.js social media app to Vercel.

## Prerequisites

Before starting, ensure you have:
- ✅ A GitHub account
- ✅ A Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ All your service credentials ready (database, OAuth, Pusher)
- ✅ Vercel CLI installed (optional, for CLI deployment)

---

## Step 1: Prepare Your Code

### 1.1 Ensure Code is Ready

```bash
# Test your build locally first
npm run build

# If build succeeds, you're good to go!
```

### 1.2 Commit and Push to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

**Important**: Ensure your `.env` file is in `.gitignore` (it should be by default) - never commit secrets to GitHub!

---

## Step 2: Install Vercel CLI (Optional but Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Or use npx (no installation needed)
npx vercel
```

---

## Step 3: Initial Vercel Setup

### Option A: Using Vercel CLI (Recommended for First Time)

```bash
# Navigate to your project directory
cd /Users/fffuuuming/Desktop/study/master/master_2_2/wp/wp1141/hw5

# Run vercel command
vercel
```

**Follow the prompts:**
1. **"Set up and deploy"** - Select this option
2. **Project name** - Enter a name (or press Enter for default)
3. **Directory** - Press Enter to use current directory (`.`)
4. **Override settings?** - Press Enter for "No" (use defaults)

This will create a preview deployment. Don't worry about environment variables yet - we'll set them up next.

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Authorize Vercel to access your GitHub account (if first time)
5. Select your repository
6. Click **"Import"**

---

## Step 4: Set Up Environment Variables

### 4.1 Access Environment Variables Settings

**Via Dashboard:**
1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**

**Via CLI:**
```bash
# You can add env vars via CLI (we'll do this step by step)
vercel env add
```

### 4.2 Required Environment Variables

Add the following environment variables. **Important**: For each variable, select **all environments** (Production, Preview, Development) unless specified otherwise.

#### A. Database (PostgreSQL)

**Note**: Your project uses **PostgreSQL** (not MongoDB). You'll need a cloud PostgreSQL database.

**Option 1: Supabase (Recommended - Free Tier)**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection string** (URI format)
5. It looks like: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

**Option 2: Neon (Free Tier)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from dashboard
4. Format: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

**Add to Vercel:**
```
Variable Name: DATABASE_URL
Value: [Your PostgreSQL connection string]
Environments: Production, Preview, Development
```

#### B. NextAuth Configuration

```bash
# Generate a secret key (run this locally)
openssl rand -base64 32
```

**Add to Vercel:**
```
Variable Name: NEXTAUTH_URL
Value: https://your-project-name.vercel.app
Note: Update this after first deployment with your actual Vercel URL

Variable Name: NEXTAUTH_SECRET
Value: [Generated secret from openssl command]
Environments: Production, Preview, Development
```

**Important**: After your first deployment, update `NEXTAUTH_URL` with your actual production URL.

#### C. OAuth Providers

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Add authorized redirect URI: `https://your-project-name.vercel.app/api/auth/callback/google`
6. Copy Client ID and Client Secret

**Add to Vercel:**
```
Variable Name: GOOGLE_CLIENT_ID
Value: [Your Google Client ID]

Variable Name: GOOGLE_CLIENT_SECRET
Value: [Your Google Client Secret]
```

**GitHub OAuth:**
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Your app name
   - **Homepage URL**: `https://your-project-name.vercel.app`
   - **Authorization callback URL**: `https://your-project-name.vercel.app/api/auth/callback/github`
4. Copy Client ID and generate Client Secret

**Add to Vercel:**
```
Variable Name: GITHUB_CLIENT_ID
Value: [Your GitHub Client ID]

Variable Name: GITHUB_CLIENT_SECRET
Value: [Your GitHub Client Secret]
```

**Note**: Facebook OAuth is mentioned in your docs but not implemented in the code. You can skip it or add it later if needed.

#### D. Pusher (Real-time Features)

1. Sign up at [pusher.com](https://pusher.com)
2. Create a new app (free tier available)
3. Go to **App Keys** tab
4. Copy the following values:
   - App ID
   - Key
   - Secret
   - Cluster

**Add to Vercel:**
```
Variable Name: PUSHER_APP_ID
Value: [Your Pusher App ID]

Variable Name: PUSHER_KEY
Value: [Your Pusher Key]

Variable Name: PUSHER_SECRET
Value: [Your Pusher Secret]

Variable Name: PUSHER_CLUSTER
Value: [Your Pusher Cluster (e.g., us2, eu)]

Variable Name: NEXT_PUBLIC_PUSHER_KEY
Value: [Same as PUSHER_KEY - this is for client-side]

Variable Name: NEXT_PUBLIC_PUSHER_CLUSTER
Value: [Same as PUSHER_CLUSTER - this is for client-side]
```

**Important**: `NEXT_PUBLIC_*` variables are exposed to the browser, so use the same values as server-side Pusher credentials.

#### E. Cloudinary (Optional - Not Currently Used)

**Note**: Your codebase doesn't currently use Cloudinary. Images are stored as URLs from OAuth providers or user-provided URLs. You can skip this section unless you plan to add image upload functionality later.

If you want to add Cloudinary support in the future:
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret
3. Add as environment variables

---

## Step 5: Configure Build Settings

Vercel should auto-detect Next.js, but verify these settings:

1. Go to **Settings** → **General**
2. Ensure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (or `next build`)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 5.1 Prisma Build Configuration

Since you're using Prisma, you need to ensure Prisma generates the client during build.

**Option 1: Add postinstall script (Recommended)**

Update your `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**Option 2: Use Vercel Build Command**

In Vercel Settings → General → Build Command:
```bash
prisma generate && next build
```

---

## Step 6: Database Migration

After setting up your PostgreSQL database, you need to run Prisma migrations:

### 6.1 Push Schema to Database

**Option 1: Using Vercel CLI (Recommended)**

```bash
# Set your DATABASE_URL temporarily
export DATABASE_URL="your-postgresql-connection-string"

# Push schema
npx prisma db push

# Or generate and push
npx prisma generate
npx prisma db push
```

**Option 2: Using Prisma Studio Locally**

```bash
# Make sure DATABASE_URL in your local .env points to production DB
npx prisma db push
```

**Option 3: Add to Build Process**

You can add a build script that runs migrations, but this is not recommended for production. Instead, run migrations manually or use a migration service.

---

## Step 7: Deploy to Production

### Option A: Using CLI

```bash
# Deploy to production
vercel --prod
```

### Option B: Using Dashboard

1. Go to your project in Vercel Dashboard
2. Click **Deployments** tab
3. Find your latest deployment
4. Click the **"..."** menu → **Promote to Production**

Or simply push to your main branch (if GitHub integration is set up):
```bash
git push origin main
```

---

## Step 8: Update OAuth Redirect URIs

After deployment, update your OAuth provider redirect URIs with the actual Vercel URL:

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth 2.0 Client
3. Add authorized redirect URI: `https://your-actual-vercel-url.vercel.app/api/auth/callback/google`

### GitHub OAuth
1. Go to [GitHub OAuth Apps](https://github.com/settings/developers)
2. Edit your OAuth App
3. Update **Authorization callback URL**: `https://your-actual-vercel-url.vercel.app/api/auth/callback/github`

### Update NEXTAUTH_URL
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to: `https://your-actual-vercel-url.vercel.app`
3. Redeploy (or wait for automatic redeploy)

---

## Step 9: Verify Deployment

### 9.1 Check Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check **Build Logs** for any errors

### 9.2 Test Your Application

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. Test OAuth login (Google/GitHub)
3. Test creating posts
4. Test real-time features (likes, comments)
5. Check database connectivity

### 9.3 Common Issues

**Issue: "Prisma Client not generated"**
- Solution: Ensure `prisma generate` runs in build process (see Step 5.1)

**Issue: "Database connection failed"**
- Solution: Check `DATABASE_URL` is correct and database allows connections from Vercel IPs

**Issue: "OAuth redirect mismatch"**
- Solution: Update OAuth provider redirect URIs (see Step 8)

**Issue: "NEXTAUTH_SECRET not set"**
- Solution: Add `NEXTAUTH_SECRET` environment variable

---

## Step 10: Set Up GitHub Integration (Recommended)

For automatic deployments on every push:

1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Ensure your GitHub repository is connected
3. Configure:
   - **Production Branch**: `main` (or `master`)
   - **Auto-deploy**: Enabled
4. Now every `git push` will trigger a new deployment!

---

## Step 11: Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` and OAuth redirect URIs with your custom domain

---

## Environment Variables Summary

Here's a complete checklist of all environment variables you need:

### Required Variables

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your Vercel app URL (update after first deploy)
- [ ] `NEXTAUTH_SECRET` - Generated secret key
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- [ ] `GITHUB_CLIENT_ID` - GitHub OAuth Client ID
- [ ] `GITHUB_CLIENT_SECRET` - GitHub OAuth Client Secret
- [ ] `PUSHER_APP_ID` - Pusher App ID
- [ ] `PUSHER_KEY` - Pusher Key
- [ ] `PUSHER_SECRET` - Pusher Secret
- [ ] `PUSHER_CLUSTER` - Pusher Cluster
- [ ] `NEXT_PUBLIC_PUSHER_KEY` - Same as PUSHER_KEY
- [ ] `NEXT_PUBLIC_PUSHER_CLUSTER` - Same as PUSHER_CLUSTER

### Optional Variables

- [ ] `FACEBOOK_CLIENT_ID` - If you add Facebook OAuth later
- [ ] `FACEBOOK_CLIENT_SECRET` - If you add Facebook OAuth later
- [ ] Cloudinary variables - If you add image upload later

---

## Quick Reference Commands

```bash
# Initial setup
vercel

# Deploy to production
vercel --prod

# View environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME

# View deployment logs
vercel logs

# Open project in browser
vercel open
```

---

## Troubleshooting

### Build Fails

1. Check build logs in Vercel Dashboard
2. Test build locally: `npm run build`
3. Ensure all dependencies are in `package.json`
4. Check for TypeScript errors: `npm run lint`

### Database Issues

1. Verify `DATABASE_URL` is correct
2. Check database allows external connections
3. Ensure database is accessible (not behind firewall)
4. Run `npx prisma db push` to sync schema

### OAuth Issues

1. Verify redirect URIs match exactly (including https)
2. Check environment variables are set correctly
3. Ensure OAuth apps are in "Published" state (not development mode)

### Real-time Features Not Working

1. Verify Pusher environment variables are set
2. Check `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` are set
3. Check browser console for Pusher connection errors

---

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Set up monitoring (Vercel Analytics)
3. ✅ Configure error tracking (optional)
4. ✅ Set up database backups
5. ✅ Document your production URLs and credentials securely

---

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/configuration/options)

---

**Good luck with your deployment! 🚀**

