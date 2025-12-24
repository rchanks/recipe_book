'use client'

import { useState } from 'react'
import type { UserPublic } from '@/types'

interface TempPasswordDisplayProps {
  user: UserPublic
  temporaryPassword: string
  onClose: () => void
}

export function TempPasswordDisplay({
  user,
  temporaryPassword,
  onClose,
}: TempPasswordDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-xl font-bold">User Created Successfully!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          User <strong>{user.email}</strong> has been created with the temporary
          password below.
        </p>
      </div>

      {/* Warning box */}
      <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4 dark:bg-yellow-900/30">
        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
          ⚠️ Important: Share this password securely
        </p>
        <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
          This is the only time the password will be displayed. Share it with the
          user through a secure channel (email, SMS, in-person, etc).
        </p>
      </div>

      {/* Password display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Temporary Password
        </label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            readOnly
            value={temporaryPassword}
            className="flex-1 rounded border-2 border-blue-400 bg-blue-50 px-4 py-3 font-mono text-lg font-bold dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-200"
          />
          <button
            onClick={handleCopyPassword}
            className="rounded bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Password requirements */}
      <div className="rounded bg-gray-50 p-4 dark:bg-gray-700/50">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Password Details
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>• Email: {user.email}</li>
          <li>• Temporary password (16 characters)</li>
          <li>• User can change password after first login</li>
        </ul>
      </div>

      <button
        onClick={onClose}
        className="w-full rounded bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
      >
        Done
      </button>
    </div>
  )
}
