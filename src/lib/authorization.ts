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

/**
 * Check if user can delete a recipe (only admins)
 */
export async function canDeleteRecipe(
  userId: string,
  groupId: string
): Promise<boolean> {
  const role = await getUserRole(userId, groupId)
  return role === 'ADMIN'
}

/**
 * Verify user has access to a specific recipe (same group)
 * Throws an error if not found or not authorized
 */
export async function requireRecipeAccess(
  userId: string,
  recipeId: string
) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { groupId: true },
  })

  if (!recipe) {
    throw new Error('Recipe not found')
  }

  await requireGroupMembership(userId, recipe.groupId)

  return recipe
}

/**
 * Count the number of admin users in a group
 */
export async function countAdminsInGroup(groupId: string): Promise<number> {
  return prisma.groupMembership.count({
    where: { groupId, role: 'ADMIN' },
  })
}

/**
 * Check if removing/demoting a user would leave the group with no admins
 */
export async function wouldLeaveNoAdmins(
  groupId: string,
  userId: string,
  action: 'remove' | 'demote'
): Promise<boolean> {
  const adminCount = await countAdminsInGroup(groupId)

  // Check if target user is currently an admin
  const membership = await prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId } },
  })

  if (membership?.role !== 'ADMIN') {
    return false // Not an admin, won't affect admin count
  }

  return adminCount <= 1 // Would leave 0 admins
}
