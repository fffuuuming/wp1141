import { NextResponse } from 'next/server'

/**
 * Debug endpoint to check NextAuth configuration
 * This helps diagnose Configuration errors
 * 
 * Access: GET /api/auth/debug
 * 
 * ⚠️ This endpoint shows configuration status but does NOT expose secret values
 * Consider removing or securing this endpoint after debugging
 */
export async function GET() {
  // Allow access in production for debugging purposes
  // This endpoint only shows whether variables are set, not their values

  const config = {
    // Check secrets
    secrets: {
      AUTH_SECRET: process.env.AUTH_SECRET ? '✅ Set' : '❌ Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
      hasSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    },
    
    // Check URLs
    urls: {
      AUTH_URL: process.env.AUTH_URL || '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Missing',
      hasUrl: !!(process.env.AUTH_URL || process.env.NEXTAUTH_URL),
    },
    
    // Check OAuth providers
    providers: {
      google: {
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
        CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
        configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      },
      github: {
        CLIENT_ID: process.env.GITHUB_CLIENT_ID ? '✅ Set' : '❌ Missing',
        CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
        configured: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      },
    },
    
    // Environment info
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? '✅ Vercel' : '❌ Not Vercel',
      VERCEL_URL: process.env.VERCEL_URL || 'Not set',
    },
    
    // Summary
    summary: {
      hasSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
      hasUrl: !!(process.env.AUTH_URL || process.env.NEXTAUTH_URL),
      hasGoogle: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      hasGitHub: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      hasAnyProvider: !!(
        (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ||
        (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
      ),
      isConfigured: !!(
        (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) &&
        (process.env.AUTH_URL || process.env.NEXTAUTH_URL) &&
        (
          (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ||
          (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
        )
      ),
    },
  }

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

