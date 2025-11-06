import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateUserID } from '@/lib/userID'

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
    const { userID } = body

    if (!userID) {
      return NextResponse.json(
        { error: 'UserID is required' },
        { status: 400 }
      )
    }

    // Validate userID
    const validation = await validateUserID(userID)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check if user already has a userID (and it's not a temporary one)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userID: true },
    })

    if (user?.userID && !user.userID.startsWith('temp_')) {
      return NextResponse.json(
        { error: 'UserID already set' },
        { status: 400 }
      )
    }

    // Update user with userID
    await prisma.user.update({
      where: { id: session.user.id },
      data: { userID },
    })

    return NextResponse.json({ success: true, userID })
  } catch (error: any) {
    console.error('Error registering userID:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

