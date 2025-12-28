'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RecipeBookTitleEditorProps {
  currentTitle?: string | null
  groupId: string
}

export function RecipeBookTitleEditor({
  currentTitle,
  groupId,
}: RecipeBookTitleEditorProps) {
  const [title, setTitle] = useState(currentTitle || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeBookTitle: title.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error Response:', errorData)
        throw new Error(errorData.error || 'Failed to update recipe book title')
      }

      setSuccessMessage('Recipe book title updated!')
      router.refresh()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      console.error('Error updating title:', err)
      setError('Failed to update title. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Recipes"
          maxLength={50}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          disabled={isSaving}
        />
        <button
          onClick={handleSave}
          disabled={isSaving || title === currentTitle}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Character count */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {title.length}/50 characters
      </p>

      {/* Success message */}
      {successMessage && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {successMessage}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Preview */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Preview: <span className="font-semibold">{title || 'Recipes'}</span>
      </p>
    </div>
  )
}
