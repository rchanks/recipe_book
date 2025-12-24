'use client'

import { useState, useEffect } from 'react'
import type { Category, Tag } from '@/types'

export interface FilterState {
  search: string
  categoryIds: string[]
  tagIds: string[]
  favoritesOnly: boolean
}

interface RecipeFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

/**
 * Search and filter component for recipes
 */
export function RecipeFilters({ onFilterChange }: RecipeFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryIds: [],
    tagIds: [],
    favoritesOnly: false,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  // Fetch available categories and tags
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
        ])

        if (catRes.ok) {
          const data = await catRes.json()
          setCategories(data.categories || [])
        }

        if (tagRes.ok) {
          const data = await tagRes.json()
          setTags(data.tags || [])
        }
      } catch (err) {
        console.error('Error fetching filter options:', err)
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  // Check if any filters are active
  const hasActiveFilters =
    filters.search ||
    filters.categoryIds.length > 0 ||
    filters.tagIds.length > 0 ||
    filters.favoritesOnly

  // Handle clearing all filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      categoryIds: [],
      tagIds: [],
      favoritesOnly: false,
    })
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search recipes by title or description..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Categories
          </label>
          <select
            multiple
            value={filters.categoryIds}
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              )
              setFilters({ ...filters, categoryIds: selected })
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            size={Math.min(5, categories.length)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {filters.categoryIds.length > 0
              ? `${filters.categoryIds.length} selected (Ctrl/Cmd+Click to deselect)`
              : 'Ctrl/Cmd+Click to select multiple'}
          </p>
        </div>
      )}

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className={`cursor-pointer rounded-full border-2 px-3 py-1 text-sm transition ${
                  filters.tagIds.includes(tag.id)
                    ? 'border-green-500 bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200'
                    : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.tagIds.includes(tag.id)}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      tagIds: e.target.checked
                        ? [...filters.tagIds, tag.id]
                        : filters.tagIds.filter((id) => id !== tag.id),
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

      {/* Favorites Toggle */}
      <label className="flex cursor-pointer items-center rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
        <input
          type="checkbox"
          checked={filters.favoritesOnly}
          onChange={(e) =>
            setFilters({ ...filters, favoritesOnly: e.target.checked })
          }
          className="mr-3 h-4 w-4"
        />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Show only my favorites
        </span>
      </label>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="w-full rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
        >
          Clear All Filters
        </button>
      )}

      {loadingOptions && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Loading filter options...
        </p>
      )}
    </div>
  )
}
