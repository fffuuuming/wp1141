import { NextRequest } from 'next/server'
import { withErrorHandling } from '@/lib/api/handlers/wrapper'
import { successResponse } from '@/lib/api/helpers/response'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandling(async () => {
  // Get all registered users (excluding temporary userIDs)
  // Simplified query to avoid potential database issues
  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          userID: {
            startsWith: 'temp_',
          },
        },
      },
      select: {
        userID: true,
        name: true,
        provider: true,
        image: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 most recent users
    })

    // Filter out users with empty provider on the application side
    // This is more reliable than doing it in the database query
    const filteredUsers = users.filter(
      (user) => user.provider && user.provider.trim() !== ''
    )

    return successResponse({ users: filteredUsers })
  } catch (error) {
    // If there's a database error, return empty array instead of failing
    console.error('Error fetching user list:', error)
    return successResponse({ users: [] })
  }
})
