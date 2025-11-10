# heya - Social Media Platform

A Twitter-like social media application built with Next.js, TypeScript, Prisma, and NextAuth.

## 🌐 Live Deployment

The application is already deployed and available at:

**🔗 [https://heya-eight.vercel.app](https://heya-eight.vercel.app)**

You can use the live deployment directly - no need to deploy it yourself!

> Implemented advance function: new post notice
## 🧪 Local Testing (When Vercel Has Issues)

If you encounter issues with the Vercel deployment or want to test/develop locally, you can set up a local development environment. Follow these steps:

### 1. Install

```bash
npm install
```

### 2. Set Up Local Environment Variables

Create a `.env` file in the root directory and fill in the following values:

```env
# Database - Set up a local PostgreSQL or use a test database
DATABASE_URL="postgresql://user:password@localhost:5432/heya?schema=public"

# NextAuth
AUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
# Or
# NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"

# NextAuth URL (for local testing)
AUTH_URL="http://localhost:3000"
# Or
# NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Pusher (Optional)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"

NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
```


### 3. Set Up Local PostgreSQL (Optional)

If you want to test with a local database:

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb heya

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://$(whoami)@localhost:5432/heya?schema=public"
```

### 4. Initialize Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Update OAuth Callback URLs

For local testing, add these to your OAuth provider settings:
- **Google**: `http://localhost:3000/api/auth/callback/google`
- **GitHub**: `http://localhost:3000/api/auth/callback/github`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Debug Authentication Issues

If you encounter authentication problems, visit:
- `http://localhost:3000/api/auth/debug` - Shows authentication configuration status

## 📋 Environment Variables Reference

**Note**: The production deployment at [https://heya-eight.vercel.app](https://heya-eight.vercel.app) already has these configured. You only need to set these up if you're running the app locally for testing or development.

### Required Variables (for Local Testing)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?schema=public` |
| `AUTH_SECRET` or `NEXTAUTH_SECRET` | NextAuth secret key | Generate with `openssl rand -base64 32` |
| `AUTH_URL` or `NEXTAUTH_URL` | Application URL | `http://localhost:3000` (for local testing) |
| At least one OAuth provider | Google or GitHub credentials | See below |

### OAuth Provider Variables

**Google OAuth:**
- `GOOGLE_CLIENT_ID` - From [Google Cloud Console](https://console.cloud.google.com/)
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

**GitHub OAuth:**
- `GITHUB_CLIENT_ID` - From [GitHub Developer Settings](https://github.com/settings/developers)
- `GITHUB_CLIENT_SECRET` - From GitHub Developer Settings

### Optional Variables (Real-time Features)

| Variable | Description |
|----------|-------------|
| `PUSHER_APP_ID` | Pusher application ID |
| `PUSHER_KEY` | Pusher application key |
| `PUSHER_SECRET` | Pusher application secret |
| `PUSHER_CLUSTER` | Pusher cluster (e.g., `us2`, `eu`) |
| `NEXT_PUBLIC_PUSHER_KEY` | Same as `PUSHER_KEY` (client-side) |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Same as `PUSHER_CLUSTER` (client-side) |

**Note**: Real-time features will be disabled if Pusher credentials are not configured. The app will still function without them.

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database (development)
- `npm run db:push:reset` - Reset and push schema (⚠️ deletes all data)
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:clear` - Clear all data from database

### Testing
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Utility Scripts
- `npm run check:accounts` - Check user account configurations
- `npm run fix:providers` - Fix user provider information
- `npm run fix:provider-info` - Fix provider info sync issues
- `npm run fix:orphaned` - Fix orphaned user records
- `npm run unlink:accounts` - Unlink and separate OAuth accounts

## 🏗️ Project Structure

```
/app              # Next.js app directory
  /api            # API routes
  /auth           # Authentication pages
  /(routes)       # Application pages
/components       # React components
  /shared         # Shared components
  /ui             # UI components
/hooks            # React hooks
/lib              # Utility functions and configurations
  /api            # API client and handlers
  /db             # Database queries
  /validation     # Zod schemas
/types            # TypeScript type definitions
/prisma           # Prisma schema
/scripts          # Utility scripts
/__tests__        # Test files
```

## 🐛 Troubleshooting

### Issues with Live Deployment

**Problem**: Can't access [https://heya-eight.vercel.app](https://heya-eight.vercel.app)

**Solutions**:
1. Check if the site is down - try refreshing the page
2. Check your internet connection
3. Try accessing from a different browser or device
4. The deployment may be experiencing issues - try again later

**Problem**: "Configuration" error when signing in on live site

**Solutions**:
1. This indicates an issue with the production deployment's environment variables
2. Try again later - the deployment may need to be fixed
3. For local testing, ensure your `.env.local` has all required variables
4. Visit `https://heya-eight.vercel.app/api/auth/debug` to see configuration status (if accessible)

**Problem**: OAuth sign-in fails on live site

**Solutions**:
1. Verify the OAuth provider (Google/GitHub) is working
2. Check if the callback URLs are correctly configured in the OAuth provider settings
3. Try a different OAuth provider if available
4. Clear browser cookies and try again

### Local Development Issues

**Problem**: "Configuration" error when signing in locally

**Solutions**:
1. Check that `AUTH_SECRET` (or `NEXTAUTH_SECRET`) is set and non-empty in `.env.local`
2. Verify `AUTH_URL` (or `NEXTAUTH_URL`) is set to `http://localhost:3000`
3. Ensure at least one OAuth provider has valid credentials
4. Check OAuth callback URLs include `http://localhost:3000/api/auth/callback/[provider]`
5. Visit `http://localhost:3000/api/auth/debug` to see configuration status

**Problem**: OAuth callback fails locally

**Solutions**:
1. Verify callback URL in OAuth provider settings includes `http://localhost:3000/api/auth/callback/[provider]`
2. Check that `AUTH_URL` is set to `http://localhost:3000` (must match exactly)
3. Ensure OAuth credentials are correct in `.env.local`
4. Restart the development server after changing environment variables

### Database Issues

**Problem**: "Can't reach database server"

**Solutions**:
1. Verify `DATABASE_URL` is correct
2. Check database is accessible (not blocked by firewall)
3. For Vercel Postgres, ensure connection pooling is configured if needed
4. Run `npx prisma db push` to ensure schema is up to date

**Problem**: Prisma Client not generated

**Solutions**:
1. Run `npm run db:generate`
2. Check that `postinstall` script ran (should auto-generate on `npm install`)
3. Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

### Local Development Issues

**Problem**: Port 3000 already in use

**Solutions**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

**Problem**: Database connection fails locally

**Solutions**:
1. Ensure PostgreSQL is running: `brew services start postgresql` (macOS)
2. Verify `DATABASE_URL` in `.env.local` is correct
3. Test connection: `psql $DATABASE_URL`
4. Check database exists: `createdb heya` (if using local DB)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Pusher Documentation](https://pusher.com/docs)

## 🧪 Testing

The project includes Jest and React Testing Library for unit tests. Tests are located in `__tests__/` directory.

Run tests:
```bash
npm test
```

For more information about testing setup, see [`__tests__/README.md`](./__tests__/README.md).

## 📝 Notes

- NextAuth v5 is used, which supports both `AUTH_SECRET`/`AUTH_URL` (preferred) and `NEXTAUTH_SECRET`/`NEXTAUTH_URL` (legacy)
- The app uses database sessions (sessions stored in PostgreSQL)
- OAuth accounts are not linked - same email with different providers creates separate accounts
- Pusher is optional - the app works without real-time features
- Prisma Client is auto-generated on `npm install` via `postinstall` script

## 🔒 Security Notes

- Never commit `.env` or `.env.local` files
- Use strong, randomly generated `AUTH_SECRET`
- Keep OAuth credentials secure
- Use connection pooling for production databases
- Regularly update dependencies: `npm audit` and `npm update`
