import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CookingControls } from '@/components/recipes/CookingControls'

// Mock window.print
const mockPrint = jest.fn()
Object.defineProperty(window, 'print', {
  value: mockPrint,
  writable: true,
})

// Mock useLocalStorage hook
jest.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn((key: string, defaultValue: boolean) => {
    const [value, setValue] = React.useState(defaultValue)
    return [value, setValue]
  }),
}))

describe('CookingControls', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPrint.mockClear()
    // Clean up any announcements from previous tests
    document.body.querySelectorAll('[role="status"]').forEach((el) => {
      el.remove()
    })
  })

  describe('Rendering', () => {
    it('should render text size toggle button', () => {
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })
      expect(textSizeButton).toBeInTheDocument()
    })

    it('should render print button', () => {
      render(<CookingControls />)

      const printButton = screen.getByRole('button', {
        name: /print recipe/i,
      })
      expect(printButton).toBeInTheDocument()
    })

    it('should render initial text as "Large Text"', () => {
      render(<CookingControls />)

      expect(screen.getByText('Large Text')).toBeInTheDocument()
    })

    it('should render print button text', () => {
      render(<CookingControls />)

      expect(screen.getByText('Print')).toBeInTheDocument()
    })

    it('should render SVG icons with aria-hidden', () => {
      const { container } = render(<CookingControls />)

      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(2)
      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('should render toolbar container with proper classes', () => {
      const { container } = render(<CookingControls />)

      const toolbar = container.querySelector('div[class*="flex"]')
      expect(toolbar).toBeInTheDocument()
      expect(toolbar).toHaveClass('mb-6')
      expect(toolbar).toHaveClass('gap-3')
    })
  })

  describe('Text Size Toggle', () => {
    it('should toggle text size on button click', async () => {
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      expect(screen.getByText('Large Text')).toBeInTheDocument()

      fireEvent.click(textSizeButton)

      await waitFor(() => {
        expect(screen.getByText('Normal Text')).toBeInTheDocument()
      })
    })

    it('should update aria-label when text size is toggled', async () => {
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      expect(textSizeButton).toHaveAttribute(
        'aria-label',
        'Increase text size'
      )

      fireEvent.click(textSizeButton)

      await waitFor(() => {
        expect(textSizeButton).toHaveAttribute(
          'aria-label',
          'Decrease text size'
        )
      })
    })

    it('should update aria-pressed attribute', async () => {
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      expect(textSizeButton).toHaveAttribute('aria-pressed', 'false')

      fireEvent.click(textSizeButton)

      await waitFor(() => {
        expect(textSizeButton).toHaveAttribute('aria-pressed', 'true')
      })
    })

    it('should toggle back to "Large Text"', async () => {
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      fireEvent.click(textSizeButton)

      await waitFor(() => {
        expect(screen.getByText('Normal Text')).toBeInTheDocument()
      })

      fireEvent.click(textSizeButton)

      await waitFor(() => {
        expect(screen.getByText('Large Text')).toBeInTheDocument()
      })
    })

    it('should call onLargeTextChange callback with correct value', async () => {
      const mockCallback = jest.fn()
      render(<CookingControls onLargeTextChange={mockCallback} />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      fireEvent.click(textSizeButton)

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(true)
      })
    })

    it('should call callback again when toggling back', async () => {
      const mockCallback = jest.fn()
      render(<CookingControls onLargeTextChange={mockCallback} />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      fireEvent.click(textSizeButton)

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(true)
      })

      fireEvent.click(textSizeButton)

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(false)
      })
    })

    it('should have proper ARIA attributes for text size button', () => {
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      expect(textSizeButton).toHaveAttribute('aria-label')
      expect(textSizeButton).toHaveAttribute('aria-pressed')
    })

    it('should announce text size change to screen reader', async () => {
      jest.useFakeTimers()
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      fireEvent.click(textSizeButton)

      // Check announcement in document.body (where it's added)
      const announcement = document.body.querySelector('[role="status"]')
      expect(announcement).toBeInTheDocument()

      jest.useRealTimers()
    })

    it('should create announcement with aria-live="polite"', async () => {
      jest.useFakeTimers()
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      fireEvent.click(textSizeButton)

      // Check announcement in document.body
      const announcement = document.body.querySelector('[aria-live="polite"]')
      expect(announcement).toBeInTheDocument()

      jest.useRealTimers()
    })

    it('should have sr-only class on announcement', async () => {
      jest.useFakeTimers()
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      fireEvent.click(textSizeButton)

      // Check announcement in document.body
      const announcement = document.body.querySelector('[role="status"]')
      expect(announcement).toHaveClass('sr-only')

      jest.useRealTimers()
    })
  })

  describe('Print Button', () => {
    it('should call window.print when print button is clicked', () => {
      render(<CookingControls />)

      const printButton = screen.getByRole('button', {
        name: /print recipe/i,
      })

      fireEvent.click(printButton)

      expect(mockPrint).toHaveBeenCalled()
    })

    it('should have proper aria-label', () => {
      render(<CookingControls />)

      const printButton = screen.getByRole('button', {
        name: /print recipe/i,
      })

      expect(printButton).toHaveAttribute('aria-label', 'Print recipe')
    })

    it('should announce print to screen reader', async () => {
      jest.useFakeTimers()
      render(<CookingControls />)

      const printButton = screen.getByRole('button', {
        name: /print recipe/i,
      })

      fireEvent.click(printButton)

      // Check announcement in document.body
      const announcement = document.body.querySelector('[role="status"]')
      expect(announcement).toBeInTheDocument()
      expect(announcement?.textContent).toContain('Print dialog opening')

      jest.useRealTimers()
    })

    it('should be keyboard accessible with Tab key', () => {
      render(<CookingControls />)

      const printButton = screen.getByRole('button', {
        name: /print recipe/i,
      })

      // Button should be focusable
      printButton.focus()
      expect(printButton).toHaveFocus()

      // Clicking should work
      fireEvent.click(printButton)
      expect(mockPrint).toHaveBeenCalled()
    })

    it('should work with click on Space/Enter press', () => {
      render(<CookingControls />)

      const printButton = screen.getByRole('button', {
        name: /print recipe/i,
      })

      // Native HTML buttons handle Space/Enter automatically
      // We test that clicking works (which also fires on Space/Enter)
      fireEvent.click(printButton)
      expect(mockPrint).toHaveBeenCalled()
    })
  })

  describe('Button Accessibility', () => {
    it('should have focusable buttons', () => {
      render(<CookingControls />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)

      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('disabled')
      })
    })

    it('should support keyboard navigation through all buttons', () => {
      render(<CookingControls />)

      const buttons = screen.getAllByRole('button')

      buttons.forEach((button) => {
        button.focus()
        expect(button).toHaveFocus()
      })
    })

    it('should have visible text labels', () => {
      render(<CookingControls />)

      expect(screen.getByText('Large Text')).toBeVisible()
      expect(screen.getByText('Print')).toBeVisible()
    })

    it('should have proper button styling for interaction', () => {
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })
      const printButton = screen.getByRole('button', {
        name: /print recipe/i,
      })

      expect(textSizeButton).toHaveClass('rounded-md')
      expect(textSizeButton).toHaveClass('px-4')
      expect(textSizeButton).toHaveClass('py-2')

      expect(printButton).toHaveClass('rounded-md')
      expect(printButton).toHaveClass('px-4')
      expect(printButton).toHaveClass('py-2')
    })
  })

  describe('Screen Reader Announcements', () => {
    it('should announce text size increase to screen reader', () => {
      jest.useFakeTimers()
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      fireEvent.click(textSizeButton)

      // Check in document.body where announcement is added
      const announcement = document.body.querySelector('[role="status"]')
      expect(announcement?.textContent).toContain('Text size')
      expect(announcement?.textContent).toContain('increased to large')

      jest.useRealTimers()
    })

    it('should announce text size decrease to screen reader', () => {
      jest.useFakeTimers()
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      // First click to increase
      fireEvent.click(textSizeButton)

      expect(screen.getByText('Normal Text')).toBeInTheDocument()

      // Clean up first announcement before second click
      jest.advanceTimersByTime(1000)

      // Second click to decrease
      fireEvent.click(textSizeButton)

      // Check latest announcement in document.body
      const announcements = document.body.querySelectorAll('[role="status"]')
      expect(announcements.length).toBeGreaterThan(0)
      const latestAnnouncement = announcements[announcements.length - 1]
      expect(latestAnnouncement?.textContent).toContain('Text size')
      expect(latestAnnouncement?.textContent).toContain('reset to normal')

      jest.useRealTimers()
    })

    it('should remove announcement after timeout', () => {
      jest.useFakeTimers()
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      fireEvent.click(textSizeButton)

      let announcement = document.body.querySelector('[role="status"]')
      expect(announcement).toBeInTheDocument()

      // Advance time to trigger cleanup
      jest.advanceTimersByTime(1000)

      // Check that announcement was removed
      announcement = document.body.querySelector('[role="status"]')
      expect(announcement).not.toBeInTheDocument()

      jest.useRealTimers()
    })
  })

  describe('Multiple Interactions', () => {
    it('should handle multiple text size toggles', async () => {
      const mockCallback = jest.fn()
      render(<CookingControls onLargeTextChange={mockCallback} />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      fireEvent.click(textSizeButton)
      fireEvent.click(textSizeButton)
      fireEvent.click(textSizeButton)

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledTimes(3)
      })
    })

    it('should handle print and text size toggle independently', async () => {
      const mockCallback = jest.fn()
      render(<CookingControls onLargeTextChange={mockCallback} />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })
      const printButton = screen.getByRole('button', {
        name: /print recipe/i,
      })

      fireEvent.click(textSizeButton)
      fireEvent.click(printButton)
      fireEvent.click(textSizeButton)

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledTimes(2)
        expect(mockPrint).toHaveBeenCalledTimes(1)
      })
    })

    it('should maintain text size button state after print', async () => {
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })
      const printButton = screen.getByRole('button', {
        name: /print recipe/i,
      })

      fireEvent.click(textSizeButton)

      await waitFor(() => {
        expect(screen.getByText('Normal Text')).toBeInTheDocument()
      })

      fireEvent.click(printButton)

      // Text size should still be "Normal Text"
      expect(screen.getByText('Normal Text')).toBeInTheDocument()
    })
  })

  describe('Callback Optional', () => {
    it('should work without onLargeTextChange callback', () => {
      render(<CookingControls />)

      const textSizeButton = screen.getByRole('button', {
        name: /increase text size/i,
      })

      // Should not throw error
      fireEvent.click(textSizeButton)
      expect(textSizeButton).toBeInTheDocument()
    })
  })
})
