import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MemberList } from '@/components/admin/MemberList'

/**
 * Admin User Management Page
 * Only accessible to group admins
 */
export default async function AdminPage() {
  const session = await auth()

  // Check if user is authenticated
  if (!session?.user) {
    redirect('/login')
  }

  // Check if user is an admin
  if (session.user.role !== 'ADMIN') {
    redirect('/recipes')
  }

  return (
    <main className="flex min-h-screen flex-col p-4 sm:p-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your group and members
            </p>
          </div>
          <Link
            href="/recipes"
            className="rounded bg-gray-600 px-4 py-2 font-medium text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800"
          >
            ← Back to Recipes
          </Link>
        </div>

        {/* Admin Options Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/admin/settings"
            className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Group Settings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure group name and member permissions
            </p>
          </Link>
        </div>

        {/* Main content */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h2>
          <MemberList />
        </div>
      </div>
    </main>
  )
}
