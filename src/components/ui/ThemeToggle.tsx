'use client'

import { useTheme } from 'next-themes'
import { useLayoutEffect, useState } from 'react'

/**
 * Theme Toggle Button Component
 *
 * Client component that toggles between light and dark modes
 * Includes mounted check to prevent hydration mismatches
 * (Next.js renders on server, client hydrates - theme is client-only)
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Only render after component is mounted on client
  // This prevents hydration mismatch between server and client
  // useLayoutEffect runs synchronously and is the proper pattern for this use case
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-lg bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  )
}
