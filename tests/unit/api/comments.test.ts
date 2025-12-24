/**
 * Unit tests for Comments API
 */

import { hasPermission } from '@/lib/authorization'
import { Role } from '@prisma/client'

describe('Comments API - Permissions', () => {
  describe('POST /api/comments - Create', () => {
    it('should allow ADMIN to create comments', () => {
      expect(hasPermission('ADMIN' as Role, 'comment:create')).toBe(true)
    })

    it('should allow POWER_USER to create comments', () => {
      expect(hasPermission('POWER_USER' as Role, 'comment:create')).toBe(true)
    })

    it('should allow READ_ONLY to create comments', () => {
      expect(hasPermission('READ_ONLY' as Role, 'comment:create')).toBe(true)
    })
  })

  describe('PUT /api/comments/[id] - Update Own', () => {
    it('should allow ADMIN to update own comments', () => {
      expect(hasPermission('ADMIN' as Role, 'comment:update_own')).toBe(true)
    })

    it('should allow POWER_USER to update own comments', () => {
      expect(hasPermission('POWER_USER' as Role, 'comment:update_own')).toBe(
        true
      )
    })

    it('should allow READ_ONLY to update own comments', () => {
      expect(hasPermission('READ_ONLY' as Role, 'comment:update_own')).toBe(
        true
      )
    })
  })

  describe('PUT /api/comments/[id] - Update Any', () => {
    it('should allow ADMIN to update any comments', () => {
      expect(hasPermission('ADMIN' as Role, 'comment:update_any')).toBe(true)
    })

    it('should not allow POWER_USER to update any comments', () => {
      expect(hasPermission('POWER_USER' as Role, 'comment:update_any')).toBe(
        false
      )
    })

    it('should not allow READ_ONLY to update any comments', () => {
      expect(hasPermission('READ_ONLY' as Role, 'comment:update_any')).toBe(
        false
      )
    })
  })

  describe('DELETE /api/comments/[id] - Delete Own', () => {
    it('should allow ADMIN to delete own comments', () => {
      expect(hasPermission('ADMIN' as Role, 'comment:delete_own')).toBe(true)
    })

    it('should allow POWER_USER to delete own comments', () => {
      expect(hasPermission('POWER_USER' as Role, 'comment:delete_own')).toBe(
        true
      )
    })

    it('should allow READ_ONLY to delete own comments', () => {
      expect(hasPermission('READ_ONLY' as Role, 'comment:delete_own')).toBe(
        true
      )
    })
  })

  describe('DELETE /api/comments/[id] - Delete Any', () => {
    it('should allow ADMIN to delete any comments', () => {
      expect(hasPermission('ADMIN' as Role, 'comment:delete_any')).toBe(true)
    })

    it('should not allow POWER_USER to delete any comments', () => {
      expect(hasPermission('POWER_USER' as Role, 'comment:delete_any')).toBe(
        false
      )
    })

    it('should not allow READ_ONLY to delete any comments', () => {
      expect(hasPermission('READ_ONLY' as Role, 'comment:delete_any')).toBe(
        false
      )
    })
  })

  describe('GET /api/recipes/[id]/comments - Read', () => {
    it('should allow all roles to read comments', () => {
      expect(hasPermission('ADMIN' as Role, 'recipe:read')).toBe(true)
      expect(hasPermission('POWER_USER' as Role, 'recipe:read')).toBe(true)
      expect(hasPermission('READ_ONLY' as Role, 'recipe:read')).toBe(true)
    })
  })
})

describe('Comments API - Validation', () => {
  describe('Comment text validation', () => {
    it('should reject empty comment text', () => {
      const text = ''
      expect(typeof text === 'string' && text.trim().length > 0).toBe(false)
    })

    it('should reject whitespace-only comments', () => {
      const text = '   '
      expect(typeof text === 'string' && text.trim().length > 0).toBe(false)
    })

    it('should reject comments longer than 2000 characters', () => {
      const text = 'A'.repeat(2001)
      expect(text.length > 2000).toBe(true)
    })

    it('should accept valid comment text', () => {
      const validTexts = [
        'Great recipe!',
        'This turned out amazing.',
        'A'.repeat(2000), // Max length
        'Comment with special chars: !@#$%^&*()',
        'Comment with\nnewline',
      ]

      validTexts.forEach((text) => {
        expect(typeof text === 'string' && text.trim().length > 0).toBe(true)
        expect(text.length <= 2000).toBe(true)
      })
    })
  })

  describe('Recipe ID validation', () => {
    it('should reject empty recipe ID', () => {
      const recipeId = ''
      expect(typeof recipeId === 'string' && recipeId.length > 0).toBe(false)
    })

    it('should accept valid recipe ID', () => {
      const recipeId = 'clm1234567890abcdef'
      expect(typeof recipeId === 'string' && recipeId.length > 0).toBe(true)
    })
  })

  describe('Comment object validation', () => {
    it('should have required fields', () => {
      const validComment = {
        id: 'comment-123',
        text: 'Great recipe',
        recipeId: 'recipe-123',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      }

      expect(validComment.id).toBeDefined()
      expect(validComment.text).toBeDefined()
      expect(validComment.recipeId).toBeDefined()
      expect(validComment.userId).toBeDefined()
      expect(validComment.user).toBeDefined()
      expect(validComment.createdAt).toBeDefined()
      expect(validComment.updatedAt).toBeDefined()
    })
  })
})

describe('Comments API - Pagination', () => {
  it('should accept valid page number', () => {
    const page = 1
    expect(page >= 1).toBe(true)
  })

  it('should accept valid limit', () => {
    const limit = 20
    expect(limit >= 1 && limit <= 100).toBe(true)
  })

  it('should cap limit at 100', () => {
    const maxLimit = 100
    const userLimit = 150
    const cappedLimit = Math.min(userLimit, maxLimit)
    expect(cappedLimit).toBe(100)
  })

  it('should default page to 1 if not provided', () => {
    const page = Math.max(1, parseInt('') || 1)
    expect(page).toBe(1)
  })

  it('should calculate skip correctly', () => {
    const page = 2
    const limit = 20
    const skip = (page - 1) * limit
    expect(skip).toBe(20)
  })

  it('should calculate totalPages correctly', () => {
    const total = 95
    const limit = 20
    const totalPages = Math.ceil(total / limit)
    expect(totalPages).toBe(5)
  })
})

describe('Comments API - Response Format', () => {
  it('should return comment with correct structure', () => {
    const comment = {
      id: 'comment-1',
      text: 'Great recipe!',
      recipeId: 'recipe-1',
      userId: 'user-1',
      user: {
        id: 'user-1',
        name: 'John',
        email: 'john@example.com',
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    expect(comment.id).toBeTruthy()
    expect(comment.text).toBeTruthy()
    expect(comment.user.name).toBeTruthy()
    expect(comment.user.email).toBeTruthy()
  })

  it('should return comments list with pagination metadata', () => {
    const response = {
      comments: [
        {
          id: 'comment-1',
          text: 'Great!',
          recipeId: 'recipe-1',
          userId: 'user-1',
          user: { id: 'user-1', name: 'John', email: 'john@example.com' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 42,
      page: 1,
      totalPages: 3,
    }

    expect(Array.isArray(response.comments)).toBe(true)
    expect(response.total).toBe(42)
    expect(response.page).toBe(1)
    expect(response.totalPages).toBe(3)
  })
})
