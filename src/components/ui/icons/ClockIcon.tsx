/**
 * Clock Icon Component
 * Displays a clock/time icon
 * Used for cooking time and prep time information
 */

interface ClockIconProps {
  className?: string
  'aria-hidden'?: boolean
}

export function ClockIcon({
  className = 'h-5 w-5',
  'aria-hidden': ariaHidden = true,
}: ClockIconProps) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
