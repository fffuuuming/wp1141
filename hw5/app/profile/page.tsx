import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

/**
 * Fallback profile route
 * Redirects to sign-in if not authenticated, or to user's profile if authenticated
 */
export default async function ProfilePage() {
  const session = await auth()
  
  // If not authenticated, redirect to sign-in
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  // If authenticated, get userID and redirect to their profile
  const user = session.user as { userID?: string }
  const userID = user.userID
  
  if (userID && !userID.startsWith('temp_')) {
    redirect(`/profile/${userID}`)
  }
  
  // If user has temporary userID, redirect to sign-in to set it
  redirect('/auth/signin')
}

