import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  hasPermission,
  requirePermission,
  requireRecipeAccess,
  canEditRecipe,
  canDeleteRecipe,
  requireGroupMembership,
} from '@/lib/authorization'
import { storage } from '@/lib/storage'
import type { Recipe, Ingredient, RecipeStep } from '@/types'

/**
 * GET /api/recipes/[id]
 * Get a single recipe
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    await requirePermission('recipe:read')

    // Verify access and get recipe
    await requireRecipeAccess(session.user.id, id)

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

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Phase 10: Draft access control - only creator can view drafts
    if (recipe.status === 'DRAFT' && recipe.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    const transformedRecipe: Recipe = {
      ...recipe,
      ingredients: recipe.ingredients as unknown as Ingredient[],
      steps: recipe.steps as unknown as RecipeStep[],
      creator: {
        id: recipe.creator.id,
        name: recipe.creator.name,
        email: recipe.creator.email,
      },
      favorites: [],
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    }

    return NextResponse.json(transformedRecipe)
  } catch (error) {
    console.error('Recipe detail error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message.includes('Forbidden') || error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/recipes/[id]
 * Update a recipe
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check base permission
    if (!hasPermission(session.user.role, 'recipe:update')) {
      return NextResponse.json(
        { error: 'Forbidden: Missing permission for recipe update' },
        { status: 403 }
      )
    }

    // Verify access to recipe's group
    await requireRecipeAccess(session.user.id, id)

    // Check group governance setting
    const canEdit = await canEditRecipe(session.user.id, session.user.groupId)
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Forbidden: Not allowed to edit recipes in this group' },
        { status: 403 }
      )
    }

    // Phase 10: Check draft ownership before getting full recipe
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      select: { status: true, createdBy: true },
    })

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Phase 10: If draft, only creator can edit
    if (existingRecipe.status === 'DRAFT' && existingRecipe.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own drafts' },
        { status: 403 }
      )
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
      photoUrl,
      categoryIds = [],
      tagIds = [],
      status, // Phase 10: Allow status updates (e.g., DRAFT -> PUBLISHED)
    } = body

    // Validate fields (same as POST)
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

    // Phase 10: Validate status field if provided
    if (status && status !== 'DRAFT' && status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Invalid status value. Must be DRAFT or PUBLISHED' },
        { status: 400 }
      )
    }

    // Delete existing category and tag associations
    await Promise.all([
      prisma.recipeCategory.deleteMany({
        where: { recipeId: id },
      }),
      prisma.recipeTag.deleteMany({
        where: { recipeId: id },
      }),
    ])

    // Update recipe with new categories and tags
    const recipe = await prisma.recipe.update({
      where: { id },
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
        photoUrl: photoUrl || null,
        ...(status && { status: status as 'DRAFT' | 'PUBLISHED' }), // Phase 10: Allow status updates
        categories: {
          create: (categoryIds as string[]).map((catId) => ({
            categoryId: catId,
          })),
        },
        tags: {
          create: (tagIds as string[]).map((tagId) => ({
            tagId,
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
      favorites: [],
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    }

    return NextResponse.json(transformedRecipe)
  } catch (error) {
    console.error('Recipe update error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message.includes('Forbidden') || error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/recipes/[id]
 * Delete a recipe (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check delete permission (admin only)
    if (!hasPermission(session.user.role, 'recipe:delete')) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can delete recipes' },
        { status: 403 }
      )
    }

    // Verify access to recipe's group
    await requireRecipeAccess(session.user.id, id)

    // Double-check admin status
    const canDelete = await canDeleteRecipe(session.user.id, session.user.groupId)
    if (!canDelete) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can delete recipes' },
        { status: 403 }
      )
    }

    // Before deleting recipe, delete associated photo if exists
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { photoUrl: true },
    })

    if (recipe?.photoUrl) {
      try {
        await storage.delete(recipe.photoUrl)
      } catch (error) {
        console.error('Failed to delete recipe photo:', error)
        // Continue with recipe deletion even if photo delete fails
      }
    }

    // Delete recipe
    await prisma.recipe.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error('Recipe delete error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message.includes('Forbidden') || error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
