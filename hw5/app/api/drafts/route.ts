import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/drafts
 * Get user's drafts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const drafts = await prisma.draft.findMany({
      where: { userId: session.user.id },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({ drafts })
  } catch (error: any) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/drafts
 * Create a new draft
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const draft = await prisma.draft.create({
      data: {
        userId: session.user.id,
        content: content.trim(),
      },
    })

    return NextResponse.json({ draft })
  } catch (error: any) {
    console.error('Error creating draft:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


