import { Role } from '@prisma/client'

export const PERMISSIONS = {
  // Recipe permissions
  'recipe:create': ['ADMIN', 'POWER_USER'],
  'recipe:read': ['ADMIN', 'POWER_USER', 'READ_ONLY'],
  'recipe:update': ['ADMIN', 'POWER_USER'],
  'recipe:delete': ['ADMIN'],

  // Category/Tag permissions
  'category:create': ['ADMIN', 'POWER_USER'],
  'category:update': ['ADMIN', 'POWER_USER'],
  'category:delete': ['ADMIN'],

  'tag:create': ['ADMIN', 'POWER_USER'],
  'tag:update': ['ADMIN', 'POWER_USER'],
  'tag:delete': ['ADMIN'],

  // User/Group management
  'group:update': ['ADMIN'],
  'group:invite': ['ADMIN'],
  'group:remove_member': ['ADMIN'],
  'group:change_role': ['ADMIN'],

  // Comment permissions
  'comment:create': ['ADMIN', 'POWER_USER', 'READ_ONLY'],
  'comment:update_own': ['ADMIN', 'POWER_USER', 'READ_ONLY'],
  'comment:update_any': ['ADMIN'],
  'comment:delete_own': ['ADMIN', 'POWER_USER', 'READ_ONLY'],
  'comment:delete_any': ['ADMIN'],

  // Favorite permissions
  'favorite:create': ['ADMIN', 'POWER_USER', 'READ_ONLY'],
  'favorite:delete': ['ADMIN', 'POWER_USER', 'READ_ONLY'],
} as const

export type Permission = keyof typeof PERMISSIONS
export type RoleType = Role
