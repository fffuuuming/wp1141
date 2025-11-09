import type { NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import NextAuth from 'next-auth'
import { prisma } from './prisma'

// Type assertion for Prisma client - account model exists but TypeScript may not recognize it
// This is safe because Prisma generates the client with lowercase model names
const prismaClient = prisma as typeof prisma & { account: any }

/**
 * Validate required environment variables for NextAuth
 * NextAuth v5 supports both AUTH_SECRET/NEXTAUTH_SECRET and AUTH_URL/NEXTAUTH_URL
 * This validation logs warnings but doesn't throw to avoid breaking the build
 */
function validateAuthConfig() {
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL

  if (!authSecret) {
    console.error('[Auth] ❌ CRITICAL: AUTH_SECRET or NEXTAUTH_SECRET is not set!')
    console.error('[Auth] NextAuth requires a secret key. Set AUTH_SECRET or NEXTAUTH_SECRET in your environment variables.')
    // Don't throw in production - let NextAuth handle the error gracefully
  } else {
    console.log('[Auth] ✅ Secret found:', authSecret ? 'Set' : 'Missing')
  }

  if (!authUrl && process.env.NODE_ENV === 'production') {
    console.warn('[Auth] ⚠️ AUTH_URL or NEXTAUTH_URL is not set in production. This may cause OAuth callback issues.')
    console.warn('[Auth] Set AUTH_URL or NEXTAUTH_URL to your production URL (e.g., https://wp-hw5-heya.vercel.app)')
  } else if (authUrl) {
    console.log('[Auth] ✅ Auth URL found:', authUrl)
  }

  return { authSecret, authUrl }
}

// Validate configuration on module load (non-blocking)
if (typeof window === 'undefined') {
  // Only run on server side
  validateAuthConfig()
}

/**
 * Generate a unique temporary userID for new users
 * Format: temp_{timestamp}_{random}
 */
async function generateTempUserID(): Promise<string> {
  let tempUserID = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  // Ensure uniqueness (collision is extremely rare, but check anyway)
  let exists = await prisma.user.findUnique({ where: { userID: tempUserID } })
  while (exists) {
    tempUserID = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
    exists = await prisma.user.findUnique({ where: { userID: tempUserID } })
  }
  
  return tempUserID
}

// Create base Prisma adapter
const baseAdapter = PrismaAdapter(prisma) as any

/**
 * Custom adapter that:
 * 1. Prevents account linking (different providers = separate accounts)
 * 2. Assigns temporary userIDs to new users
 * 3. Ensures provider info is synced correctly
 */
const customAdapter = {
  ...baseAdapter,

  /**
   * Create a new user with a temporary userID
   * This is called when a new OAuth account is created
   * 
   * IMPORTANT: We call the base adapter's createUser first to ensure
   * the Account record is created properly, then we update the user
   * with the temporary userID and provider info.
   */
  async createUser(user: any) {
    // Generate temporary userID first
    const tempUserID = await generateTempUserID()
    
    // Create user with temporary userID
    // The base adapter's createUser would fail because our schema requires userID
    // So we create it ourselves, but we need to ensure the Account is created later
    const createdUser = await prisma.user.create({
      data: {
        ...user,
        userID: tempUserID,
        provider: '', // Will be synced from Account in createUser event
        providerId: '', // Will be synced from Account in createUser event
      },
    })

    return createdUser
  },

  /**
   * Link account to user
   * 
   * IMPORTANT: This is called AFTER createUser, so the user already exists.
   * We should NOT create a new user here - we should link the account to the existing user.
   * The base adapter handles this correctly, so we just call it.
   * 
   * CRITICAL: After linking the account, we immediately sync provider info to the User model.
   * This ensures provider and providerId are set right away, avoiding timing issues.
   * 
   * The account linking prevention is handled by:
   * 1. getUserByEmail returning null (prevents email-based linking)
   * 2. getUserByAccount only finding by provider+providerId (prevents cross-provider linking)
   */
  async linkAccount(account: any) {
    // Use base adapter's linkAccount - it will link to the user created in createUser
    const linkedAccount = await baseAdapter.linkAccount(account)
    
    // Immediately sync provider info to User model after account is linked
    // This fixes the issue where provider/providerId weren't being set
    // We get userId from account.userId or find it via the account we just created
    const userId = account.userId || linkedAccount?.userId
    
    if (linkedAccount && userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            provider: account.provider,
            providerId: account.providerAccountId,
          },
        })
        console.log(`[Auth] ✅ Synced provider info in linkAccount for user ${userId}: ${account.provider} (${account.providerAccountId})`)
      } catch (error) {
        console.error(`[Auth] ⚠️ Failed to sync provider info in linkAccount for user ${userId}:`, error)
        // Fallback: try to find user by account and update
        try {
          const accountRecord = await prismaClient.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          })
          if (accountRecord) {
            await prisma.user.update({
              where: { id: accountRecord.userId },
              data: {
                provider: account.provider,
                providerId: account.providerAccountId,
              },
            })
            console.log(`[Auth] ✅ Synced provider info via fallback for user ${accountRecord.userId}`)
          }
        } catch (fallbackError) {
          console.error(`[Auth] ⚠️ Fallback sync also failed:`, fallbackError)
          // Don't throw - the createUser event will retry as backup
        }
      }
    }
    
    return linkedAccount
  },

  /**
   * Prevent email-based user lookups
   * This prevents NextAuth from finding existing users by email and linking accounts
   * Returns null to force creation of new accounts for different providers
   */
  async getUserByEmail(email: string) {
    // Always return null - we don't want email-based account linking
    // Different providers should create separate accounts even with same email
    return null
  },

  /**
   * Find user by provider + providerAccountId combination
   * This is the ONLY way users should be found - ensures provider isolation
   */
  async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
    const account = await prismaClient.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: true,
      },
    })
    return account?.user ?? null
  },
}

