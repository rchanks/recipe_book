'use client'

import { useState, useEffect } from 'react'
import type { Tag } from '@/types'

/**
 * Admin component to manage (create, update, delete) tags
 */
export function TagManager() {
  const [tags, setTags] = useState<Tag[]>([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch tags on mount
  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    try {
      setLoading(true)
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data.tags || [])
        setError('')
      }
    } catch (err) {
      console.error('Error fetching tags:', err)
      setError('Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!newName.trim()) {
      setError('Tag name is required')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create tag')
      }

      setNewName('')
      await fetchTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) {
      setError('Tag name is required')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const res = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update tag')
      }

      setEditingId(null)
      await fetchTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tag')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete tag "${name}"? This cannot be undone.`)) {
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const res = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete tag')
      }

      await fetchTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Manage Tags
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Create, update, or delete recipe tags for your group
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Create form */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          New Tag
        </label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="Enter tag name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:opacity-50"
            maxLength={50}
          />
          <button
            onClick={handleCreate}
            disabled={isSubmitting || !newName.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {newName.length}/50 characters
        </p>
      </div>

      {/* Tags list */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading tags...
          </p>
        ) : tags.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No tags yet. Create one to get started!
          </p>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              {editingId === tag.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdate(tag.id)}
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                    maxLength={50}
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(tag.id)}
                    disabled={isSubmitting}
                    className="rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    disabled={isSubmitting}
                    className="rounded bg-gray-400 px-3 py-2 text-sm font-medium text-white hover:bg-gray-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      #{tag.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {tag.slug}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingId(tag.id)
                      setEditingName(tag.name)
                      setError('')
                    }}
                    disabled={isSubmitting}
                    className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id, tag.name)}
                    disabled={isSubmitting}
                    className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
