import { NextRequest } from 'next/server'
import { withErrorHandling } from '@/lib/api/handlers/wrapper'
import { successResponse } from '@/lib/api/helpers/response'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandling(async () => {
  // Get all registered users (excluding temporary userIDs)
  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          NOT: {
            userID: {
              startsWith: 'temp_',
            },
          },
        },
        {
          provider: {
            not: '',
          },
        },
      ],
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

  return successResponse({ users })
})
