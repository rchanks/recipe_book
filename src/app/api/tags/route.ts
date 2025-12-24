import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueSlug } from '@/lib/slug-utils'
import { hasPermission } from '@/lib/authorization'

/**
 * GET /api/tags
 * List all tags for user's group
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

    const tags = await prisma.tag.findMany({
      where: { groupId: session.user.groupId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tags
 * Create new tag (ADMIN, POWER_USER only)
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
    if (!hasPermission(session.user.role, 'tag:create')) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to create tags' },
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
        { error: 'Tag name must be 50 characters or less' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(
      name.trim(),
      session.user.groupId,
      'tag'
    )

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug,
        groupId: session.user.groupId,
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}
