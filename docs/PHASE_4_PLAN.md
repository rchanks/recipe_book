# Phase 4: Recipe Core - CRUD Implementation Plan

## Overview
Phase 4 implements the heart of the application: complete CRUD operations for recipes with role-based permissions, structured ingredients and steps, and a cooking-friendly UI.

## Goals
- Implement recipe creation and editing with structured data
- Provide role-based access control (ADMIN and POWER_USER can create, READ_ONLY cannot)
- Enforce governance rules at the group level
- Create a cooking-friendly recipe detail view
- Establish foundation for future features (comments, tags, photos)

## Implementation Status: COMPLETE ✓

### Database Schema ✓
- **Recipe Model** (Prisma):
  - Core fields: `title` (string, indexed), `description` (text)
  - Structured JSON fields:
    - `ingredients`: Array of `{quantity: string, unit?: string, name: string, note?: string}`
    - `steps`: Array of `{stepNumber: number, instruction: string, notes?: string}`
  - Metadata: `servings` (int), `prepTime` (int), `cookTime` (int), `notes` (text), `familyStory` (text)
  - Photo placeholder: `photoUrl` (optional, for Phase 8)
  - Relations: `creator` (User), `group` (Group)
  - Timestamps: `createdAt`, `updatedAt`
  - Indexes: `groupId`, `createdBy`, `title`
  - Phase 6 prep: `categories` (RecipeCategory[]), `tags` (RecipeTag[])

### API Endpoints ✓

#### List Recipes
- **Endpoint**: `GET /api/recipes`
- **Location**: `src/app/api/recipes/route.ts`
- **Parameters**:
  - `page` (query): Page number (default: 1)
  - `limit` (query): Items per page (default: 20)
- **Permissions**: `recipe:read`
- **Response**:
  ```json
  {
    "recipes": Recipe[],
    "total": number,
    "page": number,
    "totalPages": number
  }
  ```
- **Features**:
  - Returns only recipes from user's group
  - Includes creator information
  - Handles pagination

#### Create Recipe
- **Endpoint**: `POST /api/recipes`
- **Location**: `src/app/api/recipes/route.ts`
- **Permissions**: `recipe:create`
- **Validation**:
  - `title`: Required, max 200 chars, min 1 char
  - `description`: Required
  - `ingredients`: Array, minimum 1 item
    - Each ingredient must have `name` (required)
    - `quantity`, `unit`, `note` optional
  - `steps`: Array, minimum 1 item
    - Each step must have `instruction` (required)
    - `stepNumber` auto-assigned
    - `notes` optional
  - `servings`: Optional, must be positive if provided
  - `prepTime`, `cookTime`: Optional, non-negative if provided
- **Response**: Created recipe (201)
- **Features**:
  - Atomic creation
  - Links to user's group

#### Get Recipe Detail
- **Endpoint**: `GET /api/recipes/[id]`
- **Location**: `src/app/api/recipes/[id]/route.ts`
- **Permissions**: `recipe:read`
- **Features**:
  - Verifies group membership
  - Returns full recipe object with creator info
  - 404 if recipe not found or user not in group

#### Update Recipe
- **Endpoint**: `PUT /api/recipes/[id]`
- **Location**: `src/app/api/recipes/[id]/route.ts`
- **Permissions**: `recipe:update` + group governance check
- **Validation**: Same as create
- **Governance Rule**:
  - ADMIN: Always allowed
  - POWER_USER: Only if group's `allowPowerUserEdit` is true
- **Features**:
  - Verifies ownership in same group
  - Respects governance settings
  - 403 if user lacks permission

#### Delete Recipe
- **Endpoint**: `DELETE /api/recipes/[id]`
- **Location**: `src/app/api/recipes/[id]/route.ts`
- **Permissions**: `recipe:delete` (ADMIN only)
- **Features**:
  - Double-checks permission via `canDeleteRecipe()`
  - Cascading delete if recipe has relations
  - 403 if user is not ADMIN

### Pages & Routes ✓

