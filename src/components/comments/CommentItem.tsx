'use client'

import { useState } from 'react'
import type { Comment } from '@/types'

interface CommentItemProps {
  comment: Comment
  canEdit: boolean
  canDelete: boolean
  onUpdate: (id: string, text: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function CommentItem({
  comment,
  canEdit,
  canDelete,
  onUpdate,
  onDelete,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpdate() {
    if (!editText.trim()) return

    try {
      setError(null)
      await onUpdate(comment.id, editText.trim())
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment')
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this comment?')) return
    setIsDeleting(true)

    try {
      setError(null)
      await onDelete(comment.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
      setIsDeleting(false)
    }
  }

  function formatRelativeTime(date: Date) {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    )
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <strong className="text-gray-900 dark:text-white">
            {comment.user.name || comment.user.email}
          </strong>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {(canEdit || canDelete) && !isEditing && (
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-sm text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            rows={3}
            maxLength={2000}
          />
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setEditText(comment.text)
              }}
              className="rounded bg-gray-300 px-3 py-1 text-sm dark:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
      )}
    </div>
  )
}
