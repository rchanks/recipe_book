/**
 * Delete Confirmation Modal
 * Requires user to type recipe name to confirm deletion
 */

'use client'

import React from 'react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  recipeName: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmationModal({
  isOpen,
  recipeName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const [confirmText, setConfirmText] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isOpen) {
      setConfirmText('')
      inputRef.current?.focus()
    }
  }, [isOpen])

  const isConfirmed = confirmText === recipeName

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Delete Recipe?
        </h2>

        <p className="mb-2 text-gray-600 dark:text-gray-300">
          This action cannot be undone. To confirm deletion, type the recipe name:
        </p>

        <p className="mb-6 font-semibold text-gray-900 dark:text-white">
          {recipeName}
        </p>

        <input
          ref={inputRef}
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type recipe name to confirm"
          className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          disabled={isDeleting}
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={!isConfirmed || isDeleting}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
          >
            {isDeleting ? 'Deleting...' : 'Delete Forever'}
          </button>
        </div>
      </div>
    </div>
  )
}