/**
 * Build providers array conditionally based on available credentials
 * This prevents configuration errors when credentials are missing
 */
function buildProviders() {
  const providers = []
  
  // Check Google OAuth credentials
  const hasGoogleId = !!process.env.GOOGLE_CLIENT_ID
  const hasGoogleSecret = !!process.env.GOOGLE_CLIENT_SECRET
  
  if (hasGoogleId && hasGoogleSecret) {
    try {
    providers.push(
      GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    )
      console.log('[Auth] ✅ Google OAuth provider configured')
    } catch (error) {
      console.error('[Auth] ❌ Error configuring Google provider:', error)
    }
  } else {
    console.warn('[Auth] ⚠️ Google OAuth credentials not found.')
    console.warn(`[Auth]   GOOGLE_CLIENT_ID: ${hasGoogleId ? 'Set' : 'Missing'}`)
    console.warn(`[Auth]   GOOGLE_CLIENT_SECRET: ${hasGoogleSecret ? 'Set' : 'Missing'}`)
  }
  
  // Check GitHub OAuth credentials
  const hasGitHubId = !!process.env.GITHUB_CLIENT_ID
  const hasGitHubSecret = !!process.env.GITHUB_CLIENT_SECRET
  
  if (hasGitHubId && hasGitHubSecret) {
    try {
    providers.push(
      GitHubProvider({
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      })
    )
      console.log('[Auth] ✅ GitHub OAuth provider configured')
    } catch (error) {
      console.error('[Auth] ❌ Error configuring GitHub provider:', error)
    }
  } else {
    console.warn('[Auth] ⚠️ GitHub OAuth credentials not found.')
    console.warn(`[Auth]   GITHUB_CLIENT_ID: ${hasGitHubId ? 'Set' : 'Missing'}`)
    console.warn(`[Auth]   GITHUB_CLIENT_SECRET: ${hasGitHubSecret ? 'Set' : 'Missing'}`)
  }
  
  if (providers.length === 0) {
    console.error('[Auth] ❌ No OAuth providers configured! Please set at least one provider\'s credentials.')
    console.error('[Auth] This will cause a Configuration error when trying to sign in.')
  } else {
    console.log(`[Auth] ✅ ${providers.length} OAuth provider(s) configured`)
  }
  
  return providers
}

/**
 * NextAuth configuration
 * Key features:
 * - Database session strategy (sessions stored in DB)
 * - Custom adapter prevents account linking
 * - Provider info synced after user creation
 * - Conditional provider loading (only enabled providers with credentials)
 */
// Build providers first to log diagnostics
const configuredProviders = buildProviders()

// Get secret with fallback
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL

// Log configuration status
if (typeof window === 'undefined') {
  console.log('[Auth] Configuration Status:')
  console.log(`[Auth]   Secret: ${authSecret ? '✅ Set' : '❌ Missing'}`)
  console.log(`[Auth]   URL: ${authUrl ? `✅ ${authUrl}` : '❌ Missing'}`)
  console.log(`[Auth]   Providers: ${configuredProviders.length}`)
  
  if (!authSecret) {
    console.error('[Auth] ❌ CRITICAL: AUTH_SECRET or NEXTAUTH_SECRET must be set!')
  }
  
  if (!authUrl && process.env.NODE_ENV === 'production') {
    console.error('[Auth] ❌ CRITICAL: AUTH_URL or NEXTAUTH_URL must be set in production!')
  }
}

