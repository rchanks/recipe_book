'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { RecipeMetadata } from './RecipeMetadata'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import type { Recipe } from '@/types'

interface RecipeDetailProps {
  recipe: Recipe
  canEdit?: boolean
  canDelete?: boolean
  isFavorited?: boolean
  onToggleFavorite?: () => void
}

/**
 * Display full recipe details in a cooking-friendly format
 */
export function RecipeDetail({
  recipe,
  canEdit = false,
  canDelete = false,
  isFavorited = false,
  onToggleFavorite,
}: RecipeDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [checkedIngredients, setCheckedIngredients] = React.useState<
    Set<number>
  >(new Set())
  const [highlightedStep, setHighlightedStep] = React.useState<number | null>(
    null
  )
  const [stickyPanelCollapsed, setStickyPanelCollapsed] =
    React.useState<boolean>(false)

  // Integrate keyboard navigation for steps
  useKeyboardNavigation(recipe.steps.length, highlightedStep, setHighlightedStep)

  /**
   * Toggle ingredient checked state and announce to screen readers
   */
  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients)
    const ingredient = recipe.ingredients[index]

    if (newChecked.has(index)) {
      newChecked.delete(index)
      announceToScreenReader(
        `Unchecked: ${ingredient.quantity} ${ingredient.unit || ''} ${ingredient.name}`.trim()
      )
    } else {
      newChecked.add(index)
      announceToScreenReader(
        `Checked: ${ingredient.quantity} ${ingredient.unit || ''} ${ingredient.name}`.trim()
      )
    }

    setCheckedIngredients(newChecked)
  }

  /**
   * Announce message to screen readers via live region
   */
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', 'polite')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  const handleEdit = () => {
    router.push(`/recipes/${recipe.id}/edit`)
  }

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this recipe? This cannot be undone.'
      )
    ) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete recipe')
      }

      router.push('/recipes')
    } catch (err) {
      console.error('Error deleting recipe:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete recipe')
      setIsDeleting(false)
    }
  }

  const totalTime =
    (recipe.prepTime || 0) + (recipe.cookTime || 0)

  return (
    <div className="space-y-8">
      {/* Header with title and actions */}
      <div className="border-b border-gray-200 pb-6 dark:border-gray-700">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {recipe.description}
              </p>
            )}
          </div>
        </div>

        {/* Photo Section */}
        {recipe.photoUrl && (
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg md:h-96">
            <Image
              src={recipe.photoUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Metadata */}
        <div className="mb-4">
          <RecipeMetadata
            servings={recipe.servings}
            prepTime={recipe.prepTime}
            cookTime={recipe.cookTime}
          />
        </div>

        {/* Categories and Tags */}
        {(recipe.categories.length > 0 || recipe.tags.length > 0) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {recipe.categories.map(({ category }) => (
              <span
                key={category.id}
                className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
              >
                {category.name}
              </span>
            ))}
            {recipe.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Creator and date */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>
            Added by{' '}
            <strong>
              {recipe.creator.name || recipe.creator.email}
            </strong>{' '}
            on{' '}
            <strong>
              {new Date(recipe.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </strong>
          </p>
        </div>

        {/* Action buttons */}
        {(canEdit || canDelete || onToggleFavorite) && (
          <div className="mt-4 flex gap-2">
            {canEdit && (
              <button
                onClick={handleEdit}
                className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Edit Recipe
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
              >
                {isDeleting ? 'Deleting...' : 'Delete Recipe'}
              </button>
            )}
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className={`rounded px-4 py-2 font-medium transition ${
                  isFavorited
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {isFavorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ingredients section */}
      <section
        className={`space-y-4 ${
          !stickyPanelCollapsed
            ? 'sticky top-0 z-10 bg-white dark:bg-gray-950 pb-4 pt-2 border-b-2 border-gray-200 dark:border-gray-800 lg:static lg:border-b-0'
            : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ingredients
          </h2>
          {/* Toggle button for mobile - only show on small screens */}
          <button
            onClick={() => setStickyPanelCollapsed(!stickyPanelCollapsed)}
            className="lg:hidden rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
            aria-label={
              stickyPanelCollapsed ? 'Show ingredients panel' : 'Hide ingredients panel'
            }
            aria-expanded={!stickyPanelCollapsed}
          >
            {stickyPanelCollapsed ? '▼ Show' : '▲ Hide'}
          </button>
        </div>

        {/* Collapsible content with scrolling on mobile */}
        {!stickyPanelCollapsed && (
          <div className="space-y-2 max-h-48 overflow-y-auto lg:max-h-none lg:overflow-y-visible">
            {recipe.ingredients.map((ingredient, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
            >
              <input
                type="checkbox"
                checked={checkedIngredients.has(idx)}
                onChange={() => toggleIngredient(idx)}
                className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-offset-gray-950"
                aria-label={`${ingredient.quantity} ${ingredient.unit || ''} ${ingredient.name}`.trim()}
                aria-checked={checkedIngredients.has(idx)}
              />
              <div
                className={`flex-1 min-w-0 transition-opacity ${
                  checkedIngredients.has(idx)
                    ? 'opacity-50 line-through decoration-gray-400 dark:decoration-gray-600'
                    : ''
                }`}
              >
                <p className="text-base text-gray-900 dark:text-white">
                  <span className="font-semibold">
                    {ingredient.quantity}
                  </span>
                  {ingredient.unit && (
                    <span className="ml-1 font-semibold">
                      {ingredient.unit}
                    </span>
                  )}
                  <span className="ml-2">{ingredient.name}</span>
                </p>
                {ingredient.note && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {ingredient.note}
                  </p>
                )}
              </div>
            </div>
            ))}
          </div>
        )}
      </section>

      {/* Instructions section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Instructions
        </h2>
        <div className="space-y-4">
          {recipe.steps.map((step, idx) => (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() =>
                setHighlightedStep(
                  step.stepNumber === highlightedStep ? null : step.stepNumber
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setHighlightedStep(
                    step.stepNumber === highlightedStep
                      ? null
                      : step.stepNumber
                  )
                }
              }}
              className={`flex gap-4 rounded-lg p-4 cursor-pointer transition-all ${
                step.stepNumber === highlightedStep
                  ? 'bg-blue-100 border-2 border-blue-500 shadow-lg dark:bg-blue-900/50 dark:border-blue-400'
                  : 'bg-blue-50 border-2 border-transparent hover:border-blue-200 dark:bg-blue-900 dark:hover:border-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950`}
              aria-label={`Step ${step.stepNumber}${
                step.stepNumber === highlightedStep ? ', currently highlighted' : ''
              }`}
              aria-pressed={step.stepNumber === highlightedStep}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white dark:bg-blue-700">
                <span className="font-bold text-sm">{step.stepNumber}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="recipe-instruction text-base text-gray-900 dark:text-white">
                  {step.instruction}
                </p>
                {step.notes && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    💡 {step.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Total time info */}
      {totalTime > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Total time: {totalTime} minutes
          </p>
        </div>
      )}

      {/* Notes section */}
      {recipe.notes && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notes & Tips
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {recipe.notes}
            </p>
          </div>
        </section>
      )}

      {/* Family story section */}
      {recipe.familyStory && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Family Story
          </h2>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900">
            <p className="whitespace-pre-wrap text-purple-900 dark:text-purple-100">
              {recipe.familyStory}
            </p>
          </div>
        </section>
      )}

      {/* Back to list */}
      <div className="pt-4">
        <Link
          href="/recipes"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to recipes
        </Link>
      </div>
    </div>
  )
}
