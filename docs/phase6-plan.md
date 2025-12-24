# Phase 6: Categories, Tags, and Favorites

**Status:** In Progress
**Branch:** `feature/phase-6-categories-tags-favorites`
**Start Date:** 2025-12-23

## Overview

Phase 6 adds organization and discovery features to recipes:
- **Categories** - Group-scoped categorization (8 starter categories)
- **Tags** - Group-scoped tagging system (freeform)
- **Favorites** - User-specific recipe bookmarking
- **Search & Filtering** - Combined text search with filters

## User Decisions

- ✅ Pre-populate 8 starter categories (Breakfast, Lunch, Dinner, Desserts, Appetizers, Snacks, Drinks, Baking)
- ✅ Search bar + category/tag filter dropdowns (all work together)
- ✅ Favorites as filter toggle on recipes page (not separate page)
- ✅ Implement all at once

## Database Changes

### New Model: Favorite
```prisma
model Favorite {
  id        String   @id @default(cuid())
  userId    String
  recipeId  String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipe    Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, recipeId])
  @@index([userId])
  @@index([recipeId])
  @@map("favorites")
}
```

### Schema Updates
- Add `favorites Favorite[]` to User model
- Add `favorites Favorite[]` to Recipe model
- Existing Category, Tag, RecipeCategory, RecipeTag models already defined

## API Endpoints

### Categories
- `GET /api/categories` - List all categories for user's group
- `POST /api/categories` - Create category (ADMIN, POWER_USER)
- `GET /api/categories/[id]` - Get single category
- `PUT /api/categories/[id]` - Update category (ADMIN, POWER_USER)
- `DELETE /api/categories/[id]` - Delete category (ADMIN only)

### Tags
- `GET /api/tags` - List all tags for user's group
- `POST /api/tags` - Create tag (ADMIN, POWER_USER)
- `GET /api/tags/[id]` - Get single tag
- `PUT /api/tags/[id]` - Update tag (ADMIN, POWER_USER)
- `DELETE /api/tags/[id]` - Delete tag (ADMIN only)

### Favorites
- `GET /api/favorites` - Get user's favorite recipe IDs
- `POST /api/favorites` - Add recipe to favorites (body: `{ recipeId }`)
- `DELETE /api/favorites` - Remove from favorites (body: `{ recipeId }`)

### Recipe Filtering
Update `GET /api/recipes` to support query parameters:
- `search` - Text search in title/description
- `categoryIds` - Comma-separated category IDs
- `tagIds` - Comma-separated tag IDs
- `favoritesOnly` - Boolean flag
- `sortBy` - Sort order (recent, title, prepTime)

## Frontend Components

### New Components
- `RecipeFilters.tsx` - Search bar + category/tag dropdowns + favorites toggle
- `CategoryManager.tsx` - CRUD interface for categories (admin)
- `TagManager.tsx` - CRUD interface for tags (admin)
- `src/app/admin/categories-tags/page.tsx` - Management page

### Updated Components
- `RecipeForm.tsx` - Add category/tag selectors (checkboxes)
- `RecipeList.tsx` - Integrate filters, favorites management
- `RecipeCard.tsx` - Display categories/tags badges, favorite button
- `RecipeDetail.tsx` - Display categories/tags, favorite button

### UI Patterns
- Categories: Blue rounded-md badges
- Tags: Green rounded-full chips with # prefix
- Favorite button: Heart emoji (❤️ favorited, 🤍 not favorited)

## Utilities

### slug-utils.ts
- `generateSlug(text)` - Convert text to URL-friendly slug
- `generateUniqueSlug(name, groupId, model, excludeId?)` - Ensure slug uniqueness within group

## Permissions (Already Defined)
- `category:create` - ADMIN, POWER_USER
- `category:update` - ADMIN, POWER_USER
- `category:delete` - ADMIN
- `tag:create` - ADMIN, POWER_USER
- `tag:update` - ADMIN, POWER_USER
- `tag:delete` - ADMIN
- `favorite:create` - ALL roles
- `favorite:delete` - ALL roles

## Implementation Sequence

### Day 1: Database & Seeding
1. Update `prisma/schema.prisma` - Add Favorite model
2. Run migration: `npx prisma migrate dev --name add_favorites`
3. Create `src/lib/slug-utils.ts`
4. Update `prisma/seed.ts` - Add 8 starter categories and sample tags
5. Run seed: `npm run prisma:migrate:dev`

### Day 2: Backend APIs
1. Create Categories API (`src/app/api/categories/route.ts` + `[id]/route.ts`)
2. Create Tags API (`src/app/api/tags/route.ts` + `[id]/route.ts`)
3. Create Favorites API (`src/app/api/favorites/route.ts`)
4. Update Recipes API for filtering (`src/app/api/recipes/route.ts`)

