'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
}

/**
 * Theme Provider wrapper for next-themes
 * Enables light/dark mode support throughout the app
 * Uses class-based theme switching (adds 'dark' class to html element)
 */
export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attribute={attribute as any}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
