import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  canEditRecipe,
  canDeleteRecipe,
  requireGroupMembership,
} from '@/lib/authorization'
import { RecipeDetail } from '@/components/recipes/RecipeDetail'
import { RecipeDetailWrapper } from '@/components/recipes/RecipeDetailWrapper'
import { LogoutButton } from '@/components/auth/LogoutButton'
import type { Recipe, Ingredient, RecipeStep } from '@/types'

/**
 * Recipe detail page - displays a single recipe in cooking-friendly format
 */
export default async function RecipeDetailPage({
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

  // Fetch recipe with categories and tags
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
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
    },
  })

  // Check if user has favorited this recipe
  let isFavorited = false
  try {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId: id,
        },
      },
    })
    isFavorited = !!favorite
  } catch (error) {
    // Ignore error, just default to false
  }

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

  // Check permissions
  const canEdit = await canEditRecipe(session.user.id, session.user.groupId)
  const canDelete = await canDeleteRecipe(session.user.id, session.user.groupId)

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
    favorites: [], // Server-side, we only need to know if current user favorited it
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
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
        <RecipeDetailWrapper
          recipe={transformedRecipe}
          canEdit={canEdit}
          canDelete={canDelete}
          initialIsFavorited={isFavorited}
        />
      </div>
    </main>
  )
}
