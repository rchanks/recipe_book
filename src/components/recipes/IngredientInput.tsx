'use client'

import React from 'react'
import type { Ingredient } from '@/types'

interface IngredientInputProps {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

/**
 * Component to manage dynamic ingredient inputs
 */
export function IngredientInput({
  ingredients,
  onChange,
}: IngredientInputProps) {
  const handleAddIngredient = () => {
    const newIngredient: Ingredient = {
      quantity: '',
      unit: '',
      name: '',
      note: '',
    }
    onChange([...ingredients, newIngredient])
  }

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index)
    onChange(newIngredients)
  }

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value === '' ? null : value,
    }
    onChange(newIngredients)
  }

  return (
    <div className="space-y-3">
      {ingredients.map((ingredient, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Quantity (e.g., 2, 1/2)"
              value={ingredient.quantity || ''}
              onChange={(e) =>
                handleIngredientChange(idx, 'quantity', e.target.value)
              }
              className="w-20 rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Unit (e.g., cups, tbsp)"
              value={ingredient.unit || ''}
              onChange={(e) =>
                handleIngredientChange(idx, 'unit', e.target.value)
              }
              className="w-24 rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Ingredient name *"
              required
              value={ingredient.name || ''}
              onChange={(e) =>
                handleIngredientChange(idx, 'name', e.target.value)
              }
              className="flex-1 rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveIngredient(idx)}
                className="rounded bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
              >
                Remove
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Note (e.g., finely chopped)"
            value={ingredient.note || ''}
            onChange={(e) =>
              handleIngredientChange(idx, 'note', e.target.value)
            }
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddIngredient}
        className="rounded bg-blue-100 px-4 py-2 font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
      >
        + Add Ingredient
      </button>
    </div>
  )
}
