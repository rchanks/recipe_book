import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireGroupMembership, requirePermission, hasPermission } from '@/lib/authorization'
import { generateSlug } from '@/lib/slug-utils'
import type { UpdateGroupRequest } from '@/types'

/**
 * GET /api/groups/[id]
 * Get group details including governance settings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify user is a member of this group
    await requireGroupMembership(session.user.id, id)

    // Fetch group
    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        allowPowerUserEdit: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error fetching group:', error)

    if (error instanceof Error) {
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
    }

    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}

/**
 * PUT /api/groups/[id]
 * Update group settings (admin only)
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

    // Check permission
    if (!hasPermission(session.user.role, 'group:update')) {
      return NextResponse.json(
        { error: 'Forbidden: Missing permission for group update' },
        { status: 403 }
      )
    }

    // Verify user is admin of this group
    if (session.user.groupId !== id) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot update this group' },
        { status: 403 }
      )
    }

    // Verify user is a member and get their role
    const membership = await requireGroupMembership(session.user.id, id)
    if (membership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: You must be an admin of this group' },
        { status: 403 }
      )
    }

    // Parse request body
    const body: UpdateGroupRequest = await request.json()
    const { name, allowPowerUserEdit } = body

    // Build update data
    const updateData: any = {}

    // Validate and update name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Group name is required' },
          { status: 400 }
        )
      }

      if (name.length > 100) {
        return NextResponse.json(
          { error: 'Group name must be 100 characters or less' },
          { status: 400 }
        )
      }

      updateData.name = name.trim()

      // Generate new slug if name changed
      const baseSlug = generateSlug(name)

      // Check uniqueness (allow current group)
      const existingGroup = await prisma.group.findUnique({
        where: { slug: baseSlug },
      })

      if (existingGroup && existingGroup.id !== id) {
        return NextResponse.json(
          { error: 'A group with this name already exists' },
          { status: 400 }
        )
      }

      updateData.slug = baseSlug
    }

    // Validate and update allowPowerUserEdit if provided
    if (allowPowerUserEdit !== undefined) {
      if (typeof allowPowerUserEdit !== 'boolean') {
        return NextResponse.json(
          { error: 'allowPowerUserEdit must be a boolean' },
          { status: 400 }
        )
      }

      updateData.allowPowerUserEdit = allowPowerUserEdit
    }

    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update group
    const group = await prisma.group.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error('Update group error:', error)

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
