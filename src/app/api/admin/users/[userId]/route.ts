import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission, wouldLeaveNoAdmins } from '@/lib/authorization'
import type { GroupMember, UpdateRoleRequest } from '@/types'

/**
 * DELETE /api/admin/users/[userId]
 * Remove a member from the group
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    await requirePermission('group:remove_member')

    const { userId } = await params

    // Prevent removing self
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the group' },
        { status: 400 }
      )
    }

    // Verify target user is in the same group
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: { userId, groupId: session.user.groupId },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'User is not a member of this group' },
        { status: 404 }
      )
    }

    // Check if removing this user would leave no admins
    const wouldLeaveNoAdminsResult = await wouldLeaveNoAdmins(
      session.user.groupId,
      userId,
      'remove'
    )

    if (wouldLeaveNoAdminsResult) {
      return NextResponse.json(
        { error: 'Cannot remove the last admin from the group' },
        { status: 400 }
      )
    }

    // Delete the membership
    await prisma.groupMembership.delete({
      where: {
        userId_groupId: { userId, groupId: session.user.groupId },
      },
    })

    return NextResponse.json(
      { message: `User removed from group` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error removing user:', error)

    if (error instanceof Error) {
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
    }

    return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/users/[userId]
 * Update user's role in the group
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    await requirePermission('group:change_role')

    const { userId } = await params
    const body = await request.json()
    const { role } = body as UpdateRoleRequest

    // Validate role
    const validRoles = ['ADMIN', 'POWER_USER', 'READ_ONLY']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Verify target user is in the same group
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: { userId, groupId: session.user.groupId },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'User is not a member of this group' },
        { status: 404 }
      )
    }

    // Check if demoting from admin to non-admin would leave no admins
    if (membership.role === 'ADMIN' && role !== 'ADMIN') {
      const wouldLeaveNoAdminsResult = await wouldLeaveNoAdmins(
        session.user.groupId,
        userId,
        'demote'
      )

      if (wouldLeaveNoAdminsResult) {
        return NextResponse.json(
          { error: 'Cannot demote the last admin from the group' },
          { status: 400 }
        )
      }
    }

    // Update the role
    const updatedMembership = await prisma.groupMembership.update({
      where: {
        userId_groupId: { userId, groupId: session.user.groupId },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
    })

    const groupMember: GroupMember = {
      id: updatedMembership.id,
      userId: updatedMembership.userId,
      role: updatedMembership.role as any,
      joinedAt: updatedMembership.joinedAt,
      user: {
        id: updatedMembership.user.id,
        email: updatedMembership.user.email,
        name: updatedMembership.user.name,
        createdAt: updatedMembership.user.createdAt,
      },
    }

    return NextResponse.json(
      {
        member: groupMember,
        message: `User role updated to ${role}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating user role:', error)

    if (error instanceof Error) {
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
    }

    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
