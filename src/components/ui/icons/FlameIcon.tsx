/**
 * Flame Icon Component
 * Displays a flame/fire icon
 * Used for cooking temperature and heat level information
 */

interface FlameIconProps {
  className?: string
  'aria-hidden'?: boolean
}

export function FlameIcon({
  className = 'h-5 w-5',
  'aria-hidden': ariaHidden = true,
}: FlameIconProps) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      stroke="none"
      aria-hidden={ariaHidden}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.3 4 13c0 5.25 3.07 7.8 5.5 7.8s5.5-2.55 5.5-7.8c0-1.74-.35-3.44-.75-5.23 2.25.26 5.25 2.67 5.25 5.23 0 2.5-2.25 5-5.5 5s-5.5-2.5-5.5-5c0-1.6.75-2.9 1.8-3.9.6-.9.6-2.6 0-3.5-.9-1.4-1.8-2.9-1.8-4.4s.75-2.95 2.1-3.9H13.5z" />
    </svg>
  )
}
