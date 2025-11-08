import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FollowersFollowingPage } from '@/components/FollowersFollowingPage'

interface FollowersPageProps {
  params: Promise<{ userID: string }>
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { userID } = await params
  const session = await auth()

  // Find the user
  const user = await prisma.user.findUnique({
    where: { userID },
    select: {
      id: true,
      userID: true,
      name: true,
    },
  })

  if (!user) {
    redirect('/')
  }

  return <FollowersFollowingPage userID={userID} userName={user.name || user.userID} initialTab="followers" />
}

