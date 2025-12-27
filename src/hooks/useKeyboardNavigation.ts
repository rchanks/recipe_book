'use client'

import { useEffect } from 'react'

/**
 * Hook for keyboard navigation through steps
 * Arrow Down: Move to next step
 * Arrow Up: Move to previous step
 * Escape: Clear current selection
 */
export function useKeyboardNavigation(
  totalSteps: number,
  currentStep: number | null,
  onStepChange: (step: number | null) => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys and escape
      if (
        e.key !== 'ArrowDown' &&
        e.key !== 'ArrowUp' &&
        e.key !== 'Escape'
      ) {
        return
      }

      // Allow natural scrolling behavior for arrows in text inputs
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        return
      }

      e.preventDefault()

      if (e.key === 'ArrowDown') {
        // Move to next step
        if (currentStep === null) {
          // Start at first step if none selected
          onStepChange(1)
        } else if (currentStep < totalSteps) {
          onStepChange(currentStep + 1)
        }
        // Do nothing if already at last step
      } else if (e.key === 'ArrowUp') {
        // Move to previous step
        if (currentStep === null) {
          // Start at first step if none selected
          onStepChange(1)
        } else if (currentStep > 1) {
          onStepChange(currentStep - 1)
        }
        // Do nothing if already at first step
      } else if (e.key === 'Escape') {
        // Clear current selection
        onStepChange(null)
      }
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentStep, totalSteps, onStepChange])
}
