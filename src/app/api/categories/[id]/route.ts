import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueSlug } from '@/lib/slug-utils'
import { hasPermission } from '@/lib/authorization'

/**
 * GET /api/categories/[id]
 * Get single category
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Verify category belongs to user's group
    if (category.groupId !== session.user.groupId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/categories/[id]
 * Update category (ADMIN, POWER_USER only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user.role, 'category:update')) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update categories' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: 'Category name must be 50 characters or less' },
        { status: 400 }
      )
    }

    // Verify category exists and belongs to user's group
    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    if (category.groupId !== session.user.groupId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Generate new slug if name changed
    let slug = category.slug
    if (name.trim() !== category.name) {
      slug = await generateUniqueSlug(
        name.trim(),
        session.user.groupId,
        'category',
        id
      )
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete category (ADMIN only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user.role, 'category:delete')) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can delete categories' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verify category exists and belongs to user's group
    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    if (category.groupId !== session.user.groupId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete category (cascade handles recipe associations)
    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
