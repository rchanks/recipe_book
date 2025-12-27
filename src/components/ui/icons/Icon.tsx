/**
 * Base Icon Component
 * Provides a reusable SVG icon wrapper with built-in accessibility features
 */

interface IconProps {
  className?: string
  'aria-label'?: string
  'aria-hidden'?: boolean
}

export function Icon({
  children,
  className = 'h-5 w-5',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = false,
}: React.PropsWithChildren<IconProps>) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  )
}
