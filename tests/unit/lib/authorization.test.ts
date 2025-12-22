import { Role } from '@prisma/client'

// Mock auth and prisma before importing authorization
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    groupMembership: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    recipe: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

import {
  hasPermission,
  canEditRecipe,
  canDeleteRecipe,
  requireRecipeAccess,
} from '@/lib/authorization'
import { prisma } from '@/lib/prisma'

describe('Authorization Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('canEditRecipe', () => {
    const userId = 'user-123'
    const groupId = 'group-456'

    it('should return true for ADMIN regardless of group setting', async () => {
      ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue({
        role: 'ADMIN',
        group: { allowPowerUserEdit: false },
      })

      const result = await canEditRecipe(userId, groupId)
      expect(result).toBe(true)
    })

    it('should return true for POWER_USER when allowPowerUserEdit is true', async () => {
      ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue({
        role: 'POWER_USER',
        group: { allowPowerUserEdit: true },
      })

      const result = await canEditRecipe(userId, groupId)
      expect(result).toBe(true)
    })

    it('should return false for POWER_USER when allowPowerUserEdit is false', async () => {
      ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue({
        role: 'POWER_USER',
        group: { allowPowerUserEdit: false },
      })

      const result = await canEditRecipe(userId, groupId)
      expect(result).toBe(false)
    })

    it('should return false for READ_ONLY', async () => {
      ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue({
        role: 'READ_ONLY',
        group: { allowPowerUserEdit: true },
      })

      const result = await canEditRecipe(userId, groupId)
      expect(result).toBe(false)
    })

    it('should return false if user is not a member', async () => {
      ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await canEditRecipe(userId, groupId)
      expect(result).toBe(false)
    })
  })

  describe('canDeleteRecipe', () => {
    const userId = 'user-123'
    const groupId = 'group-456'

    it('should return true only for ADMIN', async () => {
      ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue({
        role: 'ADMIN',
      })

      const result = await canDeleteRecipe(userId, groupId)
      expect(result).toBe(true)
    })

    it('should return false for POWER_USER', async () => {
      ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue({
        role: 'POWER_USER',
      })

      const result = await canDeleteRecipe(userId, groupId)
      expect(result).toBe(false)
    })

    it('should return false for READ_ONLY', async () => {
      ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue({
        role: 'READ_ONLY',
      })

      const result = await canDeleteRecipe(userId, groupId)
      expect(result).toBe(false)
    })

    it('should return false if user is not a member', async () => {
      ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await canDeleteRecipe(userId, groupId)
      expect(result).toBe(false)
    })
  })

  describe('requireRecipeAccess', () => {
    const userId = 'user-123'
    const recipeId = 'recipe-456'
    const groupId = 'group-789'

    it('should return recipe data if user has access', async () => {
      ;(prisma.recipe.findUnique as jest.Mock).mockResolvedValue({
        groupId,
      })
      ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue({
        userId,
        groupId,
        role: 'ADMIN',
      })

      const result = await requireRecipeAccess(userId, recipeId)
      expect(result).toEqual({ groupId })
    })

    it('should throw error if recipe not found', async () => {
      ;(prisma.recipe.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(requireRecipeAccess(userId, recipeId)).rejects.toThrow(
        'Recipe not found'
      )
    })

    it('should throw error if user is not in recipe group', async () => {
      ;(prisma.recipe.findUnique as jest.Mock).mockResolvedValue({
        groupId,
      })
      ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(requireRecipeAccess(userId, recipeId)).rejects.toThrow(
        'Forbidden: Not a member of this group'
      )
    })
  })

  describe('hasPermission', () => {
    it('should return true for allowed role', () => {
      const result = hasPermission('ADMIN', 'recipe:delete')
      expect(result).toBe(true)
    })

    it('should return false for disallowed role', () => {
      const result = hasPermission('READ_ONLY', 'recipe:delete')
      expect(result).toBe(false)
    })

    it('should handle multiple allowed roles', () => {
      expect(hasPermission('ADMIN', 'recipe:create')).toBe(true)
      expect(hasPermission('POWER_USER', 'recipe:create')).toBe(true)
      expect(hasPermission('READ_ONLY', 'recipe:create')).toBe(false)
    })
  })

  describe('Permission Matrix Tests', () => {
    // Test all 6 scenarios from the plan
    // Note: POWER_USER can always CREATE (hasPermission checks base role permissions)
    // The allowPowerUserEdit setting only affects EDIT (via canEditRecipe function)
    const testCases = [
      {
        role: 'ADMIN',
        allowPowerUserEdit: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
      {
        role: 'ADMIN',
        allowPowerUserEdit: false,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
      {
        role: 'POWER_USER',
        allowPowerUserEdit: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
      },
      {
        role: 'POWER_USER',
        allowPowerUserEdit: false,
        canCreate: true, // POWER_USER can create, but cannot edit when allowPowerUserEdit=false
        canEdit: false,
        canDelete: false,
      },
      {
        role: 'READ_ONLY',
        allowPowerUserEdit: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      {
        role: 'READ_ONLY',
        allowPowerUserEdit: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
    ]

    testCases.forEach(({ role, allowPowerUserEdit, canCreate, canEdit, canDelete }) => {
      describe(`${role} with allowPowerUserEdit=${allowPowerUserEdit}`, () => {
        beforeEach(() => {
          ;(prisma.groupMembership.findUnique as jest.Mock).mockResolvedValue({
            role,
            group: { allowPowerUserEdit },
          })
        })

        it(`canCreate should be ${canCreate}`, () => {
          const hasCreatePermission = hasPermission(role as Role, 'recipe:create')
          expect(hasCreatePermission).toBe(canCreate)
        })

        it(`canEdit should be ${canEdit}`, async () => {
          const result = await canEditRecipe('user-123', 'group-456')
          expect(result).toBe(canEdit)
        })

        it(`canDelete should be ${canDelete}`, async () => {
          const result = await canDeleteRecipe('user-123', 'group-456')
          expect(result).toBe(canDelete)
        })
      })
    })
  })
})
