import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/authorization'
import { RecipePageHeader } from '@/components/recipes/RecipePageHeader'
import { RecipeList } from '@/components/recipes/RecipeList'

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
      {/* Header with menu */}
      <RecipePageHeader
        userRole={session.user.role}
        canCreate={canCreate}
      />

      {/* Content */}
      <div className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <RecipeList />
        </div>
      </div>
    </main>
  )
}
