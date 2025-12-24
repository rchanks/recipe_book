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
            <h1 className="text-4xl font-bold mb-2">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage group members and their roles
            </p>
          </div>
          <Link
            href="/recipes"
            className="rounded bg-gray-600 px-4 py-2 font-medium text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800"
          >
            ← Back to Recipes
          </Link>
        </div>

        {/* Main content */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <MemberList />
        </div>
      </div>
    </main>
  )
}
