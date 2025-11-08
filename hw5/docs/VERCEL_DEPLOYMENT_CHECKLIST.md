# Vercel Deployment Checklist

Quick reference checklist for deploying to Vercel.

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] Local build succeeds: `npm run build`
- [ ] All tests pass (if applicable)
- [ ] `.env` file is in `.gitignore` (never commit secrets!)

## Service Setup

### Database (PostgreSQL)
- [ ] Created cloud PostgreSQL database (Supabase/Neon)
- [ ] Copied connection string
- [ ] Tested connection locally

### OAuth Providers
- [ ] **Google OAuth app created**
  - Client ID obtained
  - Client Secret obtained
  - Redirect URI will be: `https://your-app.vercel.app/api/auth/callback/google`
- [ ] **GitHub OAuth app created**
  - Client ID obtained
  - Client Secret obtained
  - Redirect URI will be: `https://your-app.vercel.app/api/auth/callback/github`

### Pusher
- [ ] Pusher account created
- [ ] App created in Pusher dashboard
- [ ] App ID, Key, Secret, and Cluster copied

## Vercel Setup

### Initial Setup
- [ ] Vercel CLI installed OR using Dashboard
- [ ] Project initialized with `vercel` command OR imported via Dashboard
- [ ] Project name chosen
- [ ] Directory set to `.` (current directory)

### Environment Variables (Add in Vercel Dashboard)

#### Database
- [ ] `DATABASE_URL` = PostgreSQL connection string

#### NextAuth
- [ ] `NEXTAUTH_URL` = `https://your-app.vercel.app` (update after first deploy)
- [ ] `NEXTAUTH_SECRET` = Generated with `openssl rand -base64 32`

#### Google OAuth
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`

#### GitHub OAuth
- [ ] `GITHUB_CLIENT_ID`
- [ ] `GITHUB_CLIENT_SECRET`

#### Pusher (Server)
- [ ] `PUSHER_APP_ID`
- [ ] `PUSHER_KEY`
- [ ] `PUSHER_SECRET`
- [ ] `PUSHER_CLUSTER`

#### Pusher (Client - NEXT_PUBLIC_*)
- [ ] `NEXT_PUBLIC_PUSHER_KEY` = Same as PUSHER_KEY
- [ ] `NEXT_PUBLIC_PUSHER_CLUSTER` = Same as PUSHER_CLUSTER

### Build Configuration
- [ ] Framework: Next.js (auto-detected)
- [ ] Build Command: `npm run build` (default)
- [ ] Install Command: `npm install` (default)
- [ ] Postinstall script added to `package.json` for Prisma ✅ (Already done)

## Database Migration

- [ ] Database schema pushed: `npx prisma db push`
- [ ] Verified tables created in database

## Deployment

- [ ] Deployed with `vercel --prod` OR via Dashboard
- [ ] Deployment successful (check build logs)
- [ ] Got production URL: `https://your-app.vercel.app`

## Post-Deployment

### Update OAuth Redirect URIs
- [ ] Updated Google OAuth redirect URI with actual Vercel URL
- [ ] Updated GitHub OAuth redirect URI with actual Vercel URL
- [ ] Updated `NEXTAUTH_URL` in Vercel with actual production URL

### Testing
- [ ] App loads at Vercel URL
- [ ] Google OAuth login works
- [ ] GitHub OAuth login works
- [ ] Can create posts
- [ ] Real-time features work (likes, comments)
- [ ] Database operations work

### GitHub Integration (Optional but Recommended)
- [ ] Connected GitHub repository in Vercel
- [ ] Auto-deploy enabled
- [ ] Production branch set to `main`

## Troubleshooting

If something doesn't work:

1. **Check Build Logs** in Vercel Dashboard
2. **Check Environment Variables** are all set correctly
3. **Verify OAuth Redirect URIs** match exactly (including https)
4. **Test Database Connection** - ensure DATABASE_URL is correct
5. **Check Browser Console** for client-side errors
6. **Verify Prisma Client** - ensure `postinstall` script ran

## Quick Commands

```bash
# Deploy to production
vercel --prod

# View environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# View logs
vercel logs

# Open project
vercel open
```

---

**Full guide**: See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

