# Family Recipes App — Requirements Specification (MVP)

## 1. Purpose & Vision

The purpose of this application is to provide a **private, group-based digital recipe repository** designed primarily for families (or small trusted groups) to store, view, and share recipes they enjoy.

The app prioritizes:
- Mobile-first use in the kitchen
- Shared ownership within a group
- Long-term maintainability and data ownership
- Clean, readable UI with minimal friction while cooking

The app is initially built for personal family use, with the possibility of later offering it to other families or private groups.

---

## 2. Core Concepts

### 2.1 Groups (Workspaces)
- Each user belongs to a **group** (workspace).
- On initial signup, a new group is automatically created.
- The signup user becomes the **Admin/Owner** of that group.
- Recipes, categories, tags, and users are **scoped to a group**.
- Recipes are **private to the group by default**.

(MVP assumes one group per user; multi-group membership is out of scope.)

---

## 3. User Roles & Permissions

### 3.1 Roles

#### Admin
- Full control over the group
- Can invite/remove users
- Can promote/demote user roles
- Can add, edit, and delete recipes
- Can configure group-level permissions
- Can create/edit categories and tags

#### Power User (Editor)
- Can add new recipes
- Can edit recipe content:
  - Title
  - Ingredients
  - Instructions
  - Notes
  - Family story
  - Photo
- Can create/edit tags and categories
- Cannot delete recipes
- Cannot manage users or roles

#### Read-only User
- Can view recipes
- Can favorite/unfavorite recipes
- Can add comments
- Can edit/delete their own comments
- Cannot edit recipes
- Cannot manage users, tags, or categories

### 3.2 Governance Rules
- Only Admins can delete recipes
- Group-level setting determines whether Power Users can directly edit recipes or are restricted to comments only
- All authorization is enforced **server-side**

---

## 4. Recipe Model

### 4.1 Required Fields
- Title
- Ingredients (structured)
- Instructions (step-based preferred)

### 4.2 Optional Fields
- Description / short blurb
- Servings
- Prep time
- Cook time
- Notes (tips, substitutions)
- Family story / lore
- Main photo
- Tags
- Categories

### 4.3 Ingredients (Structured)
Each ingredient consists of:
- Quantity (numeric or freeform)
- Unit (optional)
- Ingredient name
- Optional note (e.g., "finely chopped")

Ingredients must be structured to support **searching/filtering by ingredient**.

---

## 5. Navigation & Discovery

### 5.1 Recipe Listing
- Displays recipe **title + main photo thumbnail**
- Supports scrolling lists and/or grid views
- Optimized for mobile

### 5.2 Search & Filtering
Users can search/filter recipes by:
- Title
- Categories
- Tags
- Ingredients

### 5.3 Favorites
- Favorites are **per-user**, not shared
- Users can add/remove favorites
- Favorites affect only that user's view

---

## 6. Comments

- Comments are attached to recipes
- Visible on the recipe detail page
- Allowed for Admins, Power Users, and Read-only users
- Users can edit or delete **their own comments only**

---

## 7. Photos & Media

- Each recipe can have one **main photo**
- Photo upload sources:
  - Device upload
  - Camera roll
- Photos are optional
- Storage mechanism must be compatible with local dev and cloud deployment

---

## 8. Authentication

- Email + password authentication
- One user signs up → new group created
- Admin invites additional users by email
- During development, multiple test users must be supported

---

## 9. Privacy & Sharing

- Recipes are private to the group by default
- No public discovery or marketplace in MVP
- Optional future read-only sharing is out of scope

---

## 10. AI-Assisted Import (Nice-to-Have)

### 10.1 Import from Recipe URL
- Paste a URL → AI attempts to extract recipe content
- Imported recipes must be created as **Drafts**
- Human review and approval required before publishing
- Import accuracy expectation: ~80% correct, easy to edit

### 10.2 Not Required for MVP
- Image OCR import
- PDF/Word import
- Multiple external recipe formats

---

## 11. Explicitly Out of Scope (MVP)

- Meal planning or calendars
- Shopping lists
- Nutrition or calorie calculations
- Recipe scaling
- Public recipe marketplace
- Complex version history

---

## 12. UI & UX Requirements

- Mobile-first design
- Clean, sharp, readable typography
- Minimal navigation while cooking
- Recipe view optimized for scrolling
- Light and dark mode
- High contrast and accessibility-friendly

---

## 13. Technical Constraints

- Must run locally during development
- Must be deployable to cloud hosting
- Code and data should be owned by the developer
- Incremental, testable development
- Automated tests required for core logic and permissions

---
