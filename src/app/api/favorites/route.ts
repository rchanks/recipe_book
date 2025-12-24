import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireGroupMembership } from '@/lib/authorization'

/**
 * GET /api/favorites
 * Get user's favorite recipe IDs
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { recipeId: true },
    })

    const favoriteRecipeIds = favorites.map((f) => f.recipeId)

    return NextResponse.json({ favoriteRecipeIds })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/favorites
 * Add recipe to user's favorites
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipeId } = body

    if (!recipeId || typeof recipeId !== 'string') {
      return NextResponse.json(
        { error: 'recipeId is required and must be a string' },
        { status: 400 }
      )
    }

    // Verify recipe exists and belongs to user's group
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { groupId: true },
    })

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Verify user is member of recipe's group
    await requireGroupMembership(session.user.id, recipe.groupId)

    // Create favorite (unique constraint handles duplicates gracefully)
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        recipeId,
      },
    }).catch((error) => {
      // If unique constraint violation, just return success
      if (error.code === 'P2002') {
        return { userId: session.user.id, recipeId, createdAt: new Date() }
      }
      throw error
    })

    return NextResponse.json(
      { message: 'Added to favorites', favorite },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    console.error('Error adding to favorites:', error)
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/favorites
 * Remove recipe from user's favorites
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipeId } = body

    if (!recipeId || typeof recipeId !== 'string') {
      return NextResponse.json(
        { error: 'recipeId is required and must be a string' },
        { status: 400 }
      )
    }

    // Delete favorite where userId AND recipeId match
    await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        recipeId,
      },
    })

    return NextResponse.json({ message: 'Removed from favorites' })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    )
  }
}
