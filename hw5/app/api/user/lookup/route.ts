import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userID } = body

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
        userID: true,
        name: true,
        provider: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has a valid provider (not empty string)
    if (!user.provider || user.provider === '') {
      return NextResponse.json(
        { error: 'User account is not properly configured' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      userID: user.userID,
      name: user.name,
      provider: user.provider, // 'google', 'github', or 'facebook'
      image: user.image,
    })
  } catch (error: any) {
    console.error('Error looking up user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

