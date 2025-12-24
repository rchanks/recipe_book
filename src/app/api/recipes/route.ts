import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, requirePermission, canEditRecipe } from '@/lib/authorization'
import type { Recipe, Ingredient, RecipeStep } from '@/types'

/**
 * GET /api/recipes
 * List all recipes for the user's group with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    await requirePermission('recipe:read')

    // Get pagination and filter parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''
    const categoryIds = searchParams.get('categoryIds')?.split(',').filter(Boolean) || []
    const tagIds = searchParams.get('tagIds')?.split(',').filter(Boolean) || []
    const favoritesOnly = searchParams.get('favoritesOnly') === 'true'
    const sortBy = searchParams.get('sortBy') || 'recent'

    // Build where clause dynamically
    const where: any = {
      groupId: session.user.groupId,
    }

    // Text search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Category filter
    if (categoryIds.length > 0) {
      where.categories = {
        some: { categoryId: { in: categoryIds } },
      }
    }

    // Tag filter
    if (tagIds.length > 0) {
      where.tags = {
        some: { tagId: { in: tagIds } },
      }
    }

    // Favorites filter
    let favoriteRecipeIds: string[] = []
    if (favoritesOnly) {
      const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        select: { recipeId: true },
      })
      favoriteRecipeIds = favorites.map((f) => f.recipeId)

      if (favoriteRecipeIds.length === 0) {
        return NextResponse.json({
          recipes: [],
          total: 0,
          page,
          totalPages: 0,
        })
      }

      where.id = { in: favoriteRecipeIds }
    }

    // Sort order
    const orderBy: any =
      sortBy === 'title'
        ? { title: 'asc' }
        : sortBy === 'prepTime'
          ? { prepTime: 'asc' }
          : { createdAt: 'desc' } // default: recent

    // Fetch recipes for this group
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ])

    // Transform recipes to include correct creator type
    const transformedRecipes: Recipe[] = recipes.map((recipe) => ({
      ...recipe,
      ingredients: recipe.ingredients as unknown as Ingredient[],
      steps: recipe.steps as unknown as RecipeStep[],
      creator: {
        id: recipe.creator.id,
        name: recipe.creator.name,
        email: recipe.creator.email,
      },
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    }))

    return NextResponse.json({
      recipes: transformedRecipes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Recipe list error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/recipes
 * Create a new recipe
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check base permission
    if (!hasPermission(session.user.role, 'recipe:create')) {
      return NextResponse.json(
        { error: 'Forbidden: Missing permission for recipe creation' },
        { status: 403 }
      )
    }

    // Check group governance setting
    const canCreate = await canEditRecipe(session.user.id, session.user.groupId)
    if (!canCreate && session.user.role === 'POWER_USER') {
      // POWER_USER can create even if they can't edit, but they need to have edit permission
      // Actually, according to requirements, POWER_USER can always create
      // Only EDIT is restricted by allowPowerUserEdit. So we allow the creation.
    }

    // Parse request body
    const body = await request.json()
    const {
      title,
      description,
      ingredients,
      steps,
      servings,
      prepTime,
      cookTime,
      notes,
      familyStory,
      categoryIds = [],
      tagIds = [],
    } = body

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      )
    }

    // Validate ingredients
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      )
    }

    const validIngredients = ingredients.filter(
      (i: any) => typeof i.name === 'string' && i.name.trim().length > 0
    )
    if (validIngredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient with a name is required' },
        { status: 400 }
      )
    }

    // Validate steps
    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: 'At least one step is required' },
        { status: 400 }
      )
    }

    const validSteps = steps.filter(
      (s: any) =>
        typeof s.instruction === 'string' && s.instruction.trim().length > 0
    )
    if (validSteps.length === 0) {
      return NextResponse.json(
        { error: 'At least one step with instructions is required' },
        { status: 400 }
      )
    }

    // Validate optional numeric fields
    if (servings !== undefined && servings !== null) {
      const servingsNum = parseInt(servings)
      if (isNaN(servingsNum) || servingsNum < 1) {
        return NextResponse.json(
          { error: 'Servings must be a positive integer' },
          { status: 400 }
        )
      }
    }

    if (prepTime !== undefined && prepTime !== null) {
      const prepNum = parseInt(prepTime)
      if (isNaN(prepNum) || prepNum < 0) {
        return NextResponse.json(
          { error: 'Prep time must be a non-negative integer' },
          { status: 400 }
        )
      }
    }

    if (cookTime !== undefined && cookTime !== null) {
      const cookNum = parseInt(cookTime)
      if (isNaN(cookNum) || cookNum < 0) {
        return NextResponse.json(
          { error: 'Cook time must be a non-negative integer' },
          { status: 400 }
        )
      }
    }

    // Create recipe with categories and tags
    const recipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        ingredients: validIngredients,
        steps: validSteps.map((s: any, idx: number) => ({
          stepNumber: idx + 1,
          instruction: s.instruction.trim(),
          notes: s.notes ? s.notes.trim() : null,
        })),
        servings: servings ? parseInt(servings) : null,
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        notes: notes ? notes.trim() : null,
        familyStory: familyStory ? familyStory.trim() : null,
        createdBy: session.user.id,
        groupId: session.user.groupId,
        categories: {
          create: (categoryIds as string[]).map((id) => ({
            categoryId: id,
          })),
        },
        tags: {
          create: (tagIds as string[]).map((id) => ({
            tagId: id,
          })),
        },
      },
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

    const transformedRecipe: Recipe = {
      ...recipe,
      ingredients: recipe.ingredients as unknown as Ingredient[],
      steps: recipe.steps as unknown as RecipeStep[],
      creator: {
        id: recipe.creator.id,
        name: recipe.creator.name,
        email: recipe.creator.email,
      },
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    }

    return NextResponse.json(transformedRecipe, { status: 201 })
  } catch (error) {
    console.error('Recipe creation error:', error)

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      if (prismaError.code === 'P2003') {
        console.error('Foreign key constraint error:', prismaError.meta)
        return NextResponse.json(
          { error: 'Invalid user or group reference. Please log out and log back in.' },
          { status: 400 }
        )
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
