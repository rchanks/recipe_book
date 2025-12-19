import {
  generateGroupSlug,
  generateDefaultGroupName,
  isValidGroupSlug,
} from '@/lib/group-utils'

describe('Group Utils', () => {
  describe('generateGroupSlug', () => {
    it('should generate a valid slug starting with "group-"', () => {
      const slug = generateGroupSlug('user-123')
      expect(slug).toMatch(/^group-[a-z0-9]{8}$/)
    })

    it('should generate unique slugs for same user', () => {
      const slug1 = generateGroupSlug('user-123')
      const slug2 = generateGroupSlug('user-123')
      expect(slug1).not.toBe(slug2)
    })

    it('should only contain lowercase letters and numbers', () => {
      const slug = generateGroupSlug('user-abc')
      expect(/^[a-z0-9-]+$/.test(slug)).toBe(true)
    })
  })

  describe('generateDefaultGroupName', () => {
    it('should use user name if provided', () => {
      const name = generateDefaultGroupName('John Doe', 'john@example.com')
      expect(name).toBe("John Doe's Recipe Group")
    })

    it('should use email prefix if name is null', () => {
      const name = generateDefaultGroupName(null, 'john@example.com')
      expect(name).toBe("john's Recipe Group")
    })

    it('should use email prefix if name is empty string', () => {
      const name = generateDefaultGroupName('', 'john@example.com')
      expect(name).toBe("john's Recipe Group")
    })

    it('should handle complex email addresses', () => {
      const name = generateDefaultGroupName(null, 'john.doe+test@example.com')
      expect(name).toBe("john.doe+test's Recipe Group")
    })
  })

  describe('isValidGroupSlug', () => {
    it('should accept valid slugs', () => {
      expect(isValidGroupSlug('group-abc123')).toBe(true)
      expect(isValidGroupSlug('my-group')).toBe(true)
      expect(isValidGroupSlug('a1b2c3d4e5')).toBe(true)
    })

    it('should reject slugs with uppercase letters', () => {
      expect(isValidGroupSlug('Group-ABC')).toBe(false)
      expect(isValidGroupSlug('MY-GROUP')).toBe(false)
    })

    it('should reject slugs with special characters', () => {
      expect(isValidGroupSlug('group@test')).toBe(false)
      expect(isValidGroupSlug('group_test')).toBe(false)
      expect(isValidGroupSlug('group test')).toBe(false)
    })

    it('should reject slugs shorter than 3 characters', () => {
      expect(isValidGroupSlug('ab')).toBe(false)
      expect(isValidGroupSlug('a')).toBe(false)
    })

    it('should reject slugs longer than 50 characters', () => {
      const longSlug = 'a'.repeat(51)
      expect(isValidGroupSlug(longSlug)).toBe(false)
    })

    it('should accept slugs exactly 3 and 50 characters', () => {
      expect(isValidGroupSlug('abc')).toBe(true)
      expect(isValidGroupSlug('a'.repeat(50))).toBe(true)
    })
  })
})
