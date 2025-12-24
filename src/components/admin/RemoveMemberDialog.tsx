'use client'

import { useState } from 'react'
import type { GroupMember } from '@/types'

interface RemoveMemberDialogProps {
  member: GroupMember
  onClose: () => void
  onSuccess: () => void
}

export function RemoveMemberDialog({
  member,
  onClose,
  onSuccess,
}: RemoveMemberDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  async function handleRemove() {
    setError(null)

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${member.userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold">Remove Member</h2>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Warning box */}
        <div className="mb-4 rounded-lg border-2 border-red-400 bg-red-50 p-4 dark:bg-red-900/30">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            ⚠️ Are you sure?
          </p>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            Removing <strong>{member.user.email}</strong> from the group will:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
            <li>• Revoke their access to all group recipes</li>
            <li>• Keep any recipes they created (ownership preserved)</li>
            <li>• Prevent them from logging in to this group</li>
          </ul>
        </div>

        {/* Confirmation checkbox */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I understand this action cannot be undone
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            disabled={loading || !confirmed}
            className="flex-1 rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
          >
            {loading ? 'Removing...' : 'Remove Member'}
          </button>
        </div>
      </div>
    </div>
  )
}
