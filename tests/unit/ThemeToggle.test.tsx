import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

/**
 * Component tests for ThemeToggle
 * Tests the theme toggle button functionality and integration with ThemeProvider
 */

describe('ThemeToggle Component', () => {
  test('renders theme toggle button', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    // Component uses a mounted check, so we need to wait for it to render
    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  test('button has aria-label for accessibility', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    await waitFor(() => {
      const button = screen.getByLabelText('Toggle theme')
      expect(button).toBeInTheDocument()
    })
  })

  test('button displays theme icon and text', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    await waitFor(() => {
      const button = screen.getByRole('button')
      // Button should contain either light or dark mode text
      const textContent = button.textContent
      expect(textContent).toMatch(/Light Mode|Dark Mode/)
    })
  })

  test('theme button exists within ThemeProvider context', async () => {
    render(
      <ThemeProvider>
        <div>
          <h1>Test Page</h1>
          <ThemeToggle />
        </div>
      </ThemeProvider>
    )

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /Toggle theme/i })
      expect(button).toBeInTheDocument()
    })
  })

  test('button is clickable', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
      // Verify we can click it without errors
      expect(() => fireEvent.click(button)).not.toThrow()
    })
  })
})
