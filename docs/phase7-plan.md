# Phase 7: Comments System + Group Settings Management

## Pre-Implementation Setup

**BEFORE starting implementation:**
1. Create new branch: `git checkout -b feature/phase-7-comments-settings` ✅
2. Copy this plan to: `docs/phase7-plan.md` (for documentation) ✅

## Overview

Phase 7 adds collaboration features and fills critical gaps:
- **Comments System** - Basic text comments on recipes (all roles can comment)
- **Group Settings Management** - Admin UI for group configuration (missing from Phase 5)

## What Exists

**Permissions Already Defined (src/lib/permissions.ts):**
- ✅ `comment:create` - All roles (ADMIN, POWER_USER, READ_ONLY)
- ✅ `comment:update_own` - All roles
- ✅ `comment:update_any` - ADMIN only
- ✅ `comment:delete_own` - All roles
- ✅ `comment:delete_any` - ADMIN only
- ✅ `group:update` - ADMIN only

**Database Schema:**
- ✅ Group model has `allowPowerUserEdit` field (line 51 of schema.prisma)
- ❌ NO Comment model exists yet
- ❌ NO admin UI to change group settings

**User Decisions:**
- Basic text-only comments (no markdown, no reactions, no nested replies)
- Comments display on recipe detail page only
- Admins can delete any comment (standard permissions, no pinning/flagging)
- Group settings includes: name editing + allowPowerUserEdit toggle

## What We're Building

### Comments System
1. Comment model with cascade deletion
2. Comment CRUD API endpoints
3. Comment display components (list, form, item)
4. Integration into recipe detail page
5. Permission enforcement (ownership + admin override)

### Group Settings
6. Group settings update API
7. Group settings admin page
8. Toggle for allowPowerUserEdit
9. Group name editing

---

## Implementation Steps

### 1. Database Schema - Add Comment Model

**File: `prisma/schema.prisma`**

Add after Favorite model (around line 191):

```prisma
// Phase 7: Comment model for recipe comments
model Comment {
  id        String   @id @default(cuid())
  text      String   @db.Text
  recipeId  String
  userId    String
  recipe    Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([recipeId])
  @@index([userId])
  @@map("comments")
}
```

**Update User model (around line 26):** Add relation:
```prisma
comments    Comment[]         // Phase 7: User comments
```

**Update Recipe model (around line 78):** Add relation:
```prisma
comments    Comment[]         // Phase 7: Recipe comments
```

**Run migration:**
```bash
npx prisma migrate dev --name add_comments_system
```

---

### 2. Type Definitions

**File: `src/types/index.ts`**

Add Comment types:

```typescript
// Phase 7: Comment type
export interface Comment {
  id: string
  text: string
  recipeId: string
  userId: string
  user: {
    id: string
    name: string | null
    email: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreateCommentRequest {
  recipeId: string
  text: string
}

export interface UpdateCommentRequest {
  text: string
}

export interface CommentsResponse {
  comments: Comment[]
  total: number
  page: number
  totalPages: number
}
```

Add Group update request:

```typescript
export interface UpdateGroupRequest {
  name?: string
  allowPowerUserEdit?: boolean
}
```

---

### 3. Authorization Helpers

**File: `src/lib/authorization.ts`**

Add comment authorization helpers. See plan file for implementation.

---

### 4-9. Implementation Steps

See full plan file in `docs/phase7-plan.md` for complete implementation details.

---

## Implementation Sequence

### Day 1: Database & Backend Foundation (4-6 hours)
- Update Prisma schema with Comment model
- Run migration
- Update TypeScript types
- Create comment authorization helpers
- Write helper function tests

### Day 2: Comments API - Create & List (5-7 hours)
- Create `POST /api/comments` endpoint
- Create `GET /api/recipes/[id]/comments` endpoint
- Write API unit tests
- Manual API testing

### Day 3: Comments API - Update & Delete (4-5 hours)
- Create `PUT /api/comments/[id]` endpoint
- Create `DELETE /api/comments/[id]` endpoint
- Add ownership validation
- Write API tests for update/delete

### Day 4: Comment Frontend Components (6-8 hours)
- Create CommentForm component
- Create CommentItem component
- Create CommentList component
- Create CommentsSection wrapper
- Write component tests

### Day 5: Integrate Comments into Recipe Page (3-4 hours)
- Update recipe detail page
- Add CommentsSection component
- Test full integration
- Handle loading/error states

### Day 6: Group Settings Backend (4-5 hours)
- Add PUT handler to `/api/groups/[id]`
- Implement name and allowPowerUserEdit update
- Add validation (name length, slug uniqueness)
- Write API tests

### Day 7: Group Settings Frontend (5-6 hours)
- Create ToggleSwitch component
- Create GroupSettingsForm component
- Create group settings admin page
- Add navigation link
- Write component tests

### Day 8: Testing & Polish (4-6 hours)
- Run full test suite
- Fix failing tests
- Manual testing as all roles
- UI/UX polish
- Dark mode verification
- Responsive design check

---

## Files to Create

```
src/components/comments/CommentForm.tsx
src/components/comments/CommentItem.tsx
src/components/comments/CommentList.tsx
src/components/comments/CommentsSection.tsx
src/components/ui/ToggleSwitch.tsx
src/components/admin/GroupSettingsForm.tsx
src/app/api/comments/route.ts
src/app/api/comments/[id]/route.ts
src/app/api/recipes/[id]/comments/route.ts
src/app/admin/settings/page.tsx
tests/unit/api/comments.test.ts
tests/unit/api/group-settings.test.ts
tests/unit/lib/comment-authorization.test.ts
tests/unit/components/CommentForm.test.tsx
tests/unit/components/CommentItem.test.tsx
tests/unit/components/GroupSettingsForm.test.tsx
```

## Files to Modify

```
prisma/schema.prisma                     # Add Comment model
src/types/index.ts                       # Add Comment and UpdateGroupRequest types
src/lib/authorization.ts                 # Add comment authorization helpers
src/app/recipes/[id]/page.tsx            # Add CommentsSection
src/app/api/groups/[id]/route.ts         # Add PUT handler
src/app/admin/page.tsx                   # Add settings link
```

---

## Success Criteria

**Comments:**
- [ ] All users (ADMIN, POWER_USER, READ_ONLY) can create comments
- [ ] Comments display on recipe detail page
- [ ] Users can edit their own comments
- [ ] Users can delete their own comments
- [ ] Admins can delete any comment
- [ ] Comments show author name and timestamp
- [ ] Character counter shows (max 2000 chars)
- [ ] Comments cascade delete when recipe/user deleted

**Group Settings:**
- [ ] Admin can access group settings page
- [ ] Admin can edit group name
- [ ] Admin can toggle allowPowerUserEdit setting
- [ ] Changes persist to database
- [ ] Success/error messages display appropriately
- [ ] Non-admins cannot access settings page

**Technical:**
- [ ] All tests passing (target: 50+ new tests)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Dark mode works everywhere
- [ ] Mobile responsive
- [ ] Build succeeds

---

## Full Implementation Details

For complete implementation code and detailed instructions, refer to the main plan file at:
`C:\Users\richardh\.claude\plans\purrfect-gathering-bengio.md`

This file contains:
- Complete API endpoint code
- Full component implementations
- Authorization helpers code
- Test case specifications
- Page integration examples
