import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RecipeDetail } from '@/components/recipes/RecipeDetail'
import type { Recipe } from '@/types'

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

describe('RecipeDetail - Cooking Features', () => {
  describe('Interactive Ingredient Checkboxes', () => {
    it('should render ingredient checkboxes', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(3)
    })

    it('should toggle ingredient checkbox on click', async () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const firstCheckbox = checkboxes[0] as HTMLInputElement

      expect(firstCheckbox.checked).toBe(false)

      fireEvent.click(firstCheckbox)

      await waitFor(() => {
        expect(firstCheckbox.checked).toBe(true)
      })
    })

    it('should apply strikethrough styling to checked ingredient', async () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const firstCheckbox = checkboxes[0]
      const ingredientCard = firstCheckbox.closest('[class*="flex"]')?.parentElement
      const ingredientContent = ingredientCard?.querySelector('[class*="transition-opacity"]')

      fireEvent.click(firstCheckbox)

      await waitFor(() => {
        expect(ingredientContent).toHaveClass('opacity-50')
        expect(ingredientContent).toHaveClass('line-through')
      })
    })

    it('should maintain independent checkbox states', async () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')

      fireEvent.click(checkboxes[0])
      fireEvent.click(checkboxes[2])

      await waitFor(() => {
        expect((checkboxes[0] as HTMLInputElement).checked).toBe(true)
        expect((checkboxes[1] as HTMLInputElement).checked).toBe(false)
        expect((checkboxes[2] as HTMLInputElement).checked).toBe(true)
      })
    })

    it('should have proper ARIA labels for ingredients', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toHaveAttribute('aria-label', '2 cups flour')
      expect(checkboxes[1]).toHaveAttribute('aria-label', '1 egg egg')
      expect(checkboxes[2]).toHaveAttribute('aria-label', '500 ml milk')
    })

    it('should have aria-checked attribute', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('Step Highlighting', () => {
    it('should render all instruction steps', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      expect(screen.getByText('Mix flour and eggs')).toBeInTheDocument()
      expect(screen.getByText('Add milk gradually')).toBeInTheDocument()
      expect(screen.getByText('Cook until done')).toBeInTheDocument()
    })

    it('should highlight step on click', async () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const steps = screen.getAllByRole('button')
      const firstStep = steps.find((btn) =>
        btn.querySelector('p')?.textContent?.includes('Mix flour')
      )

      fireEvent.click(firstStep!)

      await waitFor(() => {
        expect(firstStep).toHaveClass('bg-blue-200')
        expect(firstStep).toHaveClass('border-blue-600')
      })
    })

    it('should show only one highlighted step at a time', async () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const steps = screen.getAllByRole('button')
      const stepButtons = Array.from(steps).filter((btn) =>
        btn.classList.contains('cursor-pointer')
      )

      fireEvent.click(stepButtons[0])

      await waitFor(() => {
        expect(stepButtons[0]).toHaveClass('bg-blue-200')
      })

      fireEvent.click(stepButtons[1])

      await waitFor(() => {
        expect(stepButtons[0]).not.toHaveClass('bg-blue-200')
        expect(stepButtons[1]).toHaveClass('bg-blue-200')
      })
    })

    it('should have proper ARIA labels for steps', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const stepButtons = screen.getAllByRole('button', {
        name: /^Step/,
      })

      expect(stepButtons[0]).toHaveAttribute('aria-label', expect.stringContaining('Step 1'))
      expect(stepButtons[1]).toHaveAttribute('aria-label', expect.stringContaining('Step 2'))
    })

    it('should have aria-pressed attribute', () => {
      const { rerender } = render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const stepButtons = screen.getAllByRole('button', {
        name: /^Step/,
      })

      expect(stepButtons[0]).toHaveAttribute('aria-pressed', 'false')

      fireEvent.click(stepButtons[0])

      rerender(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )
    })
  })

  describe('Sticky Ingredient Panel', () => {
    it('should render ingredients section', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      expect(screen.getByText('Ingredients')).toBeInTheDocument()
    })

    it('should render collapse toggle button', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const toggleButton = screen.getByRole('button', {
        name: /Hide ingredients panel/,
      })

      expect(toggleButton).toBeInTheDocument()
    })

    it('should toggle panel visibility on button click', async () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const toggleButton = screen.getByRole('button', {
        name: /Hide ingredients panel/,
      })

      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByRole('button', {
          name: /Show ingredients panel/,
        })).toBeInTheDocument()
      })
    })

    it('should hide ingredient list when collapsed', async () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const toggleButton = screen.getByRole('button', {
        name: /Hide ingredients panel/,
      })

      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(screen.queryByText('flour')).not.toBeInTheDocument()
      })
    })

    it('should show ingredient list when expanded', async () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      expect(screen.getByText('flour')).toBeInTheDocument()
    })

    it('should have proper ARIA attributes for toggle button', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const toggleButton = screen.getByRole('button', {
        name: /Hide ingredients panel/,
      })

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should update aria-expanded when collapsed', async () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const toggleButton = screen.getByRole('button', {
        name: /Hide ingredients panel/,
      })

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
      })
    })
  })

  describe('Recipe Sections', () => {
    it('should render notes section', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      expect(screen.getByText('Notes & Tips')).toBeInTheDocument()
      expect(screen.getByText('Some recipe notes')).toBeInTheDocument()
    })

    it('should render family story section', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      expect(screen.getByText('Family Story')).toBeInTheDocument()
      expect(screen.getByText('A family story')).toBeInTheDocument()
    })

    it('should not render notes section if no notes', () => {
      const recipeWithoutNotes = { ...mockRecipe, notes: undefined }

      render(
        <RecipeDetail
          recipe={recipeWithoutNotes}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      expect(screen.queryByText('Notes & Tips')).not.toBeInTheDocument()
    })

    it('should not render family story section if no story', () => {
      const recipeWithoutStory = { ...mockRecipe, familyStory: undefined }

      render(
        <RecipeDetail
          recipe={recipeWithoutStory}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      expect(screen.queryByText('Family Story')).not.toBeInTheDocument()
    })
  })

  describe('Content Accessibility', () => {
    it('should render recipe title', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      expect(screen.getByRole('heading', { name: 'Test Recipe' })).toBeInTheDocument()
    })

    it('should render recipe description', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      expect(screen.getByText('A test recipe')).toBeInTheDocument()
    })

    it('should render back to recipes link', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      expect(screen.getByRole('link', { name: /Back to recipes/ })).toBeInTheDocument()
    })

    it('should render creator information', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })

  describe('Interactive Button Accessibility', () => {
    it('should support keyboard interaction for step highlighting', async () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const stepButtons = screen.getAllByRole('button', {
        name: /^Step/,
      })

      stepButtons[0].focus()
      expect(stepButtons[0]).toHaveFocus()

      fireEvent.keyDown(stepButtons[0], { key: 'Enter' })

      await waitFor(() => {
        expect(stepButtons[0]).toHaveClass('bg-blue-200')
      })
    })

    it('should support space key for step highlighting', async () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          canEdit={false}
          canDelete={false}
          isFavorited={false}
        />
      )

      const stepButtons = screen.getAllByRole('button', {
        name: /^Step/,
      })

      fireEvent.keyDown(stepButtons[0], { key: ' ' })

      await waitFor(() => {
        expect(stepButtons[0]).toHaveClass('bg-blue-200')
      })
    })
  })
})
