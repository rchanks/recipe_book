import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canEditRecipe, requireGroupMembership } from '@/lib/authorization'
import { RecipeForm } from '@/components/recipes/RecipeForm'
import type { Recipe, Ingredient, RecipeStep } from '@/types'

/**
 * Edit recipe page
 */
export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  // Require authentication
  if (!session?.user) {
    redirect('/login')
  }

  // Fetch recipe
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  // Check if recipe exists
  if (!recipe) {
    notFound()
  }

  // Verify user is in the same group as the recipe
  try {
    await requireGroupMembership(session.user.id, recipe.groupId)
  } catch (error) {
    notFound()
  }

  // Check if user can edit this recipe
  const canEdit = await canEditRecipe(session.user.id, session.user.groupId)
  if (!canEdit) {
    redirect(`/recipes/${id}`)
  }

  // Transform recipe to match Recipe type
  const transformedRecipe: Recipe = {
    ...recipe,
    ingredients: recipe.ingredients as unknown as Ingredient[],
    steps: recipe.steps as unknown as RecipeStep[],
    creator: {
      id: recipe.creator.id,
      name: recipe.creator.name,
      email: recipe.creator.email,
    },
    categories: recipe.categories,
    tags: recipe.tags,
    favorites: [],
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header with navigation */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/recipes/${id}`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            ← Back to Recipe
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          Edit Recipe
        </h1>
        <RecipeForm recipe={transformedRecipe} mode="edit" />
      </div>
    </main>
  )
}
