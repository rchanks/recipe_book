'use client'

import React from 'react'

interface RecipeMetadataProps {
  servings?: number | null
  prepTime?: number | null
  cookTime?: number | null
}

/**
 * Display recipe metadata (servings, prep time, cook time)
 */
export function RecipeMetadata({
  servings,
  prepTime,
  cookTime,
}: RecipeMetadataProps) {
  if (!servings && !prepTime && !cookTime) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
      {servings && (
        <div className="flex items-center gap-2">
          <span className="font-semibold" aria-hidden="true">
            👥
          </span>
          <span className="sr-only">Servings:</span>
          <span>{servings} serving{servings !== 1 ? 's' : ''}</span>
        </div>
      )}
      {prepTime && (
        <div className="flex items-center gap-2">
          <span className="font-semibold" aria-hidden="true">
            ⏱️
          </span>
          <span className="sr-only">Prep time:</span>
          <span>Prep: {prepTime} min</span>
        </div>
      )}
      {cookTime && (
        <div className="flex items-center gap-2">
          <span className="font-semibold" aria-hidden="true">
            🔥
          </span>
          <span className="sr-only">Cook time:</span>
          <span>Cook: {cookTime} min</span>
        </div>
      )}
    </div>
  )
}
