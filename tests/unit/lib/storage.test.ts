/**
 * Unit tests for storage abstraction layer
 */

import { generateUniqueFilename } from '@/lib/storage'

describe('Storage Layer - Filename Generation', () => {
  describe('generateUniqueFilename', () => {
    it('should generate a filename with timestamp and random suffix', () => {
      const filename = generateUniqueFilename('recipe-photo.jpg')
      expect(filename).toMatch(/^\d+-[a-z0-9]{6}\.jpg$/)
    })

    it('should extract the correct file extension', () => {
      const jpgFilename = generateUniqueFilename('photo.jpg')
      expect(jpgFilename).toMatch(/\.jpg$/)

      const pngFilename = generateUniqueFilename('image.png')
      expect(pngFilename).toMatch(/\.png$/)

      const webpFilename = generateUniqueFilename('picture.webp')
      expect(webpFilename).toMatch(/\.webp$/)
    })

    it('should generate unique filenames for the same input', () => {
      const filename1 = generateUniqueFilename('photo.jpg')
      const filename2 = generateUniqueFilename('photo.jpg')

      expect(filename1).not.toBe(filename2)
    })

    it('should handle filenames with multiple dots', () => {
      const filename = generateUniqueFilename('my.recipe.photo.jpg')
      expect(filename).toMatch(/\.jpg$/)
    })

    it('should handle uppercase extensions', () => {
      const filename = generateUniqueFilename('photo.JPG')
      expect(filename).toMatch(/\.JPG$/)
    })

    it('should preserve the format: timestamp-random.extension', () => {
      const filename = generateUniqueFilename('test.png')
      const parts = filename.split('-')

      // Should have at least 2 parts (timestamp and random.ext)
      expect(parts.length).toBeGreaterThanOrEqual(2)

      // First part should be numeric (timestamp)
      expect(/^\d+$/.test(parts[0])).toBe(true)

      // Remaining parts joined should have the random and extension
      const randomAndExt = parts.slice(1).join('-')
      expect(/^[a-z0-9]{6}\.png$/.test(randomAndExt)).toBe(true)
    })
  })

  describe('Public URL generation patterns', () => {
    it('should follow /uploads/recipes/ pattern for local storage', () => {
      const filename = generateUniqueFilename('photo.jpg')
      const publicUrl = `/uploads/recipes/${filename}`

      expect(publicUrl).toMatch(/^\/uploads\/recipes\/\d+-[a-z0-9]{6}\.jpg$/)
    })

    it('should handle filename without dot extension', () => {
      const filename = generateUniqueFilename('noextension')
      // Should still generate something, even if odd
      expect(filename).toBeTruthy()
      expect(typeof filename).toBe('string')
    })
  })
})
