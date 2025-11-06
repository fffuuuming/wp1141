# heya - Social Media Platform

A Twitter-like social media application built with Next.js, TypeScript, and Prisma.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/heya?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"

# Pusher
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

   **For Database Setup**: See [docs/stage-2/DATABASE_SETUP.md](./docs/stage-2/DATABASE_SETUP.md) for detailed instructions on setting up `DATABASE_URL`.

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

All project documentation is organized in the [`docs/`](./docs/) directory:
- **Development Plan**: [docs/PROJECT_PLAN.md](./docs/PROJECT_PLAN.md)
- **Stage Documentation**: See [docs/README.md](./docs/README.md) for index

## Project Structure

```
/app              # Next.js app directory
  /api            # API routes
  /auth           # Authentication routes
  /(routes)       # Application routes
/components       # React components
/lib              # Utility functions and configurations
/types            # TypeScript type definitions
/prisma           # Prisma schema and migrations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

