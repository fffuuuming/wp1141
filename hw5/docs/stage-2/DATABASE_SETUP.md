# Database Setup Guide

## How to Set DATABASE_URL

The `DATABASE_URL` environment variable is required for Prisma to connect to your PostgreSQL database. Here are several options:

## Option 1: Local PostgreSQL (If You Have PostgreSQL Installed)

### Step 1: Install PostgreSQL (if not installed)

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

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE heya;

# Create user (optional)
CREATE USER heya_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE heya TO heya_user;

# Exit
\q
```

### Step 3: Set DATABASE_URL in .env

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://heya_user:your_password@localhost:5432/heya?schema=public"
```

**Or if using default postgres user:**
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/heya?schema=public"
```

---

## Option 2: Free Cloud PostgreSQL (Recommended for Development)

### Option 2a: Supabase (Recommended - Free Tier)

1. Go to [Supabase](https://supabase.com/)
2. Sign up for free account
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)
6. It will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
7. Add to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

### Option 2b: Neon (Free Tier)

1. Go to [Neon](https://neon.tech/)
2. Sign up for free account
3. Create a new project
4. Copy the connection string from dashboard
5. Add to `.env`:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
   ```

### Option 2c: Railway (Free Tier with Credit Card)

1. Go to [Railway](https://railway.app/)
2. Sign up and add credit card (free tier)
3. Create new PostgreSQL database
4. Copy connection string from database settings
5. Add to `.env`

---

## Quick Setup (Using Supabase - Easiest)

1. **Sign up**: https://supabase.com/
2. **Create project**: Click "New Project"
3. **Get connection string**: 
   - Settings → Database → Connection string (URI)
   - Copy the connection string
4. **Create `.env` file** in project root:
   ```env
   DATABASE_URL="your-copied-connection-string-here"
   ```
5. **Test connection**:
   ```bash
   npm run db:push
   ```

---

## Verify Setup

After setting `DATABASE_URL`, verify the connection:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Open Prisma Studio (visual database browser)
npm run db:studio
```

If these commands work without errors, your database is set up correctly!

---

## Important Notes

1. **Never commit `.env` file**: It's already in `.gitignore`
2. **Format**: Connection string must be in PostgreSQL URI format
3. **SSL**: Some cloud providers require `?sslmode=require` at the end
4. **Schema**: The `?schema=public` part is optional but recommended

---

## Troubleshooting

### Error: "Connection refused"
- Check if PostgreSQL is running (local)
- Verify connection string is correct
- Check firewall settings

### Error: "Authentication failed"
- Verify username and password
- Check if user has proper permissions

### Error: "Database does not exist"
- Create the database first (see Option 1, Step 2)

---

## Next Steps

Once `DATABASE_URL` is set:
1. Run `npm run db:generate` - Generates Prisma Client
2. Run `npm run db:push` - Creates tables in database
3. Proceed with Stage 2 remaining steps

