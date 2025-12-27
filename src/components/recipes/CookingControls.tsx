'use client'

import { useLocalStorage } from '@/hooks/useLocalStorage'

interface CookingControlsProps {
  onLargeTextChange?: (isLarge: boolean) => void
}

/**
 * Toolbar for cooking mode controls
 * Includes: text size toggle, print button, and sticky panel toggle
 */
export function CookingControls({ onLargeTextChange }: CookingControlsProps) {
  const [largeText, setLargeText] = useLocalStorage('recipe-large-text', false)

  const toggleTextSize = () => {
    const newValue = !largeText
    setLargeText(newValue)
    onLargeTextChange?.(newValue)
    announceToScreenReader(
      `Text size ${newValue ? 'increased to large' : 'reset to normal'}`
    )
  }

  const handlePrint = () => {
    announceToScreenReader('Print dialog opening')
    window.print()
  }

  /**
   * Announce message to screen readers via live region
   */
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', 'polite')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  return (
    <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      {/* Text Size Toggle */}
      <button
        onClick={toggleTextSize}
        className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-950"
        aria-label={`${largeText ? 'Decrease' : 'Increase'} text size`}
        aria-pressed={largeText}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
          />
        </svg>
        <span>{largeText ? 'Normal Text' : 'Large Text'}</span>
      </button>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-950"
        aria-label="Print recipe"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2m-6-4V9a2 2 0 012-2h6a2 2 0 012 2v8m-6 0a2 2 0 100-4 2 2 0 000 4z"
          />
        </svg>
        <span>Print</span>
      </button>
    </div>
  )
}
