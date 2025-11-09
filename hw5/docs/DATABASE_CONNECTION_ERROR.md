# Database Connection Error - Root Cause Explanation

## Problem Summary

When trying to login, you're encountering Prisma database connection errors:
- `Can't reach database server at aws-1-ap-southeast-1.pooler.supabase.com:6543`
- `Authentication failed against database server, the provided database credentials for postgres are not valid`

## Root Cause (Simple Explanation)

Your application is deployed on **Vercel**, and it's trying to connect to your **Supabase PostgreSQL database**, but the connection is failing for one of these reasons:

### 1. **Missing Environment Variable in Vercel**
   - The `DATABASE_URL` environment variable is not set in your Vercel project settings
   - Or it's set incorrectly

### 2. **Wrong Connection String Format**
   - Supabase provides different connection strings:
     - **Direct connection** (port 5432) - for local development
     - **Connection pooler** (port 6543) - for serverless environments like Vercel
   - You might be using the wrong one, or the format is incorrect

### 3. **Invalid Database Credentials**
   - The password in your connection string might be wrong
   - The database user might not exist
   - The credentials might have been changed in Supabase but not updated in Vercel

### 4. **Network/Firewall Issues**
   - The connection pooler might not be accessible from Vercel's servers
   - Supabase might have IP restrictions enabled

## How to Fix

### Step 1: Get Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Find the **Connection string** section
4. Select **Connection pooling** mode (for Vercel/serverless)
5. Copy the connection string - it should look like:
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Step 2: Add Environment Variable to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste the connection string from Step 1
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**

### Step 3: Redeploy Your Application

After adding the environment variable, you need to redeploy:
- Vercel will automatically redeploy if you push to your connected branch
- Or manually trigger a redeploy from the Vercel dashboard

### Step 4: Verify the Connection String Format

Make sure your connection string includes:
- ✅ The correct port (6543 for pooler, 5432 for direct)
- ✅ The `pgbouncer=true` parameter if using pooler
- ✅ The correct password (URL-encoded if it contains special characters)
- ✅ The correct project reference and region

### Example Connection Strings

**For Vercel (Connection Pooler - Recommended):**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**For Local Development (Direct Connection):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?schema=public
```

## Important Notes

1. **Connection Pooler vs Direct Connection**
   - Use **pooler** (port 6543) for Vercel/serverless
   - Use **direct** (port 5432) for local development
   - The pooler handles connection limits better for serverless functions

2. **Password Encoding**
   - If your password contains special characters (like `@`, `#`, `%`, etc.), they need to be URL-encoded
   - Example: `@` becomes `%40`, `#` becomes `%23`

3. **Connection Limits**
   - Supabase free tier has connection limits
   - The pooler helps manage these limits better
   - You can add `&connection_limit=1` to the connection string for serverless

4. **IP Restrictions**
   - Check if your Supabase project has IP restrictions enabled
   - If yes, you may need to allow Vercel's IP ranges (or disable restrictions)

## Testing the Fix

After setting up the environment variable and redeploying:

1. Try logging in again
2. Check Vercel function logs for any remaining errors
3. If errors persist, verify:
   - The connection string is correct
   - The database is running in Supabase
   - No IP restrictions are blocking Vercel

## Common Mistakes to Avoid

❌ Using direct connection (port 5432) in Vercel
❌ Not URL-encoding special characters in password
❌ Using old/expired connection strings
❌ Setting environment variable only for one environment (should be all)
❌ Forgetting to redeploy after adding environment variable

