/**
 * Recipe Admin Menu Component
 * Dropdown menu for edit and delete functions with confirmation
 */

'use client'

import React from 'react'
import { MenuIcon } from '@/components/ui/icons/MenuIcon'

interface RecipeAdminMenuProps {
  canEdit?: boolean
  canDelete?: boolean
  onEdit: () => void
  onDelete: () => void
  isDeleting?: boolean
}

export function RecipeAdminMenu({
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  isDeleting = false,
}: RecipeAdminMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

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

  if (!canEdit && !canDelete) {
    return null
  }

  const handleEditClick = () => {
    onEdit()
    setIsOpen(false)
  }

  const handleDeleteClick = () => {
    setIsOpen(false)
    onDelete()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
        aria-label="Recipe menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MenuIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {canEdit && (
            <button
              onClick={handleEditClick}
              className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 first:rounded-t-lg"
            >
              Edit Recipe
            </button>
          )}

          {canDelete && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 last:rounded-b-lg"
            >
              {isDeleting ? 'Deleting...' : 'Delete Recipe'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
