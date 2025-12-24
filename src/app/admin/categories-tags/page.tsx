import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/authorization'
import Link from 'next/link'
import { CategoryManager } from '@/components/admin/CategoryManager'
import { TagManager } from '@/components/admin/TagManager'
import { LogoutButton } from '@/components/auth/LogoutButton'

/**
 * Admin page for managing categories and tags
 * Accessible only to users with category:create or tag:create permissions (ADMIN/POWER_USER)
 */
export default async function CategoriesTagsPage() {
  const session = await auth()

  // Require authentication
  if (!session?.user) {
    redirect('/login')
  }

  // Check permissions
  const canManageCategories = hasPermission(session.user.role, 'category:create')
  const canManageTags = hasPermission(session.user.role, 'tag:create')

  // Redirect if user doesn't have permission
  if (!canManageCategories && !canManageTags) {
    redirect('/recipes')
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/recipes"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              ← Back to Recipes
            </Link>
            <span className="text-sm font-medium text-gray-400 dark:text-gray-600">
              •
            </span>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Categories & Tags
            </h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Categories section */}
        {canManageCategories && (
          <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <CategoryManager />
          </section>
        )}

        {/* Divider */}
        {canManageCategories && canManageTags && (
          <div className="border-t border-gray-200 dark:border-gray-700" />
        )}

        {/* Tags section */}
        {canManageTags && (
          <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <TagManager />
          </section>
        )}

        {/* No permission message */}
        {!canManageCategories && !canManageTags && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
            <p className="font-semibold">Access Denied</p>
            <p className="mt-1 text-sm">
              You don't have permission to manage categories and tags. Only
              admins and power users can access this page.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
