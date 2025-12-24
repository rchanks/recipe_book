import { generateSlug } from '@/lib/slug-utils'

describe('Slug Utilities', () => {
  describe('generateSlug', () => {
    it('should convert to lowercase', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('Multiple Word Slug')).toBe('multiple-word-slug')
    })

    it('should remove special characters', () => {
      expect(generateSlug('Hello! @World #123')).toBe('hello-world-123')
    })

    it('should remove leading/trailing spaces', () => {
      expect(generateSlug('  spaced   ')).toBe('spaced')
    })

    it('should collapse multiple hyphens', () => {
      expect(generateSlug('hello---world')).toBe('hello-world')
    })

    it('should handle already-slugged text', () => {
      expect(generateSlug('already-slugged')).toBe('already-slugged')
    })

    it('should handle single words', () => {
      expect(generateSlug('Breakfast')).toBe('breakfast')
    })

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('')
    })

    it('should handle numbers', () => {
      expect(generateSlug('Category 123')).toBe('category-123')
    })

    it('should handle apostrophes', () => {
      expect(generateSlug("Don't Cook")).toBe('dont-cook')
    })
  })
})
