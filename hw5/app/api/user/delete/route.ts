import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { successResponse } from '@/lib/api/helpers/response'
import { prisma } from '@/lib/prisma'

export const DELETE = withAuth(async (request, { session }) => {
  const userId = session.user.id

  // Delete the user - this will cascade delete all related data
  // (posts, comments, likes, reposts, drafts, follows)
  await prisma.user.delete({
    where: { id: userId },
  })

  return successResponse({
    success: true,
    message: 'Account and all associated data deleted successfully',
  })
})
