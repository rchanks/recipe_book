/**
 * Recipe Page Header with Navigation Menu
 * Includes admin menu with manage users, categories, tags, dashboard, and logout options
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MenuIcon } from '@/components/ui/icons/MenuIcon'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { hasPermission } from '@/lib/authorization'

interface RecipePageHeaderProps {
  userRole: string
  canCreate: boolean
  recipeBookTitle?: string | null
}

export function RecipePageHeader({
  userRole,
  canCreate,
  recipeBookTitle,
}: RecipePageHeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const isAdmin = userRole === 'ADMIN'
  const canManageMetadata = hasPermission(userRole, 'category:create')

  return (
    <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {recipeBookTitle || 'Recipes'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your family's recipe collection
            </p>
          </div>

          {/* Navigation menu dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
              aria-label="Menu"
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {/* Dashboard - available to all users */}
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 first:rounded-t-lg"
                >
                  Go to Dashboard
                </Link>

                {/* Manage Users - admin only */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Manage Users
                  </Link>
                )}

                {/* Manage Categories - admin/power user */}
                {canManageMetadata && (
                  <Link
                    href="/admin/categories-tags"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Manage Categories
                  </Link>
                )}

                {/* Manage Tags - admin/power user */}
                {canManageMetadata && (
                  <Link
                    href="/admin/categories-tags"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Manage Tags
                  </Link>
                )}

                {/* Logout */}
                <LogoutButton
                  className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 last:rounded-b-lg"
                  onClick={() => setIsOpen(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Add Recipe button - visible below menu */}
        {canCreate && (
          <Link
            href="/recipes/new"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            + Add Recipe
          </Link>
        )}
      </div>
    </div>
  )
}
