'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/auth/signin')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
    >
      Logout
    </button>
  )
}

