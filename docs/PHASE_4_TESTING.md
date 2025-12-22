# Phase 4 Testing Guide

## Setup Complete ✓

**Dev Server**: Running on `http://localhost:3002`

**Database**: Seeded with test data

### Test Credentials

**ADMIN USER**
- Email: `admin@example.com`
- Password: `Admin123!`
- Role: ADMIN
- Permissions: Can create, read, update, delete recipes

**EDITOR USER**
- Email: `editor@example.com`
- Password: `Editor123!`
- Role: POWER_USER
- Permissions: Can create, read, update recipes (respects governance settings)

**VIEWER USER**
- Email: `viewer@example.com`
- Password: `Viewer123!`
- Role: READ_ONLY
- Permissions: Can only read recipes

**Group**: Smith Family's Recipes (`smith-family`)
- Setting: `allowPowerUserEdit = true` (editors can edit recipes)

### Sample Recipes Already Created

1. **Grandma's Chocolate Chip Cookies** (created by ADMIN)
   - 10 ingredients, 9 steps
   - Servings: 48, Prep: 15min, Cook: 11min
   - Includes family story

2. **Simple Spaghetti Bolognese** (created by EDITOR)
   - 8 ingredients, 8 steps
   - Servings: 4, Prep: 10min, Cook: 30min

3. **Homemade Margherita Pizza** (created by ADMIN)
   - 9 ingredients, 10 steps
   - Servings: 2, Prep: 20min, Cook: 15min
   - Includes family story

---

## Manual Testing Scenarios

### Scenario 1: View Recipe List (All Roles)

**Steps:**
1. Navigate to `http://localhost:3002`
2. Log in with **ADMIN** user (admin@example.com / Admin123!)
3. Click "Dashboard" or navigate to `/recipes`

**Expected Results:**
- [ ] Recipe list displays all 3 recipes
- [ ] "Add Recipe" button is visible
- [ ] Each recipe card shows:
  - Title
  - Description (truncated at ~100 chars)
  - Metadata: servings, prep time, cook time (if available)
  - Creator name and date
  - Edit/Delete buttons

**Pagination Test:**
- [ ] Navigate to second page (if recipes > 20 per page)
- [ ] Verify "Previous" button disabled on page 1
- [ ] Verify pagination controls work correctly

**Test with Other Roles:**
- [ ] Log out and log in as EDITOR
  - Should see "Add Recipe" button
- [ ] Log out and log in as VIEWER
  - Should NOT see "Add Recipe" button

---

### Scenario 2: View Recipe Detail

**Steps:**
1. Logged in as ADMIN
2. Click on any recipe card to view details

**Expected Results:**
- [ ] Full recipe displays with:
  - Title prominently displayed
  - Description
  - Metadata block: servings, prep/cook times with icons
  - Ingredients list with:
    - Quantity, unit (if applicable), name, optional note
    - Checkbox styling for cooking use
  - Numbered steps with:
    - Step number
    - Instruction
    - Notes (if any)
  - General notes section (if present)
  - Family story section (if present)
- [ ] Edit button visible (for ADMIN)
- [ ] Delete button visible (for ADMIN)

**Test with Different Recipes:**
- [ ] Recipe 1: Full details with family story
- [ ] Recipe 2: Minimal fields (no family story, no notes)
- [ ] Recipe 3: Medium complexity

**Test with Other Roles:**
- [ ] Log in as EDITOR
  - Should see Edit button
  - Should see Delete button (based on governance)
- [ ] Log in as VIEWER
  - Should NOT see Edit or Delete buttons

---

### Scenario 3: Create New Recipe

**Steps:**
1. Logged in as ADMIN
2. Navigate to `/recipes`
3. Click "Add Recipe" button
4. Fill in form:
   - **Title**: "Test Pasta Carbonara"
   - **Description**: "Classic Italian carbonara with eggs and bacon"
   - **Ingredients**:
     - 1 lb spaghetti
     - 4 oz guanciale, diced
     - 4 large eggs
     - 2 oz Pecorino Romano, grated
   - **Steps**:
     - Cook pasta in salted water until al dente
     - While pasta cooks, fry guanciale until crispy
     - Mix eggs and cheese in a bowl
     - Combine pasta with guanciale
   - **Servings**: 4
   - **Prep Time**: 10 minutes
   - **Cook Time**: 20 minutes

**Expected Results:**
- [ ] Form validates on submit:
  - Title is required and < 200 chars
  - Description is required
  - At least 1 ingredient (with name required)
  - At least 1 step (with instruction required)
