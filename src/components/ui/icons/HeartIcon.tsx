/**
 * Heart Icon Component
 * Displays a heart icon with filled and outline variants
 * Used for favorite/favorite toggle functionality
 */

interface HeartIconProps {
  variant?: 'filled' | 'outline'
  className?: string
  'aria-hidden'?: boolean
}

export function HeartIcon({
  variant = 'outline',
  className = 'h-5 w-5',
  'aria-hidden': ariaHidden = true,
}: HeartIconProps) {
  if (variant === 'filled') {
    return (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        stroke="none"
        aria-hidden={ariaHidden}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )
  }

  // outline variant
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden={ariaHidden}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
