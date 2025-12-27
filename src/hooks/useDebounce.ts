'use client'

import { useState, useEffect } from 'react'

/**
 * Hook for debouncing a value
 * Returns the debounced value after a delay of no changes
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    // Clear the timeout if value changes before delay completes
    return () => clearTimeout(handler)
  }, [value, delayMs])

  return debouncedValue
}
