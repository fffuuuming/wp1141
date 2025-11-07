import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateRequest, validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { draftSchema } from '@/lib/validation/schemas/draft.schema'
import { draftIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { requireOwnership } from '@/lib/api/middleware/auth'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * PUT /api/drafts/[id]
 * Update an existing draft
 */
export const PUT = withAuth(async (request, { params, session }) => {
  const { id } = await validateParams(await params, draftIdSchema)
  const { content } = await validateRequest(request, draftSchema)

  // Verify draft belongs to user
  const existingDraft = await prisma.draft.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!existingDraft) {
    throw {
      error: 'Draft not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  requireOwnership(existingDraft.userId, session.user.id)

  const draft = await prisma.draft.update({
    where: { id },
    data: {
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

/**
 * DELETE /api/drafts/[id]
 * Delete a draft
 */
export const DELETE = withAuth(async (request, { params, session }) => {
  const { id } = await validateParams(await params, draftIdSchema)

  // Verify draft belongs to user
  const draft = await prisma.draft.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!draft) {
    throw {
      error: 'Draft not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  requireOwnership(draft.userId, session.user.id)

  await prisma.draft.delete({
    where: { id },
  })

  return successResponse({ success: true })
})
