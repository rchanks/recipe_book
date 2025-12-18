'use client'

import { signOut } from 'next-auth/react'

/**
 * Logout Button Component
 * Handles user logout
 */
export function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      Log Out
    </button>
  )
}
