'use client'

import { useState } from 'react'
import type { GroupMember, Role } from '@/types'

interface ChangeRoleDialogProps {
  member: GroupMember
  onClose: () => void
  onSuccess: () => void
}

export function ChangeRoleDialog({
  member,
  onClose,
  onSuccess,
}: ChangeRoleDialogProps) {
  const [newRole, setNewRole] = useState<Role>(member.role)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRoleLabel = (role: string) => {
    return role === 'ADMIN'
      ? 'Administrator'
      : role === 'POWER_USER'
        ? 'Editor'
        : 'Viewer'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newRole === member.role) {
      onClose()
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${member.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update role')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold">Change User Role</h2>

        <div className="mb-4 rounded bg-gray-50 p-3 dark:bg-gray-700/50">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>User:</strong> {member.user.email}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Current Role:</strong> {getRoleLabel(member.role)}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        {member.role === 'ADMIN' && newRole !== 'ADMIN' && (
          <div className="mb-4 rounded bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
            <p className="text-sm font-semibold">⚠️ Demoting from Administrator</p>
            <p className="mt-1 text-sm">
              This user will lose all administrative privileges.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New role selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Role <span className="text-red-600">*</span>
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              <option value="READ_ONLY">Viewer (Read-Only)</option>
              <option value="POWER_USER">Editor</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {/* Role descriptions */}
          <div className="rounded bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {newRole === 'ADMIN' && (
              <p>Full control: Create, edit, delete recipes, manage users</p>
            )}
            {newRole === 'POWER_USER' && (
              <p>Can create and edit recipes (delete restricted to admins)</p>
            )}
            {newRole === 'READ_ONLY' && (
              <p>Can only view recipes (no creation or editing)</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || newRole === member.role}
              className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {loading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
