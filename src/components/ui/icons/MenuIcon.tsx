/**
 * Menu Icon Component
 * Hamburger menu icon with three horizontal lines
 */

interface MenuIconProps {
  className?: string
  'aria-hidden'?: boolean
}

export function MenuIcon({
  className = 'h-5 w-5',
  'aria-hidden': ariaHidden = true,
}: MenuIconProps) {
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
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