### Day 3: Recipe Form & Types
1. Update `src/types/index.ts` - Add Favorite, update Recipe/RecipeFormData
2. Update `RecipeForm.tsx` - Add category/tag selectors
3. Test recipe creation/editing with categories/tags

### Day 4: Search & Filter UI
1. Create `RecipeFilters.tsx` component
2. Update `RecipeList.tsx` - Integrate filters
3. Add favorites state management to `RecipeList.tsx`
4. Test all filter combinations

### Day 5: Display Updates
1. Update `RecipeCard.tsx` - Display categories/tags/favorite button
2. Update `RecipeDetail.tsx` - Display categories/tags/favorite button
3. Test favorite toggle functionality

### Day 6: Admin Management
1. Create `CategoryManager.tsx`
2. Create `TagManager.tsx`
3. Create `src/app/admin/categories-tags/page.tsx`
4. Add navigation link for admins

### Day 7: Testing & Polish
1. Write unit tests for APIs
2. Write integration tests
3. Manual testing checklist
4. Dark mode verification
5. Mobile responsive check
6. Documentation updates

## Files to Create

**Backend:**
- `src/lib/slug-utils.ts`
- `src/app/api/categories/route.ts`
- `src/app/api/categories/[id]/route.ts`
- `src/app/api/tags/route.ts`
- `src/app/api/tags/[id]/route.ts`
- `src/app/api/favorites/route.ts`

**Frontend:**
- `src/components/recipes/RecipeFilters.tsx`
- `src/components/admin/CategoryManager.tsx`
- `src/components/admin/TagManager.tsx`
- `src/app/admin/categories-tags/page.tsx`

**Tests:**
- `tests/unit/api/categories.test.ts`
- `tests/unit/api/tags.test.ts`
- `tests/unit/api/favorites.test.ts`

## Files to Modify

**Database:**
- `prisma/schema.prisma` - Add Favorite model
- `prisma/seed.ts` - Add starter categories/tags

**Backend:**
- `src/app/api/recipes/route.ts` - Add filtering logic
- `src/app/api/recipes/[id]/route.ts` - Handle category/tag updates

**Frontend:**
- `src/types/index.ts` - Update Recipe, add Favorite
- `src/components/recipes/RecipeForm.tsx` - Add selectors
- `src/components/recipes/RecipeList.tsx` - Add filters
- `src/components/recipes/RecipeCard.tsx` - Display & favorite button
- `src/components/recipes/RecipeDetail.tsx` - Display & favorite button

## Testing Checklist

### Permissions
- [ ] ADMIN can create/update/delete categories
- [ ] POWER_USER can create/update categories
- [ ] POWER_USER cannot delete categories
- [ ] READ_ONLY cannot create/update/delete categories
- [ ] Same for tags

### Functionality
- [ ] Categories appear in recipe form
- [ ] Tags appear in recipe form
- [ ] Assign categories to recipe - saves correctly
- [ ] Assign tags to recipe - saves correctly
- [ ] Search by text - finds recipes
- [ ] Filter by category - shows correct recipes
- [ ] Filter by tag - works correctly
- [ ] Filter by favorites - shows only favorited
- [ ] Combined filters - all work together (AND logic)
- [ ] Clear filters button - resets all
- [ ] Categories/tags display on recipe cards
- [ ] Categories/tags display on recipe detail
- [ ] Favorite button adds/removes correctly
- [ ] Favorite state persists across page loads
- [ ] Starter categories seeded on fresh database

### UI/UX
- [ ] Dark mode works for all new components
- [ ] Mobile responsive layout
- [ ] Loading states for async operations
- [ ] Error messages display correctly
- [ ] Category badges are blue
- [ ] Tag chips are green with #
- [ ] Favorite button shows heart emoji
- [ ] Multi-select dropdowns work smoothly

## Success Criteria

- [ ] 8 starter categories seeded automatically
- [ ] Users can search recipes by text
- [ ] Users can filter by categories (multi-select)
- [ ] Users can filter by tags (multi-select)
- [ ] Users can toggle favorites filter
- [ ] All filters work together
- [ ] Categories/tags display on cards and detail pages
- [ ] Favorite button works on cards and detail pages
- [ ] ADMIN/POWER_USER can manage categories/tags
- [ ] READ_ONLY cannot manage categories/tags
- [ ] All tests pass (target: 40+ new tests)
- [ ] Dark mode works everywhere
- [ ] Mobile responsive

## Notes

- Starter categories: Breakfast, Lunch, Dinner, Desserts, Appetizers, Snacks, Drinks, Baking
- Slug generation ensures uniqueness within each group
- Categories use blue styling, tags use green styling
- Favorites are user-specific (not shared across group)
- Filtering uses AND logic (all selected filters must match)
- Permission system already in place from Phase 3