- [ ] Recipe created successfully
- [ ] Redirects to recipe detail page
- [ ] New recipe appears in list

**Test Form Validation:**
- [ ] Try to submit with empty title → should error
- [ ] Try to submit with no ingredients → should error
- [ ] Try to submit with no steps → should error
- [ ] Try to remove last ingredient → should prevent or error
- [ ] Try to remove last step → should prevent or error

**Test with EDITOR:**
- [ ] Log in as EDITOR
- [ ] Should see "Add Recipe" button
- [ ] Create a recipe
- [ ] Should be able to create and see it

**Test with VIEWER:**
- [ ] Log in as VIEWER
- [ ] Should NOT see "Add Recipe" button
- [ ] Trying to access `/recipes/new` directly should redirect or show 403

---

### Scenario 4: Edit Recipe

**Steps:**
1. Logged in as ADMIN
2. Navigate to a recipe detail page
3. Click "Edit" button
4. Modify:
   - Change title to "Updated: Grandma's Cookies"
   - Add an ingredient note: "or semi-sweet chips"
   - Modify step text
5. Submit form

**Expected Results:**
- [ ] Form pre-populated with existing recipe data
- [ ] Changes saved successfully
- [ ] Redirected to detail page
- [ ] Updated information displays
- [ ] `updatedAt` timestamp changes (if visible in UI or API)

**Test with EDITOR and Governance:**
- [ ] Log in as EDITOR
- [ ] Edit a recipe they created → should work
- [ ] Edit a recipe created by ADMIN → should work (allowPowerUserEdit = true)
- [ ] Try to add/remove ingredients and steps → should work

**Test Governance Setting:**
- [ ] This test requires changing `allowPowerUserEdit` to false
- [ ] When false, EDITOR should not be able to edit recipes (but can create)
- [ ] ADMIN should always be able to edit

---

### Scenario 5: Delete Recipe

**Steps:**
1. Logged in as ADMIN
2. Navigate to recipe detail
3. Click "Delete" button
4. Confirm deletion

**Expected Results:**
- [ ] Delete confirmation dialog appears
- [ ] Recipe is removed from database
- [ ] Redirected to recipe list
- [ ] Recipe no longer appears in list
- [ ] Recipe no longer accessible at `/recipes/[id]` (404)

**Test Permission Enforcement:**
- [ ] Log in as EDITOR
  - Should NOT see Delete button
  - If they try to hit DELETE endpoint directly, should get 403
- [ ] Log in as VIEWER
  - Should NOT see Delete button
  - API should return 403 if attempted

---

### Scenario 6: Permission Matrix Testing

#### CREATE Permission (recipe:create)

**Allowed Roles**: ADMIN, POWER_USER
**Denied Roles**: READ_ONLY

**Steps:**
1. Test with ADMIN:
   - [ ] Navigate to `/recipes/new`
   - [ ] Should load form
   - [ ] Should be able to create

2. Test with EDITOR:
   - [ ] Navigate to `/recipes/new`
   - [ ] Should load form
   - [ ] Should be able to create

3. Test with VIEWER:
   - [ ] Navigate to `/recipes/new`
   - [ ] Should redirect to login or show 403
   - [ ] Trying to POST to API should return 403

#### READ Permission (recipe:read)

**Allowed Roles**: All (ADMIN, POWER_USER, READ_ONLY)

**Steps:**
- [ ] All roles can view `/recipes`
- [ ] All roles can view individual recipe details
- [ ] All roles can see recipe lists in API

#### UPDATE Permission (recipe:update)

**Allowed Roles**: ADMIN, POWER_USER (respects governance)
**Denied Roles**: READ_ONLY

**Governance Rule**:
- ADMIN: Always allowed
- POWER_USER: Only if `group.allowPowerUserEdit = true`

**Steps:**
1. Test with ADMIN:
   - [ ] Should see Edit button
   - [ ] Should be able to edit any recipe

2. Test with EDITOR (allowPowerUserEdit = true):
   - [ ] Should see Edit button
   - [ ] Should be able to edit any recipe

3. Test with VIEWER:
   - [ ] Should NOT see Edit button
   - [ ] API should return 403

**Governance Setting Test**:
- Will require database manipulation or admin settings page
- When `allowPowerUserEdit = false`:
  - [ ] EDITOR cannot see Edit button
  - [ ] EDITOR cannot PUT to edit endpoint (403)
  - [ ] ADMIN can still edit

