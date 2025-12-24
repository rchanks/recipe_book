'use client'

import { useState } from 'react'
import type { CreateUserResponse } from '@/types'
import { TempPasswordDisplay } from './TempPasswordDisplay'

interface InviteUserModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function InviteUserModal({ onClose, onSuccess }: InviteUserModalProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'POWER_USER' | 'READ_ONLY'>(
    'READ_ONLY'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdUser, setCreatedUser] = useState<CreateUserResponse | null>(
    null
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          role,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create user')
      }

      const data = (await response.json()) as CreateUserResponse
      setCreatedUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  // Show password display after successful creation
  if (createdUser) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
          <TempPasswordDisplay
            user={createdUser.user}
            temporaryPassword={createdUser.temporaryPassword}
            onClose={() => {
              setCreatedUser(null)
              setEmail('')
              setName('')
              setRole('READ_ONLY')
              onSuccess()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold">Invite User</h2>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Name field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Role field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role <span className="text-red-600">*</span>
            </label>
            <select
              value={role}
              onChange={(e) =>
                setRole(
                  e.target.value as 'ADMIN' | 'POWER_USER' | 'READ_ONLY'
                )
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              <option value="READ_ONLY">Viewer (Read-Only)</option>
              <option value="POWER_USER">Editor</option>
              <option value="ADMIN">Administrator</option>
            </select>
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
              disabled={loading}
              className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
