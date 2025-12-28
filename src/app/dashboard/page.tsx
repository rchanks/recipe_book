import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { hasPermission } from '@/lib/authorization'
import { RecipeBookTitleEditor } from '@/components/dashboard/RecipeBookTitleEditor'
import { prisma } from '@/lib/prisma'

/**
 * Dashboard Page - Protected Route Example
 * Only accessible to authenticated users
 */
export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Fetch group data to get recipe book title
  const group = await prisma.group.findUnique({
    where: { id: session.user.groupId },
    select: { recipeBookTitle: true },
  })

  // Check permission for managing categories and tags
  const canManageMetadata = hasPermission(session.user.role, 'category:create')

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
          <div className="space-y-4">
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

            {/* Recipe Book Title Editor */}
            <div className="border-t border-blue-200 pt-4 dark:border-blue-800">
              <label htmlFor="recipeBookTitle" className="mb-2 block text-sm font-semibold text-blue-900 dark:text-blue-300">
                Recipe Book Title
              </label>
              <p className="mb-3 text-xs text-blue-700 dark:text-blue-400">
                Customize the title shown on your recipes page
              </p>
              <RecipeBookTitleEditor
                currentTitle={group?.recipeBookTitle}
                groupId={session.user.groupId}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-purple-300 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-900/30">
          <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
            Recipe Management
          </h2>
          <p className="text-sm text-purple-800 dark:text-purple-400">
            View and organize your recipe collection
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/recipes"
              className="inline-block rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
            >
              📖 Go to Recipes
            </Link>
            {canManageMetadata && (
              <Link
                href="/admin/categories-tags"
                className="inline-block rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
              >
                🏷️ Manage Categories & Tags
              </Link>
            )}
          </div>
        </div>

        {session.user?.role === 'ADMIN' && (
          <div className="space-y-3 rounded-lg border border-orange-300 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-900/30">
            <h2 className="text-lg font-semibold text-orange-900 dark:text-orange-300">
              User Management
            </h2>
            <p className="text-sm text-orange-800 dark:text-orange-400">
              Manage group members and their roles
            </p>
            <Link
              href="/admin"
              className="inline-block rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
            >
              👥 Manage Users
            </Link>
          </div>
        )}

        <div className="rounded-lg border border-blue-300 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-300">
                AI/Bulk Recipe Import
              </h2>
              <p className="mb-4 text-sm text-blue-800 dark:text-blue-400">
                Coming in Phase 10 - Import recipes from AI or bulk upload
              </p>
            </div>
            <span className="whitespace-nowrap rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white dark:bg-blue-700">
              Coming Soon
            </span>
          </div>
          <div className="mt-4 space-y-2 text-sm text-blue-800 dark:text-blue-400">
            <p className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-300">•</span>
              AI-powered recipe import from images or text
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-300">•</span>
              Bulk upload multiple recipes at once
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-300">•</span>
              Import from popular recipe websites
            </p>
          </div>
        </div>

        <LogoutButton />
      </div>
    </main>
  )
}
