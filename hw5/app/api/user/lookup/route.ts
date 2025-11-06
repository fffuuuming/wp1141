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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
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
      return NextResponse.json(
        { error: 'User account is not properly configured. Please sign in with OAuth first.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      userID: user.userID,
      name: user.name,
      provider: provider, // 'google', 'github', or 'facebook'
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

