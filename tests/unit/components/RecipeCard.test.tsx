import { render, screen, fireEvent } from '@testing-library/react'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import type { Recipe } from '@/types'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

// Mock the RecipeMetadata component
jest.mock('@/components/recipes/RecipeMetadata', () => {
  return {
    RecipeMetadata: ({ servings, prepTime, cookTime }: any) => (
      <div data-testid="recipe-metadata">
        {servings && <span>Servings: {servings}</span>}
        {prepTime && <span>Prep: {prepTime}min</span>}
        {cookTime && <span>Cook: {cookTime}min</span>}
      </div>
    ),
  }
})

describe('RecipeCard Component', () => {
  const mockRecipe: Recipe = {
    id: 'recipe-1',
    title: 'Delicious Pasta',
    description: 'A classic Italian pasta with fresh tomatoes and basil',
    ingredients: [
      { name: 'Pasta', quantity: '1', unit: 'lb' },
      { name: 'Tomatoes', quantity: '2', unit: 'lbs' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Boil pasta', notes: null },
      { stepNumber: 2, instruction: 'Make sauce', notes: null },
    ],
    servings: 4,
    prepTime: 10,
    cookTime: 20,
    notes: 'Serve with parmesan',
    familyStory: null,
    createdBy: 'user-123',
    groupId: 'group-456',
    creator: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    },
    createdAt: new Date('2025-12-22'),
    updatedAt: new Date('2025-12-22'),
  }

  it('should render recipe title as link', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        canEdit={false}
        canDelete={false}
      />
    )

    const titleLink = screen.getByRole('link', { name: /delicious pasta/i })
    expect(titleLink).toBeInTheDocument()
    expect(titleLink).toHaveAttribute('href', '/recipes/recipe-1')
  })

  it('should render truncated description', () => {
    const longDescription = 'x'.repeat(150)
    const recipeWithLongDesc = {
      ...mockRecipe,
      description: longDescription,
    }

    render(
      <RecipeCard
        recipe={recipeWithLongDesc}
        canEdit={false}
        canDelete={false}
      />
    )

    const description = screen.getByText(/x{100}\.\.\./)
    expect(description).toBeInTheDocument()
  })

  it('should render recipe metadata', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        canEdit={false}
        canDelete={false}
      />
    )

    expect(screen.getByTestId('recipe-metadata')).toBeInTheDocument()
  })

  it('should render creator and date info', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        canEdit={false}
        canDelete={false}
      />
    )

    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    // Date rendering may vary by timezone, so check for presence of date text
    expect(screen.getByText(/Dec \d+, 2025/)).toBeInTheDocument()
  })

  it('should not show action buttons when no permissions', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        canEdit={false}
        canDelete={false}
      />
    )

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('should show edit button when canEdit is true', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        canEdit={true}
        canDelete={false}
        onEdit={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('should show delete button when canDelete is true', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        canEdit={false}
        canDelete={true}
        onDelete={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('should call onEdit when edit button clicked', () => {
    const mockOnEdit = jest.fn()
    render(
      <RecipeCard
        recipe={mockRecipe}
        canEdit={true}
        canDelete={false}
        onEdit={mockOnEdit}
      />
    )

    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledTimes(1)
  })

  it('should call onDelete when delete button clicked', () => {
    const mockOnDelete = jest.fn()
    render(
      <RecipeCard
        recipe={mockRecipe}
        canEdit={false}
        canDelete={true}
        onDelete={mockOnDelete}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledTimes(1)
  })

  it('should show both buttons when both permissions are true', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        canEdit={true}
        canDelete={true}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('should handle recipe without description', () => {
    const recipeNoDesc = {
      ...mockRecipe,
      description: null,
    }

    render(
      <RecipeCard
        recipe={recipeNoDesc}
        canEdit={false}
        canDelete={false}
      />
    )

    const titleLink = screen.getByRole('link', { name: /delicious pasta/i })
    expect(titleLink).toBeInTheDocument()
  })
})
