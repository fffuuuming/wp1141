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

  const authSecret = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)?.trim()
  const authUrl = (process.env.AUTH_URL || process.env.NEXTAUTH_URL)?.trim()
  
  const config = {
    // Check secrets
    secrets: {
      AUTH_SECRET: process.env.AUTH_SECRET ? (process.env.AUTH_SECRET.trim() ? '✅ Set (non-empty)' : '⚠️ Set but EMPTY') : '❌ Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? (process.env.NEXTAUTH_SECRET.trim() ? '✅ Set (non-empty)' : '⚠️ Set but EMPTY') : '❌ Missing',
      hasSecret: !!authSecret,
      secretLength: authSecret?.length || 0,
      secretPreview: authSecret ? `${authSecret.substring(0, 10)}...` : 'N/A',
    },
    
    // Check URLs
    urls: {
      AUTH_URL: process.env.AUTH_URL ? (process.env.AUTH_URL.trim() ? `✅ ${process.env.AUTH_URL.trim()}` : '⚠️ Set but EMPTY') : '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? (process.env.NEXTAUTH_URL.trim() ? `✅ ${process.env.NEXTAUTH_URL.trim()}` : '⚠️ Set but EMPTY') : '❌ Missing',
      hasUrl: !!authUrl,
      resolvedUrl: authUrl || 'N/A',
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
      hasSecret: !!authSecret,
      hasValidSecret: !!(authSecret && authSecret.length > 0),
      hasUrl: !!authUrl,
      hasGoogle: !!(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()),
      hasGitHub: !!(process.env.GITHUB_CLIENT_ID?.trim() && process.env.GITHUB_CLIENT_SECRET?.trim()),
      hasAnyProvider: !!(
        (process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()) ||
        (process.env.GITHUB_CLIENT_ID?.trim() && process.env.GITHUB_CLIENT_SECRET?.trim())
      ),
      isConfigured: !!(
        authSecret &&
        authSecret.length > 0 &&
        authUrl &&
        (
          (process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()) ||
          (process.env.GITHUB_CLIENT_ID?.trim() && process.env.GITHUB_CLIENT_SECRET?.trim())
        )
      ),
      potentialIssues: [
        !authSecret && 'Secret is missing',
        authSecret && authSecret.length === 0 && 'Secret is empty string',
        !authUrl && 'URL is missing',
        !process.env.GOOGLE_CLIENT_ID?.trim() && !process.env.GITHUB_CLIENT_ID?.trim() && 'No OAuth providers configured',
      ].filter(Boolean),
    },
  }

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