export const authOptions: NextAuthConfig = {
  adapter: customAdapter as any,
  
  // Explicitly set secret - NextAuth v5 prefers AUTH_SECRET but supports NEXTAUTH_SECRET
  secret: authSecret,
  
  // Explicitly set trustHost for production deployments
  trustHost: true,
  
  providers: configuredProviders,

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours of activity
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    /**
     * Sign-in callback - validates that the user can sign in
     * Checks if user exists with this exact provider + providerId combination
     * Also syncs provider info as a backup if createUser event didn't sync it
     */
    async signIn({ user, account, profile }) {
      if (!account || !user) {
        console.error('[Auth] SignIn callback: Missing account or user', {
          hasAccount: !!account,
          hasUser: !!user,
        })
        return false
      }

      try {
        // Check if user already exists with this EXACT provider + providerId
        // First check User table, then check Account table as fallback (for users with missing provider/providerId)
        let existingUser = await prisma.user.findFirst({
          where: {
            provider: account.provider,
            providerId: account.providerAccountId,
          },
        })
        
        // Fallback: If not found in User table, check Account table
        // This handles cases where provider/providerId weren't synced properly
        if (!existingUser) {
          const accountRecord = await prismaClient.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            include: {
              user: true,
            },
          })
          existingUser = accountRecord?.user ?? null
        }

        // For existing users, always sync image and provider info from OAuth provider
        // This ensures the database always has the latest info from the OAuth provider
        if (existingUser) {
          const updateData: any = {}
          let needsUpdate = false

          // Get image from user object or profile (OAuth providers may pass it in different places)
          const oauthImage = user.image || (profile as any)?.avatar_url || (profile as any)?.picture || (profile as any)?.image

          // Always sync image from OAuth provider to ensure it's up-to-date
          // Update if: OAuth has image AND (DB image is null OR different)
          if (oauthImage && (!existingUser.image || oauthImage !== existingUser.image)) {
            updateData.image = oauthImage
            needsUpdate = true
          }

          // Sync provider info if missing
          if (!existingUser.provider || !existingUser.providerId) {
            updateData.provider = account.provider
            updateData.providerId = account.providerAccountId
            needsUpdate = true
          }

          // Update user if needed
          if (needsUpdate) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: updateData,
            })
            console.log(`[Auth] ✅ Synced user info in signIn callback for existing user ${existingUser.id}`, updateData)
          }

          return true
        }

        // For new users being created, sync image after user is created
        // The image will be synced in the createUser event
        // New account - allow creation
        // The adapter will handle creating a new user with temporary userID
        return true
      } catch (error) {
        console.error('[Auth] SignIn callback error:', error)
        return false
      }
    },

    /**
     * Session callback - enriches session with user data from database
     * Includes userID and other user information
     */
    async session({ session, user }) {
      if (session.user && user) {
        // Fetch full user data including userID
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            userID: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        })

        if (dbUser && dbUser.userID) {
          // Enrich session with user data
          Object.assign(session.user, {
            id: dbUser.id,
            userID: dbUser.userID,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image,
          })
        }
      }
      return session
    },
  },

  events: {
    /**
     * After user creation, sync provider info from Account model
     * This ensures the User model has the correct provider and providerId
     * 
     * IMPORTANT: This event fires AFTER the Account is created by the base adapter
     * However, there's a timing issue - the Account might be created AFTER this event fires.
     * So we also sync in the signIn callback as a backup.
     */
    async createUser({ user }) {
      if (!user.id) {
        console.warn('[Auth] createUser event: user.id is missing')
        return
      }

      // Retry mechanism: Account might not be created immediately
      // Increase retries and delay to handle slower account creation
      let account = null
      let retries = 15 // Increased retries even more
      const retryDelay = 300 // Increased delay (ms)

      console.log(`[Auth] createUser event: Syncing provider info for user ${user.id}`)

      while (!account && retries > 0) {
        account = await prismaClient.account.findFirst({
          where: { userId: user.id },
        })
        
        if (!account) {
          console.log(`[Auth] Account not found for user ${user.id}, retrying... (${retries} retries left)`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          retries--
        }
      }

      // Sync provider info and image from Account to User model
      if (account) {
        const updateData: any = {
          provider: account.provider,
          providerId: account.providerAccountId,
        }

        // Also sync image if it's available from the user object
        // This ensures the GitHub/Google avatar is saved
        if (user.image) {
          updateData.image = user.image
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        })
        console.log(`[Auth] ✅ Synced provider info and image for user ${user.id}: ${account.provider} (${account.providerAccountId})`)
      } else {
        console.warn(`[Auth] ⚠️ Could not find account for user ${user.id} after all retries`)
        console.warn(`[Auth] Will try to sync in signIn callback as backup`)
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
