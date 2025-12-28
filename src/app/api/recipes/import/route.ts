import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/authorization'
import { recipeExtractor, type ExtractedRecipe } from '@/lib/ai/recipeExtractor'
import type { Ingredient, RecipeStep } from '@/types'

/**
 * Simple in-memory rate limiter for import attempts
 * In production, should use Redis for distributed systems
 */
const importAttempts = new Map<string, number[]>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxAttempts = 10 // 10 imports per hour

  const attempts = importAttempts.get(userId) || []

  // Remove attempts outside window
  const recentAttempts = attempts.filter((time) => now - time < windowMs)

  if (recentAttempts.length >= maxAttempts) {
    return false // Rate limit exceeded
  }

  // Record new attempt
  recentAttempts.push(now)
  importAttempts.set(userId, recentAttempts)

  return true
}

function validateRecipeUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url)

    // Only allow HTTP/HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' }
    }

    // Block local/private IPs (SSRF prevention)
    const hostname = parsed.hostname.toLowerCase()
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1'
    ) {
      return { valid: false, error: 'Local URLs are not allowed' }
    }

    // Block private IP ranges
    if (
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') // Simplified check for 172.16-31.x.x
    ) {
      return { valid: false, error: 'Private network URLs are not allowed' }
    }

    // URL length check
    if (url.length > 2000) {
      return { valid: false, error: 'URL is too long' }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

function sanitizeText(text: string, maxLength: number): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '')

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength).trim()
  }

  return sanitized
}

function sanitizeExtractedRecipe(recipe: ExtractedRecipe): ExtractedRecipe {
  return {
    title: sanitizeText(recipe.title, 200),
    description: recipe.description ? sanitizeText(recipe.description, 1000) : undefined,
    ingredients: recipe.ingredients.map((ing) => ({
      quantity: sanitizeText(ing.quantity || '', 50),
      unit: ing.unit ? sanitizeText(ing.unit, 50) : undefined,
      name: sanitizeText(ing.name, 200),
      note: ing.note ? sanitizeText(ing.note, 200) : undefined,
    })),
    steps: recipe.steps.map((step, idx) => ({
      stepNumber: idx + 1, // Override to ensure sequential
      instruction: sanitizeText(step.instruction, 2000),
      notes: step.notes ? sanitizeText(step.notes, 500) : undefined,
    })),
    servings: recipe.servings ? Math.max(1, Math.min(100, recipe.servings)) : undefined,
    prepTime: recipe.prepTime
      ? Math.max(0, Math.min(1440, Math.round(recipe.prepTime)))
      : undefined,
    cookTime: recipe.cookTime
      ? Math.max(0, Math.min(1440, Math.round(recipe.cookTime)))
      : undefined,
    notes: recipe.notes ? sanitizeText(recipe.notes, 2000) : undefined,
  }
}

/**
 * POST /api/recipes/import
 * Extract recipe data from URL and create a draft recipe
 */
export async function POST(request: NextRequest) {
  try {
    // Verify AI service is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[RecipeImport] ANTHROPIC_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Recipe import service is not configured. Please contact administrator.' },
        { status: 503 }
      )
    }

    // Get session and check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    await requirePermission('recipe:create')

    // Parse request body
    const body = await request.json()
    const { url } = body

    // Validate URL format
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const urlValidation = validateRecipeUrl(url)
    if (!urlValidation.valid) {
      return NextResponse.json(
        { error: urlValidation.error || 'Invalid URL' },
        { status: 400 }
      )
    }

    // Check rate limit
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 10 imports per hour.' },
        { status: 429 }
      )
    }

    // Extract recipe using AI service
    const extractionResult = await recipeExtractor.extractFromUrl(url)

    if (!extractionResult.success || !extractionResult.recipe) {
      console.error('[RecipeImport] Extraction failed:', {
        userId: session.user.id,
        url,
        error: extractionResult.error,
      })
      return NextResponse.json(
        { error: extractionResult.error || 'Failed to extract recipe from URL' },
        { status: 500 }
      )
    }

    // Sanitize extracted data
    const sanitized = sanitizeExtractedRecipe(extractionResult.recipe)

    // Validate required fields
    if (!sanitized.title || sanitized.title.length === 0) {
      return NextResponse.json(
        { error: 'Recipe title is required' },
        { status: 400 }
      )
    }

    if (
      !Array.isArray(sanitized.ingredients) ||
      sanitized.ingredients.length === 0 ||
      !sanitized.ingredients.some((ing) => ing && ing.name)
    ) {
      return NextResponse.json(
        { error: 'Recipe must have at least one ingredient' },
        { status: 400 }
      )
    }

    if (!Array.isArray(sanitized.steps) || sanitized.steps.length === 0 ||
        !sanitized.steps.some((step) => step && step.instruction)) {
      return NextResponse.json(
        { error: 'Recipe must have at least one step' },
        { status: 400 }
      )
    }

    // Create draft recipe
    const draftRecipe = await prisma.recipe.create({
      data: {
        title: sanitized.title,
        description: sanitized.description || null,
        ingredients: sanitized.ingredients as any, // JSON type
        steps: sanitized.steps as any, // JSON type
        servings: sanitized.servings || null,
        prepTime: sanitized.prepTime || null,
        cookTime: sanitized.cookTime || null,
        notes: sanitized.notes || null,
        familyStory: null,
        photoUrl: null,
        status: 'DRAFT',
        sourceUrl: url,
        createdBy: session.user.id,
        groupId: session.user.groupId,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: true,
        comments: true,
      },
    })

    console.log('[RecipeImport] Success:', {
      userId: session.user.id,
      recipeId: draftRecipe.id,
      url,
      confidence: extractionResult.confidence,
    })

    return NextResponse.json(
      {
        draft: draftRecipe,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[RecipeImport] Error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to import recipe' },
      { status: 500 }
    )
  }
}
