# Migrating from Supabase to Neon Database

This guide explains how to set up Neon (serverless Postgres) as your database and connect it to Vercel.

## Table of Contents
1. [What is Neon?](#what-is-neon)
2. [Step 1: Create a Neon Account and Database](#step-1-create-a-neon-account-and-database)
3. [Step 2: Get Your Connection String](#step-2-get-your-connection-string)
4. [Step 3: Push Schema to Neon](#step-3-push-schema-to-neon)
5. [Step 4: Configure Vercel](#step-4-configure-vercel)
6. [Step 5: Verify the Connection](#step-5-verify-the-connection)
7. [Troubleshooting](#troubleshooting)

---

## What is Neon?

Neon is a serverless Postgres database that:
- Automatically scales based on usage
- Offers branching (like Git branches for databases)
- Provides a generous free tier
- Has built-in connection pooling
- Works seamlessly with Vercel

---

## Step 1: Create a Neon Account and Database

### 1.1 Sign Up for Neon

1. Go to [https://neon.tech](https://neon.tech)
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up using:
   - GitHub (recommended for easy integration)
   - Email
   - Google account

### 1.2 Create a New Project

1. After signing in, you'll be taken to the Neon dashboard
2. Click **"Create Project"** or **"New Project"**
3. Fill in the project details:
   - **Project Name**: Choose a name (e.g., "heya-social-media")
   - **Region**: Select the region closest to your Vercel deployment
     - For US deployments: `us-east-1` or `us-west-2`
     - For Asia: `ap-southeast-1` (Singapore)
     - For Europe: `eu-central-1` (Frankfurt)
   - **PostgreSQL Version**: Select the latest stable version (recommended: 15 or 16)
   - **Compute Size**: Start with the free tier (0.5 vCPU, 1GB RAM)

4. Click **"Create Project"**

### 1.3 Wait for Database Initialization

- Neon will create your database (takes ~30 seconds)
- You'll see a success message when it's ready

---

## Step 2: Get Your Connection String

### 2.1 Access Connection Details

1. In your Neon dashboard, you'll see your project overview
2. Look for the **"Connection Details"** section or **"Connection String"** card
3. You'll see two connection strings:
   - **Pooled connection** (recommended for serverless/Vercel)
   - **Direct connection** (for local development)

### 2.2 Connection String Format

Neon provides connection strings in this format:

**Pooled Connection (for Vercel):**
```
postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
```

**Direct Connection (for local development):**
```
postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
```

**Important Notes:**
- The pooled connection uses port `5432` and includes connection pooling
- The direct connection uses a different endpoint
- Both require SSL (`sslmode=require`)
- Neon automatically includes connection pooling in the pooled connection string

### 2.3 Copy Your Connection String

1. Click the **"Copy"** button next to the connection string
2. **Save it securely** - you'll need it for:
   - Local `.env` file
   - Vercel environment variables

### 2.4 Alternative: Build Connection String Manually

If you prefer to build it manually:

1. Go to your project dashboard
2. Click on **"Connection Details"** or **"Settings"**
3. You'll see:
   - **Host**: `ep-xxxx-xxxx.us-east-1.aws.neon.tech` (example)
   - **Database**: Usually `neondb` or your project name
   - **User**: Your username
   - **Password**: Click "Show" to reveal (or reset if needed)
   - **Port**: `5432` for pooled, different for direct

4. Build the connection string:
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```

---

## Step 3: Push Schema to Neon

### 3.1 Update Local Environment Variable

1. Open or create a `.env` file in your project root
2. Update the `DATABASE_URL` with your Neon connection string:

```env
# Replace with your Neon connection string
DATABASE_URL="postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require"
```

**Example:**
```env
DATABASE_URL="postgresql://user:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 3.2 Verify Prisma Schema

Your `prisma/schema.prisma` should already be configured correctly:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

This is already correct - no changes needed!

### 3.3 Generate Prisma Client

First, generate the Prisma client to ensure it's up to date:

```bash
npm run db:generate
```

Or directly:
```bash
npx prisma generate
```

### 3.4 Push Schema to Neon

Use Prisma's `db push` command to create all tables in your Neon database:

```bash
npm run db:push
```

Or directly:
```bash
npx prisma db push
```

**What this does:**
- Reads your `prisma/schema.prisma` file
- Creates all tables, indexes, and relationships in Neon
- Does NOT create migration files (use `prisma migrate` for that)

**Expected Output:**
```
✔ Generated Prisma Client
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-xxxx-xxxx.us-east-1.aws.neon.tech:5432"

The following migration has been applied to the database:

Migration name: 20240101000000_init

✔ Your database is now in sync with your Prisma schema.
```

### 3.5 Verify Schema in Neon Dashboard

1. Go to your Neon dashboard
2. Click on **"SQL Editor"** or **"Query"**
3. Run this query to see your tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see tables like:
- `users`
- `accounts`
- `sessions`
- `verification_tokens`
- `posts`
- `likes`
- `reposts`
- `follows`
- `drafts`

### 3.6 (Optional) Use Prisma Studio to Verify

Open Prisma Studio to visually inspect your database:

```bash
npm run db:studio
```

This opens a browser at `http://localhost:5555` where you can:
- View all tables
- See data (if any exists)
- Verify relationships

---

## Step 4: Configure Vercel

### 4.1 Get Your Vercel Project Ready

1. Make sure your code is pushed to GitHub/GitLab/Bitbucket
2. Your project should be connected to Vercel

### 4.2 Add Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"** or **"Add"**

5. Add the environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your Neon connection string (use the **pooled connection**)
   - **Environment**: Select all environments:
     - ☑️ Production
     - ☑️ Preview
     - ☑️ Development

6. Click **"Save"**

**Important:**
- Use the **pooled connection string** for Vercel (not the direct connection)
- The pooled connection handles serverless functions better
- Make sure `sslmode=require` is included

### 4.3 Redeploy Your Application

After adding the environment variable:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on your latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger a new deployment

**Why redeploy?**
- Environment variables are only available to new deployments
- Existing deployments won't have access to the new `DATABASE_URL`

### 4.4 Verify Environment Variable

1. In Vercel, go to **Settings** → **Environment Variables**
2. Confirm `DATABASE_URL` is listed
3. You can click the eye icon to verify it's set (it will be masked)

---

## Step 5: Verify the Connection

### 5.1 Check Vercel Deployment Logs

1. Go to your deployment in Vercel
2. Click on the deployment to view logs
3. Look for any database connection errors
4. Successful deployments should show no database errors

### 5.2 Test Your Application

1. Visit your Vercel deployment URL
2. Try to:
   - Sign up / Sign in
   - Create a post
   - Like a post
   - Follow a user

If these work, your database connection is successful!

### 5.3 Check Neon Dashboard

1. Go to your Neon dashboard
2. Click on **"Metrics"** or **"Activity"**
3. You should see:
   - Connection activity
   - Query metrics
   - Database usage

### 5.4 (Optional) Test Locally with Neon

You can also test locally using the Neon connection string:

1. Update your local `.env` with the Neon connection string
2. Run your development server:
   ```bash
   npm run dev
   ```
3. Test the application locally
4. Check Neon dashboard to see queries being executed

---

## Troubleshooting

### Issue: "Can't reach database server"

**Possible Causes:**
1. Wrong connection string
2. SSL not enabled
3. Firewall/IP restrictions

**Solutions:**
- Verify connection string is correct
- Ensure `sslmode=require` is in the connection string
- Check Neon dashboard for any IP restrictions

### Issue: "Connection pool timeout"

**Possible Causes:**
1. Using direct connection instead of pooled
2. Too many connections

**Solutions:**
- Use the **pooled connection string** for Vercel
- Neon's pooled connection handles this automatically

### Issue: "Schema push fails"

**Possible Causes:**
1. Database already has conflicting tables
2. Connection string incorrect

**Solutions:**
- Use `npm run db:push:reset` to reset (⚠️ **WARNING**: This deletes all data!)
- Or manually drop tables in Neon SQL Editor
- Verify connection string is correct

### Issue: "Environment variable not found in Vercel"

**Possible Causes:**
1. Variable not added to all environments
2. Deployment happened before variable was added

**Solutions:**
- Add variable to Production, Preview, AND Development
- Redeploy your application after adding the variable

### Issue: "SSL connection required"

**Solution:**
- Ensure your connection string includes `?sslmode=require`
- Neon requires SSL connections

### Issue: "Authentication failed"

**Possible Causes:**
1. Wrong password
2. User doesn't exist

**Solutions:**
- Reset password in Neon dashboard
- Verify username is correct
- Check connection string format

---

## Additional Neon Features

### Database Branching

Neon supports database branching (like Git branches):
- Create branches for testing
- Merge branches
- Useful for development workflows

### Connection Pooling

Neon automatically provides connection pooling:
- Use pooled connection for serverless (Vercel)
- Use direct connection for long-lived connections
- Pooled connection is optimized for serverless functions

### Monitoring

Neon dashboard provides:
- Query performance metrics
- Connection monitoring
- Database size tracking
- Usage statistics

---

## Migration Checklist

- [ ] Created Neon account
- [ ] Created Neon project
- [ ] Copied connection string (pooled)
- [ ] Updated local `.env` with Neon connection string
- [ ] Ran `npm run db:generate`
- [ ] Ran `npm run db:push` successfully
- [ ] Verified tables in Neon dashboard
- [ ] Added `DATABASE_URL` to Vercel environment variables
- [ ] Redeployed Vercel application
- [ ] Tested application on Vercel
- [ ] Verified no connection errors in logs

---

## Next Steps

After successful migration:

1. **Remove Supabase references** (if any):
   - Update documentation
   - Remove Supabase-specific code

2. **Monitor Neon usage**:
   - Check Neon dashboard regularly
   - Monitor connection limits
   - Track database size

3. **Optimize queries**:
   - Use Neon's query insights
   - Optimize slow queries
   - Add indexes if needed

4. **Set up backups** (if needed):
   - Neon provides automatic backups on paid plans
   - Consider backup strategy for production

---

## Support Resources

- **Neon Documentation**: [https://neon.tech/docs](https://neon.tech/docs)
- **Neon Discord**: [https://discord.gg/neondatabase](https://discord.gg/neondatabase)
- **Prisma Docs**: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)

---

## Summary

You've successfully migrated from Supabase to Neon! Your application should now:
- ✅ Connect to Neon database
- ✅ Work on Vercel with proper connection pooling
- ✅ Have all tables and relationships set up
- ✅ Be ready for production use

If you encounter any issues, refer to the troubleshooting section or Neon's support resources.