#### Recipe List (`/recipes`)
- **File**: `src/app/recipes/page.tsx`
- **Features**:
  - Displays all group recipes
  - Shows "Add Recipe" button for users with `recipe:create`
  - Uses `RecipeList` client component for pagination
  - Protected route (requires authentication)

#### Create Recipe (`/recipes/new`)
- **File**: `src/app/recipes/new/page.tsx`
- **Features**:
  - Form for new recipe creation
  - Permission check: `recipe:create`
  - Redirects to detail on success
  - Uses `RecipeForm` component

#### Recipe Detail (`/recipes/[id]`)
- **File**: `src/app/recipes/[id]/page.tsx`
- **Features**:
  - Full recipe display optimized for cooking
  - Shows all metadata: ingredients, instructions, times, family story
  - Conditional edit/delete buttons based on permissions
  - Uses `RecipeDetail` component

#### Edit Recipe (`/recipes/[id]/edit`)
- **File**: `src/app/recipes/[id]/edit/page.tsx`
- **Features**:
  - Pre-populated form with existing recipe
  - Permission check: `canEditRecipe()` (respects governance)
  - Redirects to detail on success
  - Uses `RecipeForm` component in edit mode

### React Components ✓

#### RecipeList (`src/components/recipes/RecipeList.tsx`)
- **Type**: Client component
- **Props**: None (fetches its own data)
- **Features**:
  - Fetches recipes from `/api/recipes?page=X&limit=20`
  - Pagination controls (Previous/Next)
  - Handles edit/delete with confirmation dialogs
  - Loading, error, and empty states
  - Grid layout for recipe cards

#### RecipeCard (`src/components/recipes/RecipeCard.tsx`)
- **Type**: Server component
- **Props**: `recipe: Recipe, onDelete: () => void`
- **Features**:
  - Displays recipe summary (title, description, metadata)
  - Creator and date information
  - Conditional edit/delete buttons
  - Links to detail page

#### RecipeForm (`src/components/recipes/RecipeForm.tsx`)
- **Type**: Client component
- **Props**: `recipe?: Recipe, mode: 'create' | 'edit'`
- **Features**:
  - Unified form for create and edit modes
  - Manages ingredients and steps via child components
  - Form validation (client-side)
  - Handles API calls (POST/PUT)
  - Redirects to recipe detail on success
  - Error handling and loading states

#### RecipeDetail (`src/components/recipes/RecipeDetail.tsx`)
- **Type**: Server component
- **Props**: `recipe: Recipe`
- **Features**:
  - Full recipe display
  - Sections: metadata, ingredients (with checkbox styling for cooking), numbered steps
  - Shows notes and family story
  - Edit/Delete buttons with confirmation
  - Handles deletion with redirect to list

#### IngredientInput (`src/components/recipes/IngredientInput.tsx`)
- **Type**: Client component
- **Props**: `ingredients: Ingredient[], onChange: (ingredients: Ingredient[]) => void`
- **Features**:
  - Add/Remove ingredient buttons
  - Fields: quantity, unit, name (required), note
  - Prevents deletion if only one ingredient
  - Validation feedback

#### StepInput (`src/components/recipes/StepInput.tsx`)
- **Type**: Client component
- **Props**: `steps: RecipeStep[], onChange: (steps: RecipeStep[]) => void`
- **Features**:
  - Add/Remove step buttons
  - Step number auto-assigned and renumbered on delete
  - Fields: stepNumber, instruction (required), notes
  - Prevents deletion if only one step
  - Validation feedback

#### RecipeMetadata (`src/components/recipes/RecipeMetadata.tsx`)
- **Type**: Server component
- **Props**: `recipe: Recipe`
- **Features**:
  - Displays servings, prep time, cook time with icons
  - Singular/plural handling for servings
  - Returns null if no metadata

### Type Definitions ✓
- **File**: `src/types/index.ts`
- **Interfaces**:
  - `Ingredient`: {quantity, unit?, name, note?}
  - `RecipeStep`: {stepNumber, instruction, notes?}
  - `Recipe`: Full recipe with all fields and relations
  - `RecipeFormData`: Form input version with string types for times

### Authorization ✓

