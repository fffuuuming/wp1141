import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateRequest } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { registerUserIDSchema } from '@/lib/validation/schemas/user.schema'
import { validateUserID } from '@/lib/userID.server'
import { prisma } from '@/lib/prisma'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

export const POST = withAuth(async (request, { session }) => {
  const { userID } = await validateRequest(request, registerUserIDSchema)

  // Validate userID (server-side validation)
  const validation = await validateUserID(userID)
  if (!validation.valid) {
    throw {
      error: validation.error || 'Invalid userID',
      code: ErrorCode.INVALID_USERID,
      status: HttpStatus.BAD_REQUEST,
    }
  }

  // withAuth guarantees session exists, but TypeScript doesn't know that
  if (!session || !session.user || !session.user.id) {
    throw {
      error: 'Unauthorized',
      code: ErrorCode.UNAUTHORIZED,
      status: HttpStatus.UNAUTHORIZED,
    }
  }

  const userId = session.user.id

  // Check if user already has a userID (and it's not a temporary one)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userID: true },
  })

  if (user?.userID && !user.userID.startsWith('temp_')) {
    throw {
      error: 'UserID already set',
      code: ErrorCode.ALREADY_EXISTS,
      status: HttpStatus.BAD_REQUEST,
    }
  }

  // Update user with userID
  await prisma.user.update({
    where: { id: userId },
    data: { userID },
  })

  return successResponse({ success: true, userID })
})
