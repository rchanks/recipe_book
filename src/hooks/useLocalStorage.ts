'use client'

import { useState, useEffect } from 'react'

/**
 * Hook for managing localStorage state with SSR safety
 * Handles hydration mismatch by defaulting to initial value until mounted
 * Includes error handling for quota exceeded and privacy mode
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [mounted, setMounted] = useState(false)

  // Load value from localStorage on mount
  useEffect(() => {
    try {
      setMounted(true)
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      // Fall back to initial value on error
      setStoredValue(initialValue)
    }
  }, [key, initialValue])

  // Update localStorage when value changes
  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      if (mounted) {
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
