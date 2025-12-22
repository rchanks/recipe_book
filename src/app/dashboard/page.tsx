import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { hasPermission } from '@/lib/authorization'

/**
 * Dashboard Page - Protected Route Example
 * Only accessible to authenticated users
 */
export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
          <h2 className="mb-2 text-lg font-semibold">Welcome!</h2>
          <p className="text-gray-700 dark:text-gray-300">
            You are logged in as:{' '}
            <strong>{session.user?.email}</strong>
          </p>
          {session.user?.name && (
            <p className="text-gray-700 dark:text-gray-300">
              Name: <strong>{session.user.name}</strong>
            </p>
          )}
        </div>

        <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/30">
          <h2 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-300">
            Group & Role Information
          </h2>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
            <p>
              Group: <strong>{session.user?.groupSlug || 'Not assigned'}</strong>
            </p>
            <p>
              Role:{' '}
              <strong>
                {session.user?.role
                  ? session.user.role === 'ADMIN'
                    ? 'Administrator'
                    : session.user.role === 'POWER_USER'
                      ? 'Editor'
                      : 'Viewer'
                  : 'Not assigned'}
              </strong>
            </p>
            {session.user?.role === 'ADMIN' && (
              <p className="text-blue-700 dark:text-blue-300">
                📋 You have full administrative control over this group.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-purple-300 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-900/30">
          <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
            Phase 4: Recipe Management
          </h2>
          <p className="text-sm text-purple-800 dark:text-purple-400">
            View and manage recipes for your group
          </p>
          <Link
            href="/recipes"
            className="inline-block rounded bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
          >
            📖 Go to Recipes
          </Link>
        </div>

        <div className="rounded-lg border border-green-300 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/30">
          <h2 className="mb-2 text-lg font-semibold text-green-900 dark:text-green-300">
            Phase 3 Complete!
          </h2>
          <ul className="space-y-1 text-sm text-green-800 dark:text-green-400">
            <li>✅ Groups & Roles system active</li>
            <li>✅ User automatically assigned to group</li>
            <li>✅ Role-based access control implemented</li>
            <li>✅ Authorization helpers in place</li>
          </ul>
        </div>

        <LogoutButton />
      </div>
    </main>
  )
}
