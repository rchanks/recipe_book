'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IngredientInput } from './IngredientInput'
import { StepInput } from './StepInput'
import type { Recipe, RecipeFormData, Ingredient, RecipeStep, Category, Tag } from '@/types'

interface RecipeFormProps {
  recipe?: Recipe
  mode: 'create' | 'edit'
}

/**
 * Form to create or edit a recipe
 */
export function RecipeForm({ recipe, mode }: RecipeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])

  // Initialize form data
  const [formData, setFormData] = useState<RecipeFormData>({
    title: recipe?.title || '',
    description: recipe?.description || '',
    ingredients: recipe?.ingredients || [
      { quantity: '', unit: '', name: '', note: '' },
    ],
    steps: recipe?.steps || [{ stepNumber: 1, instruction: '', notes: '' }],
    servings: recipe?.servings?.toString() || '',
    prepTime: recipe?.prepTime?.toString() || '',
    cookTime: recipe?.cookTime?.toString() || '',
    notes: recipe?.notes || '',
    familyStory: recipe?.familyStory || '',
    categoryIds: recipe?.categories?.map((rc) => rc.categoryId) || [],
    tagIds: recipe?.tags?.map((rt) => rt.tagId) || [],
  })

  // Fetch categories and tags on mount
  useEffect(() => {
    async function fetchCategoriesAndTags() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
        ])

        if (catRes.ok) {
          const data = await catRes.json()
          setAvailableCategories(data.categories || [])
        }

        if (tagRes.ok) {
          const data = await tagRes.json()
          setAvailableTags(data.tags || [])
        }
      } catch (err) {
        console.error('Error fetching categories and tags:', err)
      }
    }

    fetchCategoriesAndTags()
  }, [])

  // Validation function
  function validateForm(): string | null {
    if (!formData.title.trim()) {
      return 'Title is required'
    }
    if (formData.title.length > 200) {
      return 'Title must be 200 characters or less'
    }

    const validIngredients = formData.ingredients.filter(
      (i) => i.name.trim().length > 0
    )
    if (validIngredients.length === 0) {
      return 'At least one ingredient is required'
    }

    const validSteps = formData.steps.filter((s) => s.instruction.trim().length > 0)
    if (validSteps.length === 0) {
      return 'At least one step is required'
    }

    return null
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare request body
      const requestBody = {
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : null,
        ingredients: formData.ingredients.filter((i) => i.name.trim().length > 0),
        steps: formData.steps
          .filter((s) => s.instruction.trim().length > 0)
          .map((s, idx) => ({
            ...s,
            stepNumber: idx + 1,
            instruction: s.instruction.trim(),
            notes: s.notes ? s.notes.trim() : null,
          })),
        servings: formData.servings ? parseInt(formData.servings) : null,
        prepTime: formData.prepTime ? parseInt(formData.prepTime) : null,
        cookTime: formData.cookTime ? parseInt(formData.cookTime) : null,
        notes: formData.notes ? formData.notes.trim() : null,
        familyStory: formData.familyStory ? formData.familyStory.trim() : null,
        categoryIds: formData.categoryIds,
        tagIds: formData.tagIds,
      }

      // Make API request
      const url =
        mode === 'create' ? '/api/recipes' : `/api/recipes/${recipe?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${mode} recipe`)
      }

      const createdRecipe = await response.json()

      // Redirect to recipe detail page
      router.push(`/recipes/${createdRecipe.id}`)
      router.refresh()
    } catch (err) {
      console.error(`Recipe ${mode} error:`, err)
      setError(
        err instanceof Error ? err.message : `Failed to ${mode} recipe`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Recipe Title *
        </label>
        <input
          type="text"
          id="title"
          maxLength={200}
          required
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          placeholder="e.g., Grandma's Chocolate Chip Cookies"
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formData.title.length}/200 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={2}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="A short description of the recipe..."
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Categories */}
      {availableCategories.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Categories (Optional)
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <label
                key={category.id}
                className={`cursor-pointer rounded-lg border-2 px-3 py-2 transition ${
                  formData.categoryIds.includes(category.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200'
                    : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.categoryIds.includes(category.id)}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      categoryIds: e.target.checked
                        ? [...formData.categoryIds, category.id]
                        : formData.categoryIds.filter((id) => id !== category.id),
                    })
                  }}
                  className="mr-2"
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Tags (Optional)
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <label
                key={tag.id}
                className={`cursor-pointer rounded-full border-2 px-3 py-1 text-sm transition ${
                  formData.tagIds.includes(tag.id)
                    ? 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-200'
                    : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.tagIds.includes(tag.id)}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      tagIds: e.target.checked
                        ? [...formData.tagIds, tag.id]
                        : formData.tagIds.filter((id) => id !== tag.id),
                    })
                  }}
                  className="mr-2"
                />
                #{tag.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Ingredients *
        </label>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Add at least one ingredient. Quantity and Unit are optional, but ingredient name is required.
        </p>
        <div className="mt-3">
          <IngredientInput
            ingredients={formData.ingredients}
            onChange={(ingredients) =>
              setFormData({ ...formData, ingredients })
            }
          />
        </div>
      </div>

      {/* Steps */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Steps *
        </label>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Add at least one step with instructions.
        </p>
        <div className="mt-3">
          <StepInput
            steps={formData.steps}
            onChange={(steps) => setFormData({ ...formData, steps })}
          />
        </div>
      </div>

      {/* Metadata */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="servings" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Servings (Optional)
          </label>
          <input
            type="number"
            id="servings"
            min="1"
            value={formData.servings}
            onChange={(e) =>
              setFormData({ ...formData, servings: e.target.value })
            }
            placeholder="e.g., 4"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="prepTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Prep Time (minutes)
          </label>
          <input
            type="number"
            id="prepTime"
            min="0"
            value={formData.prepTime}
            onChange={(e) =>
              setFormData({ ...formData, prepTime: e.target.value })
            }
            placeholder="e.g., 15"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="cookTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Cook Time (minutes)
          </label>
          <input
            type="number"
            id="cookTime"
            min="0"
            value={formData.cookTime}
            onChange={(e) =>
              setFormData({ ...formData, cookTime: e.target.value })
            }
            placeholder="e.g., 30"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Notes & Tips (Optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          placeholder="Any tips, substitutions, or variations..."
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Family Story */}
      <div>
        <label htmlFor="familyStory" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Family Story (Optional)
        </label>
        <textarea
          id="familyStory"
          rows={3}
          value={formData.familyStory}
          onChange={(e) =>
            setFormData({ ...formData, familyStory: e.target.value })
          }
          placeholder="The story behind this recipe..."
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Form actions */}
      <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {isSubmitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
              ? 'Create Recipe'
              : 'Save Changes'}
        </button>
        <Link
          href="/recipes"
          className="rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
