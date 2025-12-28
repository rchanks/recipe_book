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
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [metadataError, setMetadataError] = useState<string | null>(null)

  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    recipe?.photoUrl || null
  )
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

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
    photoUrl: recipe?.photoUrl || undefined,
  })

  // Fetch categories and tags on mount
  useEffect(() => {
    async function fetchCategoriesAndTags() {
      try {
        setIsLoadingMetadata(true)
        setMetadataError(null)

        const [catRes, tagRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
        ])

        if (!catRes.ok || !tagRes.ok) {
          setMetadataError('Failed to load categories and tags')
        }

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
        setMetadataError('Could not connect to server while loading categories and tags')
      } finally {
        setIsLoadingMetadata(false)
      }
    }

    fetchCategoriesAndTags()
  }, [])

  // Handle file selection for photos
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only jpg, png, and webp are allowed.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setError('')
    setPhotoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Remove photo
  function handleRemovePhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    setFormData((prev) => ({ ...prev, photoUrl: null }))
  }

  // Upload photo before submitting recipe
  async function uploadPhoto(): Promise<string | null> {
    if (!photoFile) return formData.photoUrl || null

    setUploadingPhoto(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('photo', photoFile)

      const res = await fetch('/api/recipes/photos', {
        method: 'POST',
        body: formDataObj,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to upload photo')
      }

      const { photoUrl } = await res.json()
      return photoUrl
    } catch (error) {
      console.error('Photo upload error:', error)
      throw error
    } finally {
      setUploadingPhoto(false)
    }
  }

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

      // Upload photo if selected
      let photoUrl: string | null = null
      try {
        photoUrl = await uploadPhoto()
      } catch (photoErr) {
        console.error('Photo upload failed:', photoErr)
        setError(
          photoErr instanceof Error ? photoErr.message : 'Failed to upload photo'
        )
        return
      }

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
        photoUrl,
        categoryIds: formData.categoryIds,
        tagIds: formData.tagIds,
        // Phase 10: Set status to PUBLISHED when publishing a draft
        ...(mode === 'edit' && recipe?.status === 'DRAFT' && { status: 'PUBLISHED' }),
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

  // Phase 10: Handle saving as draft (for draft recipes)
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsSubmitting(true)

      // Upload photo if selected
      let photoUrl: string | null = null
      try {
        photoUrl = await uploadPhoto()
      } catch (photoErr) {
        console.error('Photo upload failed:', photoErr)
        setError(
          photoErr instanceof Error ? photoErr.message : 'Failed to upload photo'
        )
        return
      }

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
        photoUrl,
        categoryIds: formData.categoryIds,
        tagIds: formData.tagIds,
        status: 'DRAFT', // Keep as draft
      }

      const response = await fetch(`/api/recipes/${recipe?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save draft')
      }

      // Redirect to recipes page
      router.push('/recipes')
      router.refresh()
    } catch (err) {
      console.error('Draft save error:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to save draft'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = async () => {
    if (!recipe?.id) return

    const confirmed = window.confirm(
      'Are you sure you want to discard this draft? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to discard draft')
      }

      // Redirect to recipes page
      router.push('/recipes')
      router.refresh()
    } catch (err) {
      console.error('Discard draft error:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to discard draft'
      )
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

      {/* Phase 10: Draft indicator */}
      {mode === 'edit' && recipe?.status === 'DRAFT' && (
        <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-900/20">
          <div className="flex items-start">
            <svg className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                Draft Recipe
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Review and edit the information below, then publish when ready.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Phase 10: Source URL display for imported recipes */}
      {mode === 'edit' && recipe?.sourceUrl && (
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Imported from:
          </p>
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block truncate text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {recipe.sourceUrl}
          </a>
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

      {/* Recipe Photo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Recipe Photo (Optional)
        </label>

        {photoPreview ? (
          <div className="mt-2">
            <img
              src={photoPreview}
              alt="Recipe preview"
              className="h-48 w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={uploadingPhoto || isSubmitting}
              className="mt-2 text-sm text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove Photo
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                JPG, PNG, or WebP (max 5MB)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                disabled={uploadingPhoto || isSubmitting}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Loading state for categories and tags */}
      {isLoadingMetadata && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading categories and tags...
        </div>
      )}

      {/* Error state for metadata fetch */}
      {metadataError && (
        <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          {metadataError}
        </div>
      )}

      {/* Empty state if no categories or tags exist */}
      {!isLoadingMetadata && availableCategories.length === 0 && availableTags.length === 0 && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          <p>No categories or tags have been created yet. Contact a group admin to create categories and tags.</p>
        </div>
      )}

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
      <div className="space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        {/* Phase 10: Different buttons for draft recipes */}
        {mode === 'edit' && recipe?.status === 'DRAFT' ? (
          <>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Recipe'}
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Save as Draft
              </button>
            </div>
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-red-300 px-4 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              {isSubmitting ? 'Discarding...' : 'Discard Draft'}
            </button>
          </>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isSubmitting
              ? mode === 'create'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'create'
                ? 'Create Recipe'
                : 'Save Changes'}
          </button>
        )}
        <Link
          href="/recipes"
          className="block rounded-lg border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
