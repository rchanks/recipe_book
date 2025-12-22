import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/authorization'
import { RecipeList } from '@/components/recipes/RecipeList'
import { LogoutButton } from '@/components/auth/LogoutButton'

/**
 * Recipe list page - displays all recipes for the user's group
 */
export default async function RecipesPage() {
  const session = await auth()

  // Require authentication
  if (!session?.user) {
    redirect('/login')
  }

  // Check read permission
  if (!hasPermission(session.user.role, 'recipe:read')) {
    redirect('/dashboard')
  }

  // Check create permission
  const canCreate = hasPermission(session.user.role, 'recipe:create')

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Recipes
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {session.user.groupSlug && (
                  <>
                    <span>Your family's recipe collection</span>
                  </>
                )}
              </p>
            </div>
            <LogoutButton />
          </div>
          {canCreate && (
            <Link
              href="/recipes/new"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              + Add Recipe
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <RecipeList />
        </div>
      </div>
    </main>
  )
}
