import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/auth/LogoutButton'

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

        <div className="rounded-lg border border-green-300 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/30">
          <h2 className="mb-2 text-lg font-semibold text-green-900 dark:text-green-300">
            Phase 2 Complete!
          </h2>
          <ul className="space-y-1 text-sm text-green-800 dark:text-green-400">
            <li>✅ User authentication working</li>
            <li>✅ Protected route verified</li>
            <li>✅ Session management active</li>
            <li>✅ Ready for Phase 3: Groups & Roles</li>
          </ul>
        </div>

        <LogoutButton />
      </div>
    </main>
  )
}
