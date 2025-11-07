import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateRequest } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { draftSchema } from '@/lib/validation/schemas/draft.schema'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/drafts
 * Get user's drafts
 */
export const GET = withAuth(async (request, { session }) => {
  const drafts = await prisma.draft.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      content: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return successResponse({ drafts })
})

/**
 * POST /api/drafts
 * Create a new draft
 */
export const POST = withAuth(async (request, { session }) => {
  const { content } = await validateRequest(request, draftSchema)

  const draft = await prisma.draft.create({
    data: {
      userId: session.user.id,
      content: content.trim(),
    },
    select: {
      id: true,
      content: true,
      updatedAt: true,
    },
  })

  return successResponse({ draft })
})


