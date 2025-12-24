import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission, requireRecipeAccess } from '@/lib/authorization'
import type { Comment } from '@/types'

/**
 * POST /api/comments
 * Create a new comment on a recipe
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    await requirePermission('comment:create')

    // Parse request body
    const { recipeId, text } = await request.json()

    // Validation
    if (!recipeId || typeof recipeId !== 'string') {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      )
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be 2000 characters or less' },
        { status: 400 }
      )
    }

    // Verify user has access to recipe
    await requireRecipeAccess(session.user.id, recipeId)

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        recipeId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const transformedComment: Comment = {
      ...comment,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }

    return NextResponse.json(transformedComment, { status: 201 })
  } catch (error) {
    console.error('Create comment error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (
        error.message.includes('Forbidden') ||
        error.message.includes('not found')
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
