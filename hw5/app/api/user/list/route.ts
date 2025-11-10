import { NextRequest } from 'next/server'
import { withOptionalAuth } from '@/lib/api/handlers/wrapper'
import { successResponse } from '@/lib/api/helpers/response'
import { prisma } from '@/lib/prisma'

export const GET = withOptionalAuth(async (request, { session }) => {
  // Only return users that the current user has logged in with
  // If user is logged in, return only their account
  // If user is not logged in, return empty array
  try {
    if (!session?.user?.id) {
      // User is not logged in, return empty array
      return successResponse({ users: [] })
    }

    // User is logged in, find their account
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        userID: true,
        name: true,
        provider: true,
        image: true,
        providerId: true,
      },
    })

    if (!currentUser || currentUser.userID.startsWith('temp_')) {
      // User not found or has temporary userID
      return successResponse({ users: [] })
    }

    // Filter out users with empty provider
    if (!currentUser.provider || currentUser.provider.trim() === '') {
      return successResponse({ users: [] })
    }

    // Return only the current user's account
    return successResponse({ users: [currentUser] })
  } catch (error) {
    // If there's a database error, return empty array instead of failing
    console.error('Error fetching user list:', error)
    return successResponse({ users: [] })
  }
})
