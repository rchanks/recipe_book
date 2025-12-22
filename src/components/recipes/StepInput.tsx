'use client'

import React from 'react'
import type { RecipeStep } from '@/types'

interface StepInputProps {
  steps: RecipeStep[]
  onChange: (steps: RecipeStep[]) => void
}

/**
 * Component to manage dynamic recipe step inputs
 */
export function StepInput({ steps, onChange }: StepInputProps) {
  const handleAddStep = () => {
    const newStep: RecipeStep = {
      stepNumber: steps.length + 1,
      instruction: '',
      notes: '',
    }
    onChange([...steps, newStep])
  }

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index)
    // Renumber steps
    const renumbered = newSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1,
    }))
    onChange(renumbered)
  }

  const handleStepChange = (
    index: number,
    field: keyof RecipeStep,
    value: string
  ) => {
    const newSteps = [...steps]
    newSteps[index] = {
      ...newSteps[index],
      [field]: value === '' ? null : value,
    }
    onChange(newSteps)
  }

  return (
    <div className="space-y-3">
      {steps.map((step, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900"
        >
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white dark:bg-blue-700">
              {step.stepNumber}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <textarea
                placeholder="Step instructions *"
                required
                value={step.instruction || ''}
                onChange={(e) =>
                  handleStepChange(idx, 'instruction', e.target.value)
                }
                rows={2}
                className="w-full rounded border border-blue-300 px-3 py-2 dark:border-blue-600 dark:bg-blue-800 dark:text-white"
              />
              <textarea
                placeholder="Notes or tips (optional)"
                value={step.notes || ''}
                onChange={(e) =>
                  handleStepChange(idx, 'notes', e.target.value)
                }
                rows={1}
                className="w-full rounded border border-blue-300 px-3 py-2 text-sm dark:border-blue-600 dark:bg-blue-800 dark:text-white"
              />
            </div>
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveStep(idx)}
                className="flex-shrink-0 rounded bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddStep}
        className="rounded bg-blue-100 px-4 py-2 font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
      >
        + Add Step
      </button>
    </div>
  )
}
