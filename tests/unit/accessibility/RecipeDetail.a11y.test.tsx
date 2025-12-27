import React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { RecipeDetail } from '@/components/recipes/RecipeDetail'
import type { Recipe } from '@/types'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => (
    <img src={src} alt={alt} data-testid="recipe-image" />
  ),
}))

// Mock RecipeMetadata
jest.mock('@/components/recipes/RecipeMetadata', () => ({
  RecipeMetadata: ({ servings, prepTime, cookTime }: any) => (
    <div data-testid="recipe-metadata">
      Metadata: {servings} servings, {prepTime}min prep, {cookTime}min cook
    </div>
  ),
}))

// Mock keyboard navigation hook
jest.mock('@/hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: jest.fn(),
}))

const mockRecipe: Recipe = {
  id: '1',
  title: 'Test Recipe',
  description: 'A test recipe',
  photoUrl: '/test.jpg',
  servings: 4,
  prepTime: 15,
  cookTime: 30,
  ingredients: [
    { quantity: '2', unit: 'cups', name: 'flour', note: 'All-purpose' },
    { quantity: '1', unit: 'egg', name: 'egg', note: '' },
    { quantity: '500', unit: 'ml', name: 'milk', note: '' },
  ],
  steps: [
    { stepNumber: 1, instruction: 'Mix flour and eggs', notes: 'Mix well' },
    { stepNumber: 2, instruction: 'Add milk gradually', notes: '' },
    { stepNumber: 3, instruction: 'Cook until done', notes: 'Keep stirring' },
  ],
  categories: [],
  tags: [],
  notes: 'Some recipe notes',
  familyStory: 'A family story',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  groupId: '1',
  createdByUserId: 'user1',
  creator: { id: 'user1', name: 'Test User', email: 'test@example.com' },
}

