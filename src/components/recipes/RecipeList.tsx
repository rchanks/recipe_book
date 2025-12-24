'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeCard } from './RecipeCard'
import { RecipeFilters, type FilterState } from './RecipeFilters'
import type { Recipe } from '@/types'

interface Session {
  user?: {
    id: string
    email: string
    name: string
    role: string
    groupId: string
  }
}

/**
 * Component to display a list of recipes with pagination
 */
export function RecipeList() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [allowPowerUserEdit, setAllowPowerUserEdit] = useState(true)
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryIds: [],
    tagIds: [],
    favoritesOnly: false,
  })

  const limit = 20

  // Fetch user session and group governance settings
  useEffect(() => {
    async function fetchSessionAndSettings() {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const session: Session = await response.json()
          setUserRole(session.user?.role || null)

          // If user is POWER_USER, fetch group settings to check allowPowerUserEdit
          if (session.user?.role === 'POWER_USER' && session.user?.groupId) {
            try {
              const groupResponse = await fetch(
                `/api/groups/${session.user.groupId}`
              )
              if (groupResponse.ok) {
                const groupData = await groupResponse.json()
                setAllowPowerUserEdit(groupData.allowPowerUserEdit ?? true)
              }
            } catch (err) {
              console.error('Error fetching group settings:', err)
              // Default to true if we can't fetch
              setAllowPowerUserEdit(true)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching session:', err)
      }
    }

    fetchSessionAndSettings()
  }, [])

  // Fetch user's favorites
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch('/api/favorites')
        if (res.ok) {
          const data = await res.json()
          setFavoriteRecipeIds(data.favoriteRecipeIds || [])
        }
      } catch (err) {
        console.error('Error fetching favorites:', err)
      }
    }

    fetchFavorites()
  }, [])

  // Fetch recipes with filters
  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (filters.search) queryParams.set('search', filters.search)
      if (filters.categoryIds.length > 0)
        queryParams.set('categoryIds', filters.categoryIds.join(','))
      if (filters.tagIds.length > 0)
        queryParams.set('tagIds', filters.tagIds.join(','))
      if (filters.favoritesOnly) queryParams.set('favoritesOnly', 'true')

      const response = await fetch(`/api/recipes?${queryParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }

      const data = await response.json()
      setRecipes(data.recipes)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error('Error fetching recipes:', err)
      setError(err instanceof Error ? err.message : 'Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  // Re-fetch recipes when page or filters change
  useEffect(() => {
    fetchRecipes()
  }, [page, filters, fetchRecipes])

  // Handle recipe edit
  const handleEdit = (id: string) => {
    router.push(`/recipes/${id}/edit`)
  }

  // Handle recipe delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return
    }

    try {
      setDeleting(id)
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete recipe')
      }

      // Remove from list
      setRecipes(recipes.filter((r) => r.id !== id))
      setTotal(total - 1)
    } catch (err) {
      console.error('Error deleting recipe:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete recipe')
    } finally {
      setDeleting(null)
    }
  }

  // Handle view recipe
  const handleView = (id: string) => {
    router.push(`/recipes/${id}`)
  }

  // Handle toggle favorite
  const handleToggleFavorite = async (recipeId: string) => {
    const isFavorited = favoriteRecipeIds.includes(recipeId)

    try {
      const res = await fetch('/api/favorites', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      })

      if (res.ok) {
        setFavoriteRecipeIds((prev) =>
          isFavorited
            ? prev.filter((id) => id !== recipeId)
            : [...prev, recipeId]
        )
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-200">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    )
  }

  // Determine permissions based on role and governance settings
  const canEdit =
    userRole === 'ADMIN' ||
    (userRole === 'POWER_USER' && allowPowerUserEdit)
  const canDelete = userRole === 'ADMIN'

  // Show empty state only if no filters are active
  if (recipes.length === 0 && !Object.values(filters).some((v) => v)) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          No recipes yet. Create one to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <RecipeFilters
        onFilterChange={(newFilters) => {
          setFilters(newFilters)
          setPage(1)
        }}
      />

      {/* No results message */}
      {recipes.length === 0 && Object.values(filters).some((v) => v) && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            No recipes match your filters. Try adjusting your search or selections.
          </p>
        </div>
      )}

      {/* Recipe Cards */}
      {recipes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={() => handleEdit(recipe.id)}
              onDelete={() => handleDelete(recipe.id)}
              onToggleFavorite={() => handleToggleFavorite(recipe.id)}
              isFavorited={favoriteRecipeIds.includes(recipe.id)}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages} ({total} total recipes)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded bg-gray-200 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded bg-gray-200 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {deleting && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Deleting recipe...
        </div>
      )}
    </div>
  )
}