**Permission Matrix** (`src/lib/authorization.ts`):
- `recipe:create`: ADMIN, POWER_USER
- `recipe:read`: ADMIN, POWER_USER, READ_ONLY
- `recipe:update`: ADMIN, POWER_USER (with governance check)
- `recipe:delete`: ADMIN only

**Helper Functions**:
- `canEditRecipe(userId, groupId)`: Checks if user can edit; ADMIN always can, POWER_USER respects `allowPowerUserEdit`
- `canDeleteRecipe(userId, groupId)`: Only ADMIN can delete
- `requireRecipeAccess(userId, recipeId)`: Verifies user belongs to recipe's group

## Outstanding Work for Testing

### Unit Tests Needed
- [ ] Recipe model validation
- [ ] Ingredient validation (min/max)
- [ ] Step validation (auto-numbering)
- [ ] Metadata calculations (total time, servings)

### Integration Tests Needed
- [ ] Recipe CRUD operations
- [ ] Permission enforcement (ADMIN vs POWER_USER vs READ_ONLY)
- [ ] Governance setting enforcement (`allowPowerUserEdit`)
- [ ] Group isolation (users only see group recipes)
- [ ] Pagination functionality

### Component Tests Needed
- [ ] RecipeForm submit and validation
- [ ] IngredientInput add/remove logic
- [ ] StepInput auto-numbering
- [ ] RecipeList pagination

### End-to-End Tests
- [ ] Create recipe flow
- [ ] Edit recipe flow
- [ ] Delete recipe (ADMIN only)
- [ ] Permission restrictions (READ_ONLY cannot create)
- [ ] Governance enforcement (POWER_USER edit if allowed)

## Data Model Relationships

```
User 1 --> * GroupMembership
GroupMembership * --> 1 Group
GroupMembership --> Role enum

Recipe * --> 1 User (creator)
Recipe * --> 1 Group (ownership)
Recipe --> Ingredient[] (JSON)
Recipe --> RecipeStep[] (JSON)
Recipe --> RecipeCategory[] (Phase 6)
Recipe --> RecipeTag[] (Phase 6)
```

## Future Enhancements (Post-Phase-4)

### Phase 5: Permissions & Governance
- Admin-only bulk recipe operations
- Group settings for read-only recipe access

### Phase 6: Categories, Tags, Favorites
- Category filtering and selection
- Tag management
- User favorites with per-user persistence
- Recipe search by title, category, tags, ingredients

### Phase 7: Comments
- Comment model and API
- Comment threads on recipes
- Permission enforcement for comment editing

### Phase 8: Photos & Media
- Photo upload endpoint
- Photo storage abstraction
- Image optimization and display
- Photo in recipe list and detail views

### Phase 9: UI Polish
- Kitchen-optimized recipe view (larger text, better scrolling)
- Mobile usability improvements
- Accessibility enhancements

## Testing Strategy

**Testing Pyramid**:
1. **Unit Tests** (30%): Validation functions, helpers, components in isolation
2. **Integration Tests** (50%): API endpoints with full auth/permission checks
3. **E2E Tests** (20%): Full user flows through UI

**Coverage Goals**:
- API endpoints: 90%+ coverage
- Authorization: 100% (all paths tested)
- Components: 80%+ coverage
- Type safety: Full TypeScript strict mode

## Deployment Notes
- No data migration needed (fresh Prisma migration for Recipe model)
- Backward compatible (existing users and groups unaffected)
- New API routes are isolated to `/api/recipes` path
- No breaking changes to existing auth system

## Completion Criteria Met ✓
- [x] Recipe model with ingredients and steps
- [x] Full CRUD API endpoints
- [x] Role-based permission enforcement
- [x] Governance setting integration
- [x] Recipe list view with pagination
- [x] Recipe detail view optimized for cooking
- [x] Create/edit recipe forms
- [x] Dynamic ingredient and step management
- [x] Full TypeScript type safety
- [x] Server-side validation
- [x] Client-side form validation
- [x] Group isolation

## Status Summary
**Phase 4 Implementation: 100% Complete**

All core functionality is implemented and ready for testing. The next step is to create comprehensive unit and integration tests before moving to Phase 5 (Permissions & Governance Rules refinement).
