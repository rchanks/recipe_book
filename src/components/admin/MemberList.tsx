'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { GroupMember } from '@/types'
import { InviteUserModal } from './InviteUserModal'
import { ChangeRoleDialog } from './ChangeRoleDialog'
import { RemoveMemberDialog } from './RemoveMemberDialog'

export function MemberList() {
  const { data: session } = useSession()
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedMemberForRole, setSelectedMemberForRole] = useState<GroupMember | null>(null)
  const [selectedMemberForRemove, setSelectedMemberForRemove] = useState<GroupMember | null>(null)

  // Fetch members on mount
  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/users')

      if (!response.ok) {
        throw new Error('Failed to load members')
      }

      const data = await response.json()
      setMembers(data.members || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    return role === 'ADMIN'
      ? 'Administrator'
      : role === 'POWER_USER'
        ? 'Editor'
        : 'Viewer'
  }

  const getRoleBadgeColor = (role: string) => {
    return role === 'ADMIN'
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      : role === 'POWER_USER'
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const adminCount = members.filter((m) => m.role === 'ADMIN').length
  const isLastAdmin = (member: GroupMember) =>
    member.role === 'ADMIN' && adminCount <= 1

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Loading members...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded bg-red-50 p-4 dark:bg-red-900/30">
        <p className="text-red-800 dark:text-red-200">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Invite button */}
      <button
        onClick={() => setShowInviteModal(true)}
        className="rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
      >
        + Invite User
      </button>

      {/* Members table */}
      {members.length === 0 ? (
        <div className="rounded bg-gray-50 p-8 text-center dark:bg-gray-700/50">
          <p className="text-gray-600 dark:text-gray-400">No members yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="border border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                  Name
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                  Email
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                  Role
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                  Joined
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                >
                  <td className="border border-gray-200 px-4 py-3 dark:border-gray-700">
                    {member.user.name || 'N/A'}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 dark:border-gray-700">
                    {member.user.email}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 dark:border-gray-700">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getRoleBadgeColor(
                        member.role
                      )}`}
                    >
                      {getRoleLabel(member.role)}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 dark:border-gray-700">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 dark:border-gray-700">
                    <div className="flex gap-2">
                      {/* Change role button */}
                      <button
                        onClick={() => setSelectedMemberForRole(member)}
                        disabled={
                          isLastAdmin(member) || session?.user?.id === member.userId
                        }
                        className="rounded bg-yellow-600 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-yellow-700 dark:hover:bg-yellow-800"
                      >
                        Change Role
                      </button>

                      {/* Remove button */}
                      <button
                        onClick={() => setSelectedMemberForRemove(member)}
                        disabled={
                          isLastAdmin(member) || session?.user?.id === member.userId
                        }
                        className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false)
            fetchMembers()
          }}
        />
      )}

      {selectedMemberForRole && (
        <ChangeRoleDialog
          member={selectedMemberForRole}
          onClose={() => setSelectedMemberForRole(null)}
          onSuccess={() => {
            setSelectedMemberForRole(null)
            fetchMembers()
          }}
        />
      )}

      {selectedMemberForRemove && (
        <RemoveMemberDialog
          member={selectedMemberForRemove}
          onClose={() => setSelectedMemberForRemove(null)}
          onSuccess={() => {
            setSelectedMemberForRemove(null)
            fetchMembers()
          }}
        />
      )}
    </div>
  )
}
