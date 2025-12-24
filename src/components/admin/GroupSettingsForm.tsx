'use client'

import { useState } from 'react'
import type { Group } from '@/types'
import { ToggleSwitch } from '../ui/ToggleSwitch'

interface GroupSettingsFormProps {
  group: Group
}

export function GroupSettingsForm({ group }: GroupSettingsFormProps) {
  const [name, setName] = useState(group.name)
  const [allowPowerUserEdit, setAllowPowerUserEdit] = useState(
    group.allowPowerUserEdit
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, allowPowerUserEdit }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update settings')
      }

      setSuccessMessage('Settings updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="groupName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Group Name
        </label>
        <input
          id="groupName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          maxLength={100}
          required
          disabled={isSubmitting}
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {name.length}/100 characters
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Allow Power Users to Edit Recipes
          </label>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            When enabled, Power Users can edit and create recipes. When
            disabled, only Admins can edit recipes.
          </p>
        </div>
        <ToggleSwitch
          checked={allowPowerUserEdit}
          onChange={setAllowPowerUserEdit}
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200">
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  )
}
