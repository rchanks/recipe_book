import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GroupSettingsForm } from '@/components/admin/GroupSettingsForm'
import { LogoutButton } from '@/components/auth/LogoutButton'

/**
 * Group Settings page - admin only
 */
export default async function GroupSettingsPage() {
  const session = await auth()

  // Require authentication
  if (!session?.user) {
    redirect('/login')
  }

  // Require admin role
  if (session.user.role !== 'ADMIN') {
    redirect('/recipes')
  }

  // Fetch group
  const group = await prisma.group.findUnique({
    where: { id: session.user.groupId },
  })

  if (!group) {
    redirect('/recipes')
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              ← Back to Admin
            </Link>
            <span className="text-sm font-medium text-gray-400 dark:text-gray-600">
              •
            </span>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Group Settings
            </h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <GroupSettingsForm group={group} />
      </div>
    </main>
  )
}
