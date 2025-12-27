'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Hook for managing localStorage state with SSR safety
 * Handles hydration mismatch by not updating state until fully mounted
 * Includes error handling for quota exceeded and privacy mode
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const isMountedRef = useRef(false)

  // Load value from localStorage ONLY after mount is complete
  // This prevents hydration mismatches
  useEffect(() => {
    // Only run once on mount
    if (isMountedRef.current) return
    isMountedRef.current = true

    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item)
        // Only update if different from initial value to avoid unnecessary re-renders
        if (JSON.stringify(parsed) !== JSON.stringify(initialValue)) {
          setStoredValue(parsed)
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      // Keep initial value on error
    }
  }, [key, initialValue])

  // Update localStorage when value changes
  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      // Only write to localStorage after mount
      if (isMountedRef.current) {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          console.error('localStorage quota exceeded')
        } else if (error.message.includes('private browsing')) {
          console.warn('localStorage not available in private browsing mode')
        } else {
          console.error(`Error setting localStorage key "${key}":`, error)
        }
      }
      // Still update state even if localStorage fails
      setStoredValue(value)
    }
  }

  return [storedValue, setValue]
}
