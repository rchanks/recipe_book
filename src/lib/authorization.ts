import { Role } from '@prisma/client'
import { PERMISSIONS, Permission } from './permissions'
import { auth } from './auth'
import { prisma } from './prisma'

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission]
  return allowedRoles.includes(role as any)
}

/**
 * Check if current user has permission (server-side)
 * Throws an error if unauthorized
 */
export async function requirePermission(permission: Permission) {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Unauthorized: No session')
  }

  if (!hasPermission(session.user.role, permission)) {
    throw new Error(`Forbidden: Missing permission '${permission}'`)
  }

  return session
}

/**
 * Check if user can edit recipes (considers group settings)
 */
export async function canEditRecipe(
  userId: string,
  groupId: string
): Promise<boolean> {
  const membership = await prisma.groupMembership.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
    include: { group: true },
  })

  if (!membership) return false

  // Admins can always edit
  if (membership.role === 'ADMIN') return true

  // Power users can edit if group setting allows
  if (membership.role === 'POWER_USER') {
    return membership.group.allowPowerUserEdit
  }

  return false
}

/**
 * Verify user belongs to a specific group
 * Throws an error if not a member
 */
export async function requireGroupMembership(
  userId: string,
  groupId: string
) {
  const membership = await prisma.groupMembership.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
  })

  if (!membership) {
    throw new Error('Forbidden: Not a member of this group')
  }

  return membership
}

/**
 * Get user's role in a group
 */
export async function getUserRole(
  userId: string,
  groupId: string
): Promise<Role | null> {
  const membership = await prisma.groupMembership.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
    select: { role: true },
  })

  return membership?.role ?? null
}

/**
 * Get user's primary group (first group they joined)
 */
export async function getUserPrimaryGroup(userId: string) {
  const membership = await prisma.groupMembership.findFirst({
    where: { userId },
    include: { group: true },
    orderBy: { joinedAt: 'asc' },
  })

  return membership
}
