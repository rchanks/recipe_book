/**
 * AI-powered recipe extraction service
 * Uses Anthropic Claude API to extract structured recipe data from URLs
 */

import Anthropic from '@anthropic-ai/sdk'

export interface ExtractedRecipe {
  title: string
  description?: string
  ingredients: Array<{
    quantity: string
    unit?: string
    name: string
    note?: string
  }>
  steps: Array<{
    stepNumber: number
    instruction: string
    notes?: string
  }>
  servings?: number
  prepTime?: number
  cookTime?: number
  notes?: string
}

export interface RecipeExtractionResult {
  success: boolean
  recipe?: ExtractedRecipe
  error?: string
  confidence?: 'high' | 'medium' | 'low'
}

export class RecipeExtractorService {
  private client: Anthropic

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }

    this.client = new Anthropic({
      apiKey,
    })
  }

  async extractFromUrl(url: string): Promise<RecipeExtractionResult> {
    console.log(`[RecipeExtractor] Starting extraction for URL: ${url}`)
    try {
      // Fetch webpage content
      const htmlContent = await this.fetchWebpage(url)
      console.log(`[RecipeExtractor] Fetched ${htmlContent.length} bytes from ${url}`)

      // Extract recipe using Claude
      const extractedRecipe = await this.extractRecipeWithClaude(htmlContent)

      console.log(`[RecipeExtractor] Successfully extracted recipe: ${extractedRecipe.title}`)
      return {
        success: true,
        recipe: extractedRecipe,
        confidence: this.assessConfidence(extractedRecipe),
      }
    } catch (error) {
      const errorDetails = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join(' '),
      } : String(error)
      console.error('[RecipeExtractor] Extraction error:', errorDetails)

      // Provide more user-friendly error messages
      let errorMessage = 'Failed to extract recipe from URL'

      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('authentication')) {
          errorMessage = 'Authentication error: Invalid API key or permissions issue'
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limited: Please wait a moment and try again'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout: The website took too long to respond'
        } else if (error.message.includes('not found') || error.message.includes('404')) {
          errorMessage = 'URL not found or page does not exist'
        } else if (error.message.includes('No recipe found')) {
          errorMessage = 'No recipe data could be extracted from this URL'
        } else {
          errorMessage = error.message
        }
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  private async fetchWebpage(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        // 10 second timeout
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html')) {
        throw new Error('URL does not return HTML content')
      }

      return await response.text()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout while fetching webpage')
      }
      throw error
    }
  }

  private async extractRecipeWithClaude(htmlContent: string): Promise<ExtractedRecipe> {
    const prompt = this.buildExtractionPrompt(htmlContent)

    const message = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0, // Deterministic output
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Parse Claude's response
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    return this.parseClaudeResponse(responseText)
  }

  private buildExtractionPrompt(htmlContent: string): string {
    // Limit HTML content to avoid token limits
    const truncatedHtml = htmlContent.slice(0, 50000)

    return `You are a recipe extraction assistant. Extract structured recipe data from the provided HTML.

HTML Content:
${truncatedHtml}

Extract the following information in valid JSON format:
{
  "title": "Recipe title",
  "description": "Brief description (optional)",
  "ingredients": [
    {
      "quantity": "1",
      "unit": "cup",
      "name": "flour",
      "note": "sifted (optional)"
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Step instruction",
      "notes": "Optional notes"
    }
  ],
  "servings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "notes": "Additional recipe notes (optional)"
}

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanation, no preamble
2. Ensure all required fields are present (title, ingredients, steps)
3. ingredients must be an array with at least one item
4. steps must be an array with at least one item
5. Each ingredient must have a "name" field
6. Each step must have "stepNumber" and "instruction" fields
7. Use null for optional fields if not found
8. Do not invent or guess recipe data - extract only what's clearly present
9. If no recipe is found in the HTML, return: {"error": "No recipe found"}

Return the JSON now:`
  }

  private parseClaudeResponse(responseText: string): ExtractedRecipe {
    try {
      // Clean response (remove markdown code blocks if present)
      let cleaned = responseText.trim()
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n/, '').replace(/\n```$/, '')
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n/, '').replace(/\n```$/, '')
      }

      const parsed = JSON.parse(cleaned)

      // Check for error response
      if (parsed.error) {
        throw new Error(parsed.error)
      }

      // Validate required fields
      if (!parsed.title || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) {
        throw new Error('Invalid recipe structure from AI')
      }

      if (parsed.ingredients.length === 0 || parsed.steps.length === 0) {
        throw new Error('Recipe must have at least one ingredient and one step')
      }

      // Validate ingredients have names
      const validIngredients = parsed.ingredients.every((ing: any) => ing.name)
      if (!validIngredients) {
        throw new Error('All ingredients must have a name')
      }

      // Validate steps have instructions
      const validSteps = parsed.steps.every((step: any) => step.instruction)
      if (!validSteps) {
        throw new Error('All steps must have instructions')
      }

      return parsed as ExtractedRecipe
    } catch (error) {
      console.error('Failed to parse Claude response:', error)
      console.error('Raw response:', responseText.slice(0, 500))
      throw new Error('Failed to parse AI response')
    }
  }

  private assessConfidence(recipe: ExtractedRecipe): 'high' | 'medium' | 'low' {
    // Simple heuristic to assess extraction confidence
    let score = 0

    if (recipe.title && recipe.title.length > 5) score++
    if (recipe.description && recipe.description.length > 20) score++
    if (recipe.ingredients.length >= 3) score++
    if (recipe.steps.length >= 3) score++
    if (recipe.servings) score++
    if (recipe.prepTime || recipe.cookTime) score++

    if (score >= 5) return 'high'
    if (score >= 3) return 'medium'
    return 'low'
  }
}

// Export singleton instance
export const recipeExtractor = new RecipeExtractorService()
