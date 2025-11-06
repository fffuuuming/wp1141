# Complete Database Guide

A comprehensive guide for setting up, managing, and maintaining your PostgreSQL database for the heya project.

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Database Management](#database-management)
3. [Schema Management](#schema-management)
4. [Quick Reference](#quick-reference)
5. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Setting Up DATABASE_URL

The `DATABASE_URL` environment variable is required for Prisma to connect to your PostgreSQL database.

### Option 1: Local PostgreSQL

#### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**Windows:**
Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)

#### Step 2: Create Database and User

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE heya;

# Create user (optional but recommended)
CREATE USER heya_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE heya TO heya_user;

# Exit
\q
```

#### Step 3: Configure .env

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://heya_user:your_password@localhost:5432/heya?schema=public"
```

**Or if using default postgres user:**
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/heya?schema=public"
```

---

### Option 2: Cloud PostgreSQL (Recommended for Development)

#### Supabase (Free Tier - Easiest)

1. Sign up at [Supabase](https://supabase.com/)
2. Create a new project
3. Go to **Settings → Database**
4. Copy the **Connection string** (URI format)
5. Add to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

#### Neon (Free Tier)

1. Sign up at [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string from dashboard
4. Add to `.env`:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
   ```

#### Railway (Free Tier with Credit Card)

1. Sign up at [Railway](https://railway.app/)
2. Create new PostgreSQL database
3. Copy connection string from database settings
4. Add to `.env`

---

### Verify Setup

After setting `DATABASE_URL`, verify the connection:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Open Prisma Studio (visual database browser)
npm run db:studio
```

If these commands work without errors, your database is set up correctly!

---

## Database Management

### Clearing Data

#### Option 1: Clear All Data (Keep Tables)

**Using npm script (Recommended):**
```bash
npm run db:clear
```

**Using SQL:**
```bash
psql -U heya_user -d heya
```

Then run:
```sql
TRUNCATE TABLE users, posts, comments, likes, reposts, follows, drafts CASCADE;
```

**Using Prisma Studio:**
```bash
npm run db:studio
```
- Open each table
- Select all records
- Delete them

#### Option 2: Reset Schema (Drop & Recreate Tables)

**Using npm script (Recommended):**
```bash
npm run db:push:reset
```

**Using Prisma CLI:**
```bash
npm run db:push -- --force-reset
```

**Using SQL:**
```bash
psql -U heya_user -d heya
```

Then run:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO heya_user;
GRANT ALL ON SCHEMA public TO public;
```

Then push schema again:
```bash
npm run db:push
```

---

### Resetting Database Schema

#### Method 1: Using Prisma (Recommended)

```bash
npm run db:push:reset
```

This will:
- Drop all existing tables
- Recreate them from your current `prisma/schema.prisma`
- Keep your database and user
- **WARNING: Deletes all data**

#### Method 2: Drop and Recreate Database

```bash
psql postgres
```

```sql
-- Drop the entire database
DROP DATABASE heya;

-- Recreate it
CREATE DATABASE heya;
GRANT ALL PRIVILEGES ON DATABASE heya TO heya_user;

-- Exit
\q
```

Then push schema:
```bash
npm run db:push
```

---

## Schema Management

### Re-designing Database Schema

#### Step 1: Modify Schema File

Edit `prisma/schema.prisma`:
- Add new models
- Modify existing models
- Change relationships
- Add/remove fields

#### Step 2: Regenerate Prisma Client

```bash
npm run db:generate
```

This updates TypeScript types based on your schema changes.

#### Step 3: Apply Changes to Database

**Option A: Non-destructive Push**
```bash
npm run db:push
```
- Adds new tables/columns
- Won't delete existing data
- May fail if breaking changes exist

**Option B: Destructive Reset**
```bash
npm run db:push:reset
```
- Drops all tables
- Recreates from schema
- **WARNING: Deletes all data**

#### Step 4: Production Migrations (Optional)

For production environments, use migrations:
```bash
npx prisma migrate dev --name your_migration_name
```

---

## Quick Reference

### Setup Commands

| Task | Command | Description |
|------|---------|-------------|
| Generate Prisma Client | `npm run db:generate` | Generate TypeScript types from schema |
| Push Schema | `npm run db:push` | Create/update tables (non-destructive) |
| Reset Schema | `npm run db:push:reset` | Drop & recreate tables (destructive) |
| View Database | `npm run db:studio` | Open visual database browser |
| Clear Data | `npm run db:clear` | Delete all records (keeps tables) |

### Common Workflows

**Initial Setup:**
```bash
# 1. Set DATABASE_URL in .env
# 2. Generate Prisma Client
npm run db:generate

# 3. Create tables
npm run db:push
```

**Clear Test Data:**
```bash
npm run db:clear
```

**Modify Schema:**
```bash
# 1. Edit prisma/schema.prisma
# 2. Regenerate types
npm run db:generate

# 3. Apply changes (choose one)
npm run db:push          # Non-destructive
npm run db:push:reset    # Destructive (resets everything)
```

**Complete Reset:**
```bash
# Option 1: Reset schema only
npm run db:push:reset

# Option 2: Drop and recreate database
psql postgres
DROP DATABASE heya;
CREATE DATABASE heya;
GRANT ALL PRIVILEGES ON DATABASE heya TO heya_user;
\q
npm run db:push
```

---

## Troubleshooting

### Connection Issues

**Error: "Connection refused"**
- ✅ Check if PostgreSQL is running (local): `brew services list` (macOS)
- ✅ Verify connection string in `.env` is correct
- ✅ Check firewall settings
- ✅ Verify database server is accessible

**Error: "Authentication failed"**
- ✅ Verify username and password in DATABASE_URL
- ✅ Check if user has proper permissions
- ✅ Try resetting user password

**Error: "Database does not exist"**
- ✅ Create the database first (see Initial Setup)
- ✅ Verify database name in DATABASE_URL

### Schema Issues

**Error: "Table does not exist"**
- ✅ Run `npm run db:push` to create tables
- ✅ Check if DATABASE_URL is correct
- ✅ Verify schema file is valid: `npx prisma validate`

**Error: "Column does not exist"**
- ✅ Regenerate Prisma Client: `npm run db:generate`
- ✅ Push schema changes: `npm run db:push`
- ✅ If breaking changes, use: `npm run db:push:reset`

**Error: "Foreign key constraint"**
- ✅ Clear data in correct order (use `npm run db:clear`)
- ✅ Or reset schema: `npm run db:push:reset`

### Prisma Issues

**Error: "Prisma Client not generated"**
- ✅ Run `npm run db:generate`
- ✅ Check if `node_modules/@prisma/client` exists

**Error: "Schema validation failed"**
- ✅ Run `npx prisma validate` to see errors
- ✅ Check syntax in `prisma/schema.prisma`
- ✅ Verify all required fields are defined

---

## Important Notes

1. **Never commit `.env` file**: It's already in `.gitignore`
2. **Connection string format**: Must be PostgreSQL URI format
3. **SSL**: Some cloud providers require `?sslmode=require` at the end
4. **Schema**: The `?schema=public` part is optional but recommended
5. **Backup**: Always backup data before running destructive commands
6. **Development vs Production**: Use `db:push` for dev, migrations for production

---

## Next Steps

After database setup:
1. ✅ Verify connection: `npm run db:push`
2. ✅ View database: `npm run db:studio`
3. ✅ Test application: `npm run dev`
4. ✅ Proceed with application development

---

**Last Updated:** After Stage 3 Completion

