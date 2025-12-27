'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LogoutButtonProps {
  className?: string
  onClick?: () => void
}

/**
 * Logout Button Component
 * Handles user logout
 * Can be used as a standalone button or in menus with custom styling
 */
export function LogoutButton({ className, onClick }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      // Sign out without redirect
      await signOut({ redirect: false })
      // Manually redirect to home
      router.push('/')
      // Refresh the page to clear any cached session state
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoading(false)
    }
  }

  const defaultClassName = 'rounded-lg bg-gray-200 px-4 py-2 font-medium transition-colors hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-700'

  return (
    <button
      onClick={() => {
        onClick?.()
        handleLogout()
      }}
      disabled={isLoading}
      className={className || defaultClassName}
    >
      {isLoading ? 'Logging out...' : 'Log Out'}
    </button>
  )
}
