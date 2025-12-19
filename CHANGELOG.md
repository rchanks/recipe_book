# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Phase 3: Groups & Roles (Dec 18, 2025)

#### Added

- **Groups & Roles System**: Implemented multi-tenancy through groups and role-based access control (RBAC)
- **Three User Roles**:
  - `ADMIN`: Full control over group, can manage users and recipes
  - `POWER_USER` (Editor): Can create and edit recipes, create categories/tags
  - `READ_ONLY` (Viewer): Can view recipes, comment, favorite
- **Auto-Group Creation**: Each new user automatically gets a group created during signup
- **Database Models**:
  - `Role` enum with three values: ADMIN, POWER_USER, READ_ONLY
  - `Group` model with name, slug, and governance settings
  - `GroupMembership` junction table linking users to groups with roles
- **Authorization System**:
  - `hasPermission()` helper for checking role-based permissions
  - `requirePermission()` for enforcing permissions in API routes
  - `requireGroupMembership()` for multi-tenancy isolation
  - `canEditRecipe()` helper respecting group governance settings
  - `getUserRole()` and `getUserPrimaryGroup()` utilities
- **Permission Matrix**: Comprehensive permission definitions for all roles and features
- **Group Utilities**:
  - `generateGroupSlug()` for creating unique, URL-safe group identifiers
  - `generateDefaultGroupName()` for creating group names from user info
  - `isValidGroupSlug()` for validating slug format
- **NextAuth Integration**: Extended session and JWT tokens with groupId, groupSlug, and role
- **Unit Tests**:
  - Group utilities tests (slug generation, naming, validation)
  - Authorization and permission matrix tests
- **Integration Tests**:
  - Signup flow with atomic user, group, and membership creation
  - Group isolation tests
  - Role assignment verification
  - Default settings validation
- **Database Migration**: `20251219015037_add_groups_and_roles` with backward compatibility for existing users

#### Changed

- **Signup Flow**: Now creates user, group, and membership atomically in a Prisma transaction
- **User Model**: Added `memberships` relation to GroupMembership for joining queries
- **Auth Configuration**: Updated JWT and session callbacks to include group/role information
- **Middleware**: Enhanced to support role-based route protection for admin-only pages
- **Dashboard**: Updated to display group information and user role with human-readable labels

#### Security

- **Server-Side Authorization**: All permission checks enforced server-side, never trust client
- **Multi-Tenancy**: GroupId filtering ensures users can only access their group's data
- **Role Enforcement**: All API routes must verify permissions before operations
- **Governance Control**: Group admins can control whether power users can directly edit recipes

#### Infrastructure

- Backward compatibility migration for existing users (each gets default group with ADMIN role)
- Database indexes on `groupId` and `userId` for performance
- Unique constraint on `(userId, groupId)` to prevent duplicate memberships
- Foreign key cascading deletes for data integrity

---

## [0.2.0] - Phase 2: User Authentication & Dashboard (Dec 18, 2025)

### Added

- NextAuth.js integration with credentials provider
- User registration (signup) with email validation and password hashing
- User login with password verification
- JWT-based session management
- Session duration: 30 days
- SessionProvider component for client-side session access
- Protected dashboard route accessible only to authenticated users
- Logout functionality
- Custom login and signup pages
- Authentication middleware for route protection
- Auth utilities for password hashing and validation
- User database model in PostgreSQL
- Initial database migration for users table
- Unit tests for auth components (LoginForm, SignupForm, LogoutButton)
- Integration tests for signup and login API endpoints
- Error handling for authentication failures

### Changed

- Home page now redirects authenticated users to dashboard
- Updated layout to include theme provider and session provider

### Security

- Passwords hashed with bcrypt (10 salt rounds)
- Email validation before account creation
- Password strength requirements (min 8 characters, numbers, uppercase, special chars)
- Duplicate account prevention (email uniqueness enforced)

---

## [0.1.0] - Phase 1: Foundation (Dec 18, 2025)

### Added

- Next.js 14 project setup with TypeScript
- PostgreSQL database with Prisma ORM
- Tailwind CSS for styling
- Dark/light mode theme toggle with Next.js cookies
- Vitest for unit testing
- React Testing Library for component testing
- Jest setup and configuration
- Development environment with PostgreSQL container
- Initial database connection testing with SystemHealth model
- Comprehensive README documentation
- Project roadmap with three-phase architecture
- Development phases documentation
- MVP requirements documentation
- ESLint configuration for code quality
- .env.example for configuration reference

### Infrastructure

- PostgreSQL database at `localhost:5432`
- Prisma client generation on build
- Database migrations system setup
- Development server on port 3000

