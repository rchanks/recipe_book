'use client'

import React from 'react'
import Link from 'next/link'
import { RecipeMetadata } from './RecipeMetadata'
import type { Recipe } from '@/types'

interface RecipeCardProps {
  recipe: Recipe
  onEdit?: () => void
  onDelete?: () => void
  canEdit?: boolean
  canDelete?: boolean
}

/**
 * Display a single recipe as a card in a list
 */
export function RecipeCard({
  recipe,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}: RecipeCardProps) {
  const truncatedDescription =
    recipe.description && recipe.description.length > 100
      ? recipe.description.substring(0, 100) + '...'
      : recipe.description

  const createdDate = new Date(recipe.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-1 flex-col p-4">
        {/* Recipe Title and Link */}
        <div className="mb-3">
          <Link
            href={`/recipes/${recipe.id}`}
            className="inline-block text-lg font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            {recipe.title}
          </Link>
        </div>

        {/* Description */}
        {truncatedDescription && (
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            {truncatedDescription}
          </p>
        )}

        {/* Metadata */}
        <div className="mb-3">
          <RecipeMetadata
            servings={recipe.servings}
            prepTime={recipe.prepTime}
            cookTime={recipe.cookTime}
          />
        </div>

        {/* Creator and Date */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <span>
            by{' '}
            {recipe.creator.name || recipe.creator.email}
          </span>
          <span>{createdDate}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {(canEdit || canDelete) && (
        <div className="flex gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
          {canEdit && onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 rounded bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Edit
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 rounded bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
