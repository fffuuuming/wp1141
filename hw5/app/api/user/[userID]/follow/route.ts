import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

/**
 * POST /api/user/[userID]/follow
 * Follow a user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userID: string }> }
) {
  try {
    const { userID } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { userID },
      select: { id: true },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Can't follow yourself
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if already following
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: session.user.id,
        followingId: targetUser.id,
      },
    })

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      )
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: targetUser.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error following user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/[userID]/follow
 * Unfollow a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userID: string }> }
) {
  try {
    const { userID } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { userID },
      select: { id: true },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Find and delete follow relationship
    const follow = await prisma.follow.findFirst({
      where: {
        followerId: session.user.id,
        followingId: targetUser.id,
      },
    })

    if (!follow) {
      return NextResponse.json(
        { error: 'Not following this user' },
        { status: 400 }
      )
    }

    await prisma.follow.delete({
      where: { id: follow.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error unfollowing user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