#### DELETE Permission (recipe:delete)

**Allowed Roles**: ADMIN only
**Denied Roles**: POWER_USER, READ_ONLY

**Steps:**
1. Test with ADMIN:
   - [ ] Should see Delete button
   - [ ] Should be able to delete

2. Test with EDITOR:
   - [ ] Should NOT see Delete button
   - [ ] DELETE API call should return 403

3. Test with VIEWER:
   - [ ] Should NOT see Delete button
   - [ ] DELETE API call should return 403

---

### Scenario 7: Group Isolation

**Objective**: Verify users only see recipes in their group

**Current Setup**:
- All test users are in "Smith Family's Recipes" group
- All sample recipes are in that group

**To Test Group Isolation**:
1. Create a second group with different users
2. Create recipes in the second group
3. Verify:
   - [ ] ADMIN from Group 1 cannot see Group 2 recipes
   - [ ] Users from Group 2 cannot edit/delete Group 1 recipes
   - [ ] Recipe IDs from different groups don't conflict

**Note**: Full group isolation test requires creating additional test data or modifying the database

---

### Scenario 8: Form Validation

#### Server-Side Validation

**Title Field**:
- [ ] Empty title → 400 error
- [ ] Title > 200 chars → 400 error
- [ ] Valid title accepted

**Description Field**:
- [ ] Empty description → 400 error
- [ ] Long description accepted

**Ingredients Array**:
- [ ] Empty ingredients array → 400 error
- [ ] Ingredient with empty name → 400 error
- [ ] Ingredient with quantity and unit optional → accepted
- [ ] Valid ingredients accepted

**Steps Array**:
- [ ] Empty steps array → 400 error
- [ ] Step with empty instruction → 400 error
- [ ] Valid steps accepted
- [ ] Steps renumbered correctly on save

**Numeric Fields**:
- [ ] Servings = 0 → 400 error (must be positive)
- [ ] Servings = -5 → 400 error
- [ ] Servings = 0.5 → accepted or 400 based on schema
- [ ] PrepTime = -10 → 400 error (must be non-negative)
- [ ] CookTime = 0 → accepted (valid: 0 minute prep/cook)

#### Client-Side Validation

**Steps:**
1. Open recipe form
2. Try to submit empty form
   - [ ] Should show validation errors
   - [ ] Should NOT submit to server

3. Remove all ingredients
   - [ ] Should show error or prevent submission
   - [ ] Should NOT submit to server

4. Try to enter negative numbers
   - [ ] Should prevent or show error

---

## API Testing (curl/Postman)

### Test Recipe List Endpoint

```bash
# Get all recipes (first page)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/recipes

# Get with pagination
curl -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/recipes?page=1&limit=10
```

**Expected**:
- Returns array of recipes with pagination info
- Only recipes from user's group

### Test Create Recipe

```bash
curl -X POST http://localhost:3002/api/recipes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Recipe",
    "description": "Test description",
    "ingredients": [
      {"name": "ingredient 1", "quantity": "1", "unit": "cup"}
    ],
    "steps": [
      {"instruction": "Do something"}
    ]
  }'
```

### Test Get Recipe Detail

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/recipes/[recipe-id]
```

### Test Update Recipe

```bash
curl -X PUT http://localhost:3002/api/recipes/[recipe-id] \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...updated recipe data...}'
```

### Test Delete Recipe

```bash
curl -X DELETE http://localhost:3002/api/recipes/[recipe-id] \
  -H "Authorization: Bearer <token>"
```

---

## Checklist

- [ ] All recipe list tests pass
- [ ] All recipe detail tests pass
- [ ] Recipe creation tests pass (all roles tested)
- [ ] Recipe edit tests pass (permission enforcement verified)
- [ ] Recipe delete tests pass (ADMIN-only verified)
- [ ] Form validation tests pass (both server and client)
- [ ] Permission matrix tests pass (all roles and permissions)
- [ ] Group isolation verified
- [ ] Pagination works correctly
- [ ] Component rendering correct across different recipe types

---

## Known Issues / Notes

- Middleware deprecation warning for "middleware" file convention (Next.js suggestion to use "proxy" instead)
- Port 3000 already in use, dev server running on port 3002

---

## Next Steps After Testing

1. Fix any bugs discovered during testing
2. Add unit and integration tests
3. Create test documentation with screenshots
4. Move to Phase 5: Permissions & Governance Rules refinement

