import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/authorization'
import { canEditRecipe } from '@/lib/authorization'
import { RecipeForm } from '@/components/recipes/RecipeForm'
import { LogoutButton } from '@/components/auth/LogoutButton'

/**
 * Create new recipe page
 */
export default async function NewRecipePage() {
  const session = await auth()

  // Require authentication
  if (!session?.user) {
    redirect('/login')
  }

  // Check base permission
  if (!hasPermission(session.user.role, 'recipe:create')) {
    redirect('/recipes')
  }

  // Check group governance setting (for POWER_USER)
  const canCreate = await canEditRecipe(session.user.id, session.user.groupId)
  if (!canCreate && session.user.role === 'POWER_USER') {
    // Actually, POWER_USER can create but the allowPowerUserEdit setting
    // only affects EDIT. So we allow creation.
    // This check is just for extra safety.
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header with navigation */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/recipes"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              ← Back to Recipes
            </Link>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          Add New Recipe
        </h1>
        <RecipeForm mode="create" />
      </div>
    </main>
  )
}
