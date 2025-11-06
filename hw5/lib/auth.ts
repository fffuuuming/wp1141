import type { NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import NextAuth from 'next-auth'
import { prisma } from './prisma'

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
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
      if (!account || !user) return false

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
      // When a new user is created, generate a temporary userID
      // This will be replaced when user sets their actual userID
      if (user.id) {
        const tempUserID = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
        await prisma.user.update({
          where: { id: user.id },
          data: { userID: tempUserID },
        })
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
