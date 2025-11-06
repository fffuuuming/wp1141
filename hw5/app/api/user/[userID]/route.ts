import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

/**
 * GET /api/user/[userID]
 * Fetch user profile data by userID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userID: string }> }
) {
  try {
    const { userID } = await params
    const session = await auth()
    const currentUserId = session?.user?.id

    if (!userID) {
      return NextResponse.json(
        { error: 'UserID is required' },
        { status: 400 }
      )
    }

    // Find user by userID
    const user = await prisma.user.findUnique({
      where: { userID },
      select: {
        id: true,
        userID: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        backgroundImage: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            following: true,
            followers: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if current user follows this user
    let isFollowing = false
    if (currentUserId && currentUserId !== user.id) {
      const follow = await prisma.follow.findFirst({
        where: {
          followerId: currentUserId,
          followingId: user.id,
        },
      })
      isFollowing = !!follow
    }

    // Check if this is the current user's own profile
    const isOwnProfile = currentUserId === user.id

    return NextResponse.json({
      user: {
        id: user.id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        backgroundImage: user.backgroundImage,
        createdAt: user.createdAt,
        stats: {
          posts: user._count.posts,
          following: user._count.following,
          followers: user._count.followers,
        },
      },
      isFollowing,
      isOwnProfile,
    })
  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/[userID]
 * Update user profile (own profile only)
 */
export async function PUT(
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

    // Verify this is the user's own profile
    const user = await prisma.user.findUnique({
      where: { userID },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own profile' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { bio, backgroundImage, image } = body

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(backgroundImage !== undefined && { backgroundImage }),
        ...(image !== undefined && { image }),
      },
      select: {
        id: true,
        userID: true,
        name: true,
        image: true,
        bio: true,
        backgroundImage: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

