'use client'

import { useState } from 'react'
import { RecipeDetail } from './RecipeDetail'
import type { Recipe } from '@/types'

interface RecipeDetailWrapperProps {
  recipe: Recipe
  canEdit?: boolean
  canDelete?: boolean
  initialIsFavorited?: boolean
}

/**
 * Client-side wrapper for RecipeDetail that handles favorite toggle
 */
export function RecipeDetailWrapper({
  recipe,
  canEdit = false,
  canDelete = false,
  initialIsFavorited = false,
}: RecipeDetailWrapperProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleFavorite = async () => {
    try {
      setIsToggling(true)
      const res = await fetch('/api/favorites', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: recipe.id }),
      })

      if (res.ok) {
        setIsFavorited(!isFavorited)
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <RecipeDetail
      recipe={recipe}
      canEdit={canEdit}
      canDelete={canDelete}
      isFavorited={isFavorited}
      onToggleFavorite={isToggling ? undefined : handleToggleFavorite}
    />
  )
}
