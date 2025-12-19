import { customAlphabet } from 'nanoid'

/**
 * Generate a URL-friendly group slug
 */
export function generateGroupSlug(userId: string): string {
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)
  return `group-${nanoid()}`
}

/**
 * Generate default group name from user info
 */
export function generateDefaultGroupName(
  userName: string | null,
  userEmail: string
): string {
  if (userName) {
    return `${userName}'s Recipe Group`
  }
  const emailPrefix = userEmail.split('@')[0]
  return `${emailPrefix}'s Recipe Group`
}

/**
 * Validate group slug format
 */
export function isValidGroupSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 50
}