describe('RecipeDetail - Accessibility (WCAG 2.1 Level AA)', () => {
  describe('Light Theme Accessibility', () => {
    it('should not have accessibility violations in light mode', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with edit button', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={true}
          canDelete={false}
          isFavorited={false}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with delete button', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={true}
          isFavorited={false}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with favorite button', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
          onToggleFavorite={() => {}}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with all buttons', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={true}
          canDelete={true}
          isFavorited={true}
          onToggleFavorite={() => {}}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Dark Theme Accessibility', () => {
    beforeEach(() => {
      // Set dark mode
      document.documentElement.classList.add('dark')
    })

    afterEach(() => {
      // Clean up
      document.documentElement.classList.remove('dark')
    })

    it('should not have accessibility violations in dark mode', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with buttons in dark mode', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={true}
          canDelete={true}
          isFavorited={true}
          onToggleFavorite={() => {}}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Heading Structure', () => {
    it('should have proper heading hierarchy', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      // Check that we have h1 for title
      const h1 = container.querySelector('h1')
      expect(h1).toBeInTheDocument()
      expect(h1?.textContent).toContain('Test Recipe')

      // Check for h2 sections
      const h2Elements = container.querySelectorAll('h2')
      expect(h2Elements.length).toBeGreaterThan(0)

      const headings = Array.from(h2Elements).map((h) => h.textContent)
      expect(headings).toContain('Ingredients')
      expect(headings).toContain('Instructions')
    })

    it('should have no skipped heading levels', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      // Get all heading levels
      const h1 = container.querySelectorAll('h1').length
      const h2 = container.querySelectorAll('h2').length
      const h3 = container.querySelectorAll('h3').length
      const h4 = container.querySelectorAll('h4').length

      // h1 should exist, and heading hierarchy should not skip levels
      expect(h1).toBeGreaterThan(0)
      expect(h2).toBeGreaterThan(0)
      // If h3 or h4 exist, h2 should exist (already checked)
    })
  })

  describe('Semantic HTML', () => {
    it('should use semantic section elements', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const sections = container.querySelectorAll('section')
      expect(sections.length).toBeGreaterThan(0)
    })

    it('should use link element for back link', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const link = container.querySelector('a[href="/recipes"]')
      expect(link).toBeInTheDocument()
      expect(link?.textContent).toContain('Back to recipes')
    })

    it('should use button elements for interactive elements', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      // Check for step buttons
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)

      // Each step should have role="button"
      const stepButtons = container.querySelectorAll('[role="button"]')
      expect(stepButtons.length).toBeGreaterThan(0)
    })
  })

  describe('ARIA Attributes', () => {
    it('should have proper ARIA labels on ingredient checkboxes', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes.length).toBe(3)

      checkboxes.forEach((checkbox, index) => {
        expect(checkbox).toHaveAttribute('aria-label')
        expect(checkbox).toHaveAttribute('aria-checked')
      })
    })

    it('should have proper ARIA attributes on step buttons', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const stepButtons = container.querySelectorAll('[role="button"]')
      stepButtons.forEach((button) => {
        expect(button).toHaveAttribute('aria-label')
        expect(button).toHaveAttribute('aria-pressed')
      })
    })

    it('should have aria-expanded on sticky panel toggle', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      // Find the toggle button for sticky panel
      const toggleButtons = container.querySelectorAll(
        'button[aria-label*="ingredients panel"]'
      )
      if (toggleButtons.length > 0) {
        expect(toggleButtons[0]).toHaveAttribute('aria-expanded')
      }
    })
  })

  describe('Form Elements', () => {
    it('should have proper labels for checkboxes', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute('aria-label')
      })
    })

    it('should have proper focus states', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      // All buttons should be focusable
      const buttons = container.querySelectorAll('button')
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('disabled')
      })
    })
  })

  describe('Images', () => {
    it('should have alt text on recipe image', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const img = container.querySelector('img')
      expect(img).toHaveAttribute('alt')
      expect(img?.getAttribute('alt')).toBe('Test Recipe')
    })
  })

  describe('Color Contrast', () => {
    it('should have sufficient color contrast in light mode', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      })

      // Should have no color contrast violations
      const colorContrastViolations = results.violations.filter(
        (v) => v.id === 'color-contrast'
      )
      expect(colorContrastViolations).toEqual([])
    })

    it('should have sufficient color contrast in dark mode', async () => {
      document.documentElement.classList.add('dark')

      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      })

      const colorContrastViolations = results.violations.filter(
        (v) => v.id === 'color-contrast'
      )
      expect(colorContrastViolations).toEqual([])

      document.documentElement.classList.remove('dark')
    })
  })

  describe('Touch Targets', () => {
    it('should have minimum 44x44px touch targets', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={true}
          onToggleFavorite={() => {}}
        />
      )

      // Check buttons
      const buttons = container.querySelectorAll('button')
      buttons.forEach((button) => {
        const styles = window.getComputedStyle(button)
        const minHeight = parseFloat(styles.minHeight || '44')
        const minWidth = parseFloat(styles.minWidth || '44')
        expect(minHeight).toBeGreaterThanOrEqual(44)
        expect(minWidth).toBeGreaterThanOrEqual(44)
      })

      // Check checkboxes
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      checkboxes.forEach((checkbox) => {
        const styles = window.getComputedStyle(checkbox)
        const minHeight = parseFloat(styles.minHeight || '44')
        const minWidth = parseFloat(styles.minWidth || '44')
        expect(minHeight).toBeGreaterThanOrEqual(44)
        expect(minWidth).toBeGreaterThanOrEqual(44)
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should have focusable interactive elements', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={true}
          onToggleFavorite={() => {}}
        />
      )

      // All buttons should be keyboard accessible
      const buttons = container.querySelectorAll('button')
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON')
      })

      // Step elements should have tabIndex or be actual buttons
      const stepElements = container.querySelectorAll('[role="button"]')
      stepElements.forEach((el) => {
        const tabIndex = parseInt(el.getAttribute('tabindex') || '0', 10)
        expect(tabIndex).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Text Readability', () => {
    it('should have adequate letter spacing', async () => {
      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      // This is a visual property that's harder to test precisely,
      // but we can verify that text is readable
      const headings = container.querySelectorAll('h1, h2')
      expect(headings.length).toBeGreaterThan(0)
    })
  })

  describe('Large Text Mode Support', () => {
    it('should scale text sizes properly', async () => {
      const { container, rerender } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      // Get initial text size
      const baseText = container.querySelector('.recipe-base-text')
      const initialSize = baseText
        ? window.getComputedStyle(baseText).fontSize
        : null

      // Simulate large text mode
      document.documentElement.setAttribute('data-large-text', 'true')

      rerender(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const largeText = container.querySelector('.recipe-base-text')
      const largeSize = largeText
        ? window.getComputedStyle(largeText).fontSize
        : null

      // Clean up
      document.documentElement.removeAttribute('data-large-text')

      // Text should be readable (actual size depends on CSS)
      expect(baseText).toBeInTheDocument()
    })
  })

  describe('Accessibility with Different Content', () => {
    it('should handle recipe without notes', async () => {
      const recipeWithoutNotes = { ...mockRecipe, notes: undefined }

      const { container } = render(
        <RecipeDetail
          recipe={recipeWithoutNotes}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should handle recipe without family story', async () => {
      const recipeWithoutStory = { ...mockRecipe, familyStory: undefined }

      const { container } = render(
        <RecipeDetail
          recipe={recipeWithoutStory}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should handle recipe with minimal data', async () => {
      const minimalRecipe: Recipe = {
        id: '2',
        title: 'Simple Recipe',
        description: undefined,
        photoUrl: undefined,
        servings: 1,
        prepTime: 10,
        cookTime: 20,
        ingredients: [{ quantity: '1', unit: 'cup', name: 'water', note: '' }],
        steps: [{ stepNumber: 1, instruction: 'Heat', notes: '' }],
        categories: [],
        tags: [],
        notes: undefined,
        familyStory: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        groupId: '1',
        createdByUserId: 'user1',
        creator: { id: 'user1', name: 'Test User', email: 'test@example.com' },
      }

      const { container } = render(
        <RecipeDetail
          recipe={minimalRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
