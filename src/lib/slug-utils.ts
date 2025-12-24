import { prisma } from './prisma'

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Generate unique slug within group
 * Appends numbers if slug already exists
 */
export async function generateUniqueSlug(
  name: string,
  groupId: string,
  model: 'category' | 'tag',
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1

  while (true) {
    let existing: any = null

    if (model === 'category') {
      existing = await prisma.category.findUnique({
        where: { slug_groupId: { slug, groupId } },
      })
    } else {
      existing = await prisma.tag.findUnique({
        where: { slug_groupId: { slug, groupId } },
      })
    }

    if (!existing || existing.id === excludeId) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}
