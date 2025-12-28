'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ImportRecipeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportRecipeModal({ isOpen, onClose }: ImportRecipeModalProps) {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate URL
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setIsImporting(true)

    try {
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to import recipe')
      }

      const { draft } = await response.json()
      setSuccess(true)
      setUrl('')

      // Navigate to edit page after a short delay to show success message
      setTimeout(() => {
        onClose()
        router.push(`/recipes/${draft.id}/edit`)
        router.refresh()
      }, 1000)
    } catch (err) {
      console.error('Import error:', err)
      setError(err instanceof Error ? err.message : 'Failed to import recipe')
    } finally {
      setIsImporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Import Recipe from URL
        </h2>

        <form onSubmit={handleImport} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-700 dark:bg-green-900 dark:text-green-200">
              Recipe imported successfully! Opening editor...
            </div>
          )}

          <div>
            <label
              htmlFor="recipe-url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Recipe URL
            </label>
            <input
              id="recipe-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/recipe/chocolate-cake"
              required
              disabled={isImporting || success}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Paste a link to any recipe page on the web
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isImporting || success || !url}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {isImporting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></span>
                  Importing...
                </>
              ) : (
                'Import Recipe'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          <p className="font-semibold mb-2">How it works:</p>
          <ol className="list-inside list-decimal space-y-1 text-xs">
            <li>Paste a recipe URL from any website</li>
            <li>AI extracts the recipe data</li>
            <li>Review and edit the draft</li>
            <li>Publish when ready</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
