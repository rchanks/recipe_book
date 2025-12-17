# Family Recipes App — Development Phases (MVP)

This document defines **incremental development phases**.
Each phase builds only on previously completed foundations and results in a **testable deliverable**.

Claude (or a human developer) must **complete, test, and review each phase before proceeding**.

---

## Phase 1 — Foundation & Project Setup

### Goals
- Establish a stable technical foundation
- Enable local development and testing
- No business logic yet

### Scope
- Repository scaffolding
- TypeScript configuration
- Frontend framework setup
- Tailwind CSS with light/dark mode
- Database connection (local)
- ORM schema initialized (empty or minimal)
- Test runner configured

### Deliverables
- App runs locally
- Light/dark mode toggle visible
- Example test passes
- Clear README with setup instructions

---

## Phase 2 — Authentication & Identity

### Goals
- Establish user identity
- Enable login/logout
- Prepare for group ownership

### Scope
- Email/password authentication
- User model in database
- Signup flow
- Login/logout flow
- Session handling

### Deliverables
- User can sign up and log in
- Tests for auth flows
- Protected route example

---

## Phase 3 — Groups & Roles (Authorization Foundation)

### Goals
- Introduce groups and ownership
- Establish role-based access control

### Scope
- Group model
- Role enum (Admin, Power, Read-only)
- Auto-create group on signup
- Assign Admin role to creator
- Authorization middleware/helpers

### Deliverables
- User belongs to a group
- Role is enforced server-side
- Tests verifying role restrictions

---

## Phase 4 — Recipe Core (CRUD Without Extras)

### Goals
- Implement the heart of the app: recipes
- No photos, tags, or search yet

### Scope
- Recipe model
- Structured ingredients model
- Instructions/steps
- Recipe list view
- Recipe detail view (cooking-friendly)
- Create/edit recipes (Admin + Power)

### Deliverables
- Recipes can be created, edited, viewed
- Role-based restrictions enforced
- Tests for recipe CRUD and permissions

---

## Phase 5 — Permissions & Governance Rules

### Goals
- Enforce admin-only actions
- Add group-level governance

### Scope
- Admin-only delete recipe
- Admin-only user management
- Group setting: allow editors to edit vs comment-only
- Enforcement of governance setting

### Deliverables
- Governance rules work as expected
- Tests for admin vs non-admin actions

---

## Phase 6 — Categories, Tags, and Favorites

### Goals
- Enable organization and personalization

### Scope
- Categories (starter list + custom)
- Tags (freeform)
- Per-user favorites
- Filter/search by title, category, tags, ingredients

### Deliverables
- Recipes can be organized and searched
- Favorites are user-specific
- Tests for search and favorites

---

## Phase 7 — Comments

### Goals
- Enable lightweight collaboration

### Scope
- Comment model
- Add/edit/delete own comments
- Comment display on recipe detail
- Permission enforcement

### Deliverables
- Comments function correctly
- Ownership rules enforced
- Tests for comment permissions

---

## Phase 8 — Photos & Media

### Goals
- Visual enhancement of recipes

### Scope
- Upload main recipe photo
- Display photo in list and detail views
- Storage abstraction suitable for local + cloud

### Deliverables
- Photos upload and display correctly
- Tests for upload permissions

---

## Phase 9 — UI Polish & Cooking Experience

### Goals
- Improve readability and usability in kitchen context

### Scope
- Typography refinement
- Spacing and layout polish
- Recipe view optimized for scrolling
- Mobile usability checks
- Accessibility improvements

### Deliverables
- Clear, readable cooking view
- Verified mobile usability

---

## Phase 10 — Nice-to-Have: AI URL Import (Optional)

### Goals
- Accelerate recipe entry without compromising quality

### Scope
- Paste recipe URL
- Extract recipe using AI
- Create Draft recipe
- Manual review/edit before publish

### Deliverables
- Draft import works
- No auto-publishing
- Manual edit flow verified

---

## Phase 11 — Hardening & Deployment Prep

### Goals
- Prepare for real usage and cloud deployment

### Scope
- Error handling
- Logging
- Environment configuration
- Database migrations
- Deployment instructions

### Deliverables
- App deploys cleanly
- Tests pass in production-like environment

---
