import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueSlug } from '@/lib/slug-utils'
import { hasPermission } from '@/lib/authorization'

/**
 * GET /api/tags/[id]
 * Get single tag
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

    const tag = await prisma.tag.findUnique({
      where: { id },
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Verify tag belongs to user's group
    if (tag.groupId !== session.user.groupId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error fetching tag:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/tags/[id]
 * Update tag (ADMIN, POWER_USER only)
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
    if (!hasPermission(session.user.role, 'tag:update')) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update tags' },
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
        { error: 'Tag name must be 50 characters or less' },
        { status: 400 }
      )
    }

    // Verify tag exists and belongs to user's group
    const tag = await prisma.tag.findUnique({
      where: { id },
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    if (tag.groupId !== session.user.groupId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Generate new slug if name changed
    let slug = tag.slug
    if (name.trim() !== tag.name) {
      slug = await generateUniqueSlug(
        name.trim(),
        session.user.groupId,
        'tag',
        id
      )
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
      },
    })

    return NextResponse.json(updatedTag)
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tags/[id]
 * Delete tag (ADMIN only)
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
    if (!hasPermission(session.user.role, 'tag:delete')) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can delete tags' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verify tag exists and belongs to user's group
    const tag = await prisma.tag.findUnique({
      where: { id },
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    if (tag.groupId !== session.user.groupId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete tag (cascade handles recipe associations)
    await prisma.tag.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Tag deleted successfully' })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    )
  }
}
