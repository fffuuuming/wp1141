# How to Execute Step 6.1: Push Schema to Database

This guide shows you exactly how to push your Prisma schema to your Supabase database.

---

## Prerequisites

Before starting, make sure you have:
- ✅ Your Supabase connection string ready
- ✅ Your `.env` file in the project root
- ✅ Node.js and npm installed

---

## Method 1: Using Local .env File (Easiest - Recommended)

### Step 1: Get Your Supabase Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → Database**
4. Scroll to **"Connection string"** section
5. Click **"URI"** tab
6. Copy the **Direct connection** string (port 5432)
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Step 2: Update Your Local .env File

1. Open your `.env` file in the project root
2. Add or update the `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres?schema=public"
   ```
   
   **Important:**
   - Replace `your-password` with your actual Supabase database password
   - Replace `your-project-ref` with your actual project reference ID
   - Make sure to include `?schema=public` at the end

### Step 3: Push Schema to Database

Open your terminal in the project directory and run:

```bash
# Navigate to your project (if not already there)
cd /Users/fffuuuming/Desktop/study/master/master_2_2/wp/wp1141/hw5

# Generate Prisma Client (if needed)
npm run db:generate

# Push schema to database
npm run db:push
```

**Or use npx directly:**
```bash
npx prisma db push
```

### Step 4: Verify Success

You should see output like:
```
✔ Generated Prisma Client
✔ The database is already in sync with the Prisma schema.
```

Or if tables are being created:
```
✔ Generated Prisma Client
✔ Pushed schema to database
```

### Step 5: Verify Tables in Supabase

1. Go to Supabase Dashboard → Your Project
2. Click **"Table Editor"** in the left sidebar
3. You should see all your tables:
   - `users`
   - `posts`
   - `likes`
   - `reposts`
   - `follows`
   - `drafts`
   - `accounts`
   - `sessions`
   - `verification_tokens`

---

## Method 2: Using Temporary Environment Variable (Alternative)

If you don't want to modify your `.env` file, you can set it temporarily:

### Step 1: Get Your Connection String

(Same as Method 1, Step 1)

### Step 2: Set Environment Variable Temporarily

**On macOS/Linux:**
```bash
export DATABASE_URL="postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres?schema=public"
```

**On Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres?schema=public"
```

**On Windows (Command Prompt):**
```cmd
set DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres?schema=public
```

### Step 3: Push Schema

```bash
npx prisma db push
```

**Note:** This environment variable only lasts for the current terminal session.

---

## Method 3: Using Prisma Studio (Visual Method)

### Step 1: Update .env File

(Same as Method 1, Step 2)

### Step 2: Open Prisma Studio

```bash
npm run db:studio
```

This opens a visual database browser at `http://localhost:5555`

### Step 3: Push Schema (Still Need Terminal)

While Prisma Studio is open, in another terminal:

```bash
npm run db:push
```

---

## Troubleshooting

### Error: "Can't reach database server"

**Possible causes:**
1. Wrong connection string format
2. Password contains special characters that need URL encoding
3. Firewall blocking connection

**Solutions:**
- Double-check the connection string format
- URL-encode special characters in password:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`
- Make sure you're using the **Direct connection** (port 5432), not pooled (port 6543)

### Error: "Schema 'public' does not exist"

**Solution:**
Make sure your connection string includes `?schema=public` at the end:
```env
DATABASE_URL="postgresql://...?schema=public"
```

### Error: "Relation already exists"

**Solution:**
This means tables already exist. You can:
1. Use `npm run db:push:reset` to start fresh (⚠️ **WARNING: Deletes all data!**)
2. Or manually drop tables in Supabase dashboard if you don't need the data

### Error: "P1001: Can't reach database server"

**Solution:**
- Check if your Supabase project is active (not paused)
- Verify the connection string is correct
- Try using the direct connection string instead of pooled

---

## Quick Reference Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema (non-destructive)
npm run db:push

# Reset and push schema (⚠️ DELETES ALL DATA)
npm run db:push:reset

# Open visual database browser
npm run db:studio
```

---

## What Happens When You Run `db:push`?

1. **Prisma reads** your `prisma/schema.prisma` file
2. **Compares** it with the current database state
3. **Creates** missing tables, columns, indexes, and relationships
4. **Updates** existing tables if schema changed
5. **Does NOT delete** existing data (non-destructive)

---

## After Successful Migration

Once your schema is pushed:

1. ✅ Your database tables are created
2. ✅ You can start using your app
3. ✅ Update `DATABASE_URL` in Vercel environment variables (if deploying)
4. ✅ Test your app to make sure database operations work

---

## Next Steps

After pushing your schema:
1. Test database operations locally
2. Add `DATABASE_URL` to Vercel environment variables
3. Deploy your app to Vercel
4. Test in production

---

**Need more help?** Check the main deployment guide: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

