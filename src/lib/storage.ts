/**
 * Storage abstraction for file uploads
 * Supports local filesystem and future cloud providers
 */

import { promises as fs } from 'fs'
import { join } from 'path'

export interface StorageProvider {
  save(file: File, filename: string): Promise<string>
  delete(url: string): Promise<void>
  getPublicUrl(filename: string): string
}

class LocalStorageProvider implements StorageProvider {
  private baseDir = join(process.cwd(), 'public/uploads/recipes')
  private publicPath = '/uploads/recipes'

  async save(file: File, filename: string): Promise<string> {
    try {
      // Ensure directory exists
      await fs.mkdir(this.baseDir, { recursive: true })

      // Convert File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer())

      // Write file to disk
      const filepath = join(this.baseDir, filename)
      await fs.writeFile(filepath, buffer)

      // Return public URL
      return this.getPublicUrl(filename)
    } catch (error) {
      console.error('Failed to save file:', error)
      throw new Error('Failed to save uploaded file')
    }
  }

  async delete(url: string): Promise<void> {
    try {
      // Extract filename from URL (e.g., '/uploads/recipes/filename.jpg' -> 'filename.jpg')
      const filename = url.split('/').pop()

      if (!filename) {
        throw new Error('Invalid URL format')
      }

      const filepath = join(this.baseDir, filename)

      // Delete the file
      await fs.unlink(filepath)
    } catch (error) {
      console.error('Failed to delete file:', error)
      // Don't throw - allow recipe deletion even if photo deletion fails
    }
  }

  getPublicUrl(filename: string): string {
    return `${this.publicPath}/${filename}`
  }
}

// Export singleton instance
export const storage: StorageProvider = new LocalStorageProvider()

// Helper: Generate unique filename
export function generateUniqueFilename(originalName: string): string {
  const ext = originalName.split('.').pop()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}.${ext}`
}
