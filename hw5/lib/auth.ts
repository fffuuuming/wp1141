import type { NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import NextAuth from 'next-auth'
import { prisma } from './prisma'

// Create base adapter
const baseAdapter = PrismaAdapter(prisma) as any

// Custom adapter wrapper to handle userID creation
const customAdapter = {
  ...baseAdapter,
  async createUser(user: any) {
    // Generate a unique temporary userID
    let tempUserID = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // Ensure uniqueness (in case of collision, which is extremely rare)
    let exists = await prisma.user.findUnique({ where: { userID: tempUserID } })
    while (exists) {
      tempUserID = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
      exists = await prisma.user.findUnique({ where: { userID: tempUserID } })
    }

    // Create user with temporary userID and default provider values
    const createdUser = await prisma.user.create({
      data: {
        ...user,
        userID: tempUserID,
        provider: user.provider || '',
        providerId: user.providerId || '',
      },
    })

    return createdUser
  },
}

export const authOptions: NextAuthConfig = {
  adapter: customAdapter as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !user) {
        console.error('SignIn callback: Missing account or user', { account: !!account, user: !!user })
        return false
      }

      try {
        // Check if user already exists with this provider
        const existingUser = await prisma.user.findFirst({
          where: {
            provider: account.provider,
            providerId: account.providerAccountId,
          },
        })

        // If user exists, allow sign in
        if (existingUser) {
          return true
        }

        // New user - will be created by adapter
        // We'll handle userID assignment after creation
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },
    async session({ session, user }) {
      if (session.user && user) {
        // Get full user data including userID
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
          // Use Object.assign to bypass TypeScript strict checking
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
    async createUser({ user }) {
      // When a new user is created, sync provider info from Account
      if (user.id) {
        // Get the account to extract provider info
        const account = await prisma.account.findFirst({
          where: { userId: user.id },
        })

        // Sync provider info from Account if available
        if (account) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              provider: account.provider,
              providerId: account.providerAccountId,
            },
          })
        }
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
