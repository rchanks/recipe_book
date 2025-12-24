import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueSlug } from '@/lib/slug-utils'
import { hasPermission } from '@/lib/authorization'

/**
 * GET /api/categories
 * List all categories for user's group
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

    const categories = await prisma.category.findMany({
      where: { groupId: session.user.groupId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories
 * Create new category (ADMIN, POWER_USER only)
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

    // Check permission
    if (!hasPermission(session.user.role, 'category:create')) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to create categories' },
        { status: 403 }
      )
    }

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

    // Generate unique slug
    const slug = await generateUniqueSlug(
      name.trim(),
      session.user.groupId,
      'category'
    )

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        groupId: session.user.groupId,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
