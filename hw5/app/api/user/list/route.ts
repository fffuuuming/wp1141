import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all registered users (excluding temporary userIDs)
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              userID: {
                startsWith: 'temp_',
              },
            },
          },
          {
            provider: {
              not: '',
            },
          },
        ],
      },
      select: {
        userID: true,
        name: true,
        provider: true,
        image: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 most recent users
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('Error listing users:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

