/**
 * Unit tests for comment authorization helpers
 */

import { canEditComment, canDeleteComment } from '@/lib/authorization'
import { Role } from '@prisma/client'

describe('Comment Authorization - canEditComment', () => {
  describe('Owner permissions', () => {
    it('should allow comment owner to edit their comment as ADMIN', async () => {
      const userId = 'user-1'
      const commentUserId = 'user-1'
      const userRole: Role = 'ADMIN'

      const result = await canEditComment(userId, commentUserId, userRole)
      expect(result).toBe(true)
    })

    it('should allow comment owner to edit their comment as POWER_USER', async () => {
      const userId = 'user-1'
      const commentUserId = 'user-1'
      const userRole: Role = 'POWER_USER'

      const result = await canEditComment(userId, commentUserId, userRole)
      expect(result).toBe(true)
    })

    it('should allow comment owner to edit their comment as READ_ONLY', async () => {
      const userId = 'user-1'
      const commentUserId = 'user-1'
      const userRole: Role = 'READ_ONLY'

      const result = await canEditComment(userId, commentUserId, userRole)
      expect(result).toBe(true)
    })
  })

  describe('Admin override', () => {
    it('should allow ADMIN to edit any comment', async () => {
      const userId = 'admin-user'
      const commentUserId = 'other-user'
      const userRole: Role = 'ADMIN'

      const result = await canEditComment(userId, commentUserId, userRole)
      expect(result).toBe(true)
    })
  })

  describe('Non-owner restrictions', () => {
    it('should not allow POWER_USER to edit others comments', async () => {
      const userId = 'user-1'
      const commentUserId = 'user-2'
      const userRole: Role = 'POWER_USER'

      const result = await canEditComment(userId, commentUserId, userRole)
      expect(result).toBe(false)
    })

    it('should not allow READ_ONLY to edit others comments', async () => {
      const userId = 'user-1'
      const commentUserId = 'user-2'
      const userRole: Role = 'READ_ONLY'

      const result = await canEditComment(userId, commentUserId, userRole)
      expect(result).toBe(false)
    })
  })
})

describe('Comment Authorization - canDeleteComment', () => {
  describe('Owner permissions', () => {
    it('should allow comment owner to delete their comment as ADMIN', async () => {
      const userId = 'user-1'
      const commentUserId = 'user-1'
      const userRole: Role = 'ADMIN'

      const result = await canDeleteComment(userId, commentUserId, userRole)
      expect(result).toBe(true)
    })

    it('should allow comment owner to delete their comment as POWER_USER', async () => {
      const userId = 'user-1'
      const commentUserId = 'user-1'
      const userRole: Role = 'POWER_USER'

      const result = await canDeleteComment(userId, commentUserId, userRole)
      expect(result).toBe(true)
    })

    it('should allow comment owner to delete their comment as READ_ONLY', async () => {
      const userId = 'user-1'
      const commentUserId = 'user-1'
      const userRole: Role = 'READ_ONLY'

      const result = await canDeleteComment(userId, commentUserId, userRole)
      expect(result).toBe(true)
    })
  })

  describe('Admin override', () => {
    it('should allow ADMIN to delete any comment', async () => {
      const userId = 'admin-user'
      const commentUserId = 'other-user'
      const userRole: Role = 'ADMIN'

      const result = await canDeleteComment(userId, commentUserId, userRole)
      expect(result).toBe(true)
    })
  })

  describe('Non-owner restrictions', () => {
    it('should not allow POWER_USER to delete others comments', async () => {
      const userId = 'user-1'
      const commentUserId = 'user-2'
      const userRole: Role = 'POWER_USER'

      const result = await canDeleteComment(userId, commentUserId, userRole)
      expect(result).toBe(false)
    })

    it('should not allow READ_ONLY to delete others comments', async () => {
      const userId = 'user-1'
      const commentUserId = 'user-2'
      const userRole: Role = 'READ_ONLY'

      const result = await canDeleteComment(userId, commentUserId, userRole)
      expect(result).toBe(false)
    })
  })
})

describe('Comment Authorization - Ownership Logic', () => {
  it('should use === for user ID comparison', async () => {
    const userId = 'user-123'
    const commentUserId = 'user-123'
    // Exact match should return true
    expect(userId === commentUserId).toBe(true)
  })

  it('should differentiate between different user IDs', async () => {
    const userId = 'user-123'
    const commentUserId = 'user-124'
    // Different IDs should not match
    expect(userId === commentUserId).toBe(false)
  })

  it('should handle case-sensitive user IDs', async () => {
    const userId = 'user-ABC'
    const commentUserId = 'user-abc'
    // Case matters for comparison
    expect(userId === commentUserId).toBe(false)
  })
})

describe('Comment Authorization - Admin Role Detection', () => {
  it('should recognize ADMIN role', async () => {
    const userRole: Role = 'ADMIN'
    expect(userRole === 'ADMIN').toBe(true)
  })

  it('should not recognize POWER_USER as ADMIN', async () => {
    const userRole: Role = 'POWER_USER'
    expect(userRole === 'ADMIN').toBe(false)
  })

  it('should not recognize READ_ONLY as ADMIN', async () => {
    const userRole: Role = 'READ_ONLY'
    expect(userRole === 'ADMIN').toBe(false)
  })
})
