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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/avif,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'max-age=0',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow',
        // 15 second timeout for slow sites
        signal: AbortSignal.timeout(15000),
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
    const truncatedHtml = htmlContent.slice(0, 80000)

    return `You are a recipe extraction assistant. Your task is to extract recipe information from HTML content and return it as JSON.

HTML Content:
${truncatedHtml}

INSTRUCTIONS:
1. Look for a recipe in the HTML content. Recipes typically have:
   - A title/name
   - A list of ingredients with quantities
   - Step-by-step cooking instructions
   - Optional: servings, prep time, cook time, description, notes

2. Extract as much recipe information as you can find. Use ANY ingredient or cooking instruction text you find - don't worry about perfect structure.

3. For cooking times: If you see "15 mins" or "15 minutes", use 15. If "1 hour 30 mins", use 90. Return as integers (minutes).

4. For quantities: Extract "1 cup", "2 tbsp", "3 cloves", etc. exactly as written.

5. Return ONLY a valid JSON object (no markdown, no code blocks, no explanation):

{
  "title": "Recipe title",
  "description": "Brief description (optional)",
  "ingredients": [
    {
      "quantity": "1",
      "unit": "cup",
      "name": "ingredient name",
      "note": "preparation notes (optional)"
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Step instruction",
      "notes": "Additional notes (optional)"
    }
  ],
  "servings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "notes": "Any additional notes (optional)"
}

RULES:
- ingredients and steps MUST have at least 1 item each
- Every ingredient MUST have a "name" field
- Every step MUST have "stepNumber" (1, 2, 3...) and "instruction" fields
- Use null for optional fields that aren't found
- Do NOT invent ingredients or steps - only extract what's clearly in the HTML
- If you find partial information, use it (e.g., ingredients list without times is fine)
- If NO recipe is found at all, return: {"error": "No recipe found"}

Return the JSON now:`
  }

  private parseClaudeResponse(responseText: string): ExtractedRecipe {
    try {
      console.log('[RecipeExtractor] Parsing response, length:', responseText.length)
      console.log('[RecipeExtractor] First 200 chars:', responseText.slice(0, 200))

      // Clean response (remove markdown code blocks if present)
      let cleaned = responseText.trim()

      // Remove markdown code blocks
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7) // Remove ```json
        cleaned = cleaned.replace(/```\s*$/, '') // Remove closing ```
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3) // Remove ```
        cleaned = cleaned.replace(/```\s*$/, '') // Remove closing ```
      }

      cleaned = cleaned.trim()
      console.log('[RecipeExtractor] Cleaned response length:', cleaned.length)
      console.log('[RecipeExtractor] Cleaned first 200 chars:', cleaned.slice(0, 200))

      let parsed
      try {
        parsed = JSON.parse(cleaned)
      } catch (parseError) {
        console.error('[RecipeExtractor] JSON parse failed:', parseError)
        console.error('[RecipeExtractor] Cleaned text:', cleaned.slice(0, 300))
        throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
      }

      // Check for error response
      if (parsed.error) {
        throw new Error(parsed.error)
      }

      // Validate required fields
      if (!parsed.title || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) {
        console.error('[RecipeExtractor] Invalid structure:', {
          hasTitle: !!parsed.title,
          hasIngredients: Array.isArray(parsed.ingredients),
          hasSteps: Array.isArray(parsed.steps)
        })
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

      console.log('[RecipeExtractor] Successfully parsed recipe:', parsed.title)
      return parsed as ExtractedRecipe
    } catch (error) {
      console.error('[RecipeExtractor] Parse error:', error instanceof Error ? error.message : String(error))
      console.error('[RecipeExtractor] Full response (first 1000 chars):', responseText.slice(0, 1000))
      throw error instanceof Error ? error : new Error('Failed to parse AI response')
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
