import { NextRequest } from 'next/server'
import { withErrorHandling } from '@/lib/api/handlers/wrapper'
import { validateRequest } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { lookupUserSchema } from '@/lib/validation/schemas/user.schema'
import { prisma } from '@/lib/prisma'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

export const POST = withErrorHandling(async (request) => {
  const { userID } = await validateRequest(request, lookupUserSchema)

  // Find user by userID
  const user = await prisma.user.findUnique({
    where: { userID },
    select: {
      id: true,
      userID: true,
      name: true,
      provider: true,
      image: true,
      accounts: {
        select: {
          provider: true,
        },
        take: 1,
      },
    },
  })

  if (!user) {
    throw {
      error: 'User not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Get provider from user field or from Account (fallback)
  let provider = user.provider
  if (!provider || provider === '') {
    // Fallback: get provider from Account model
    if (user.accounts && user.accounts.length > 0) {
      provider = user.accounts[0].provider
      // Update user record with provider for future lookups
      if (provider) {
        await prisma.user.update({
          where: { id: user.id },
          data: { provider },
        })
      }
    }
  }

  // Check if we have a valid provider
  if (!provider || provider === '') {
    throw {
      error: 'User account is not properly configured. Please sign in with OAuth first.',
      code: ErrorCode.VALIDATION_ERROR,
      status: HttpStatus.BAD_REQUEST,
    }
  }

  return successResponse({
    userID: user.userID,
    name: user.name,
    provider: provider, // 'google', 'github', or 'facebook'
    image: user.image,
  })
})
