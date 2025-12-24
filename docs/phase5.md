# Phase 5: User Management Implementation Plan

## Overview
Implement admin-only user management features: invite users, remove members, and change roles. Use **direct account creation** (admin creates user with temporary password) now, designed to support email invitations in the future.

## What Exists
- ✅ Database schema ready: User, Group, GroupMembership models
- ✅ Permission definitions: `group:invite`, `group:remove_member`, `group:change_role` (ADMIN only)
- ✅ Authorization helpers: `hasPermission()`, `requirePermission()`, `getUserRole()`
- ✅ Recipe deletion already restricted to admins

## What We're Building
1. Admin page to view and manage group members
2. API endpoints for user management (list, create, remove, change role)
3. Direct user creation with temporary password
4. Last-admin protection (can't remove/demote last admin)

---

## Implementation Steps

### 1. Backend - Helper Functions

**File: `src/lib/auth-utils.ts`**
Add temporary password generator:
```typescript
export function generateTemporaryPassword(): string {
  // 16 chars: letters, numbers, symbols
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const length = 16
  let password = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length]
  }
  return password
}
```

**File: `src/lib/authorization.ts`**
Add admin protection helpers:
```typescript
export async function countAdminsInGroup(groupId: string): Promise<number> {
  return prisma.groupMembership.count({
    where: { groupId, role: 'ADMIN' }
  })
}

export async function wouldLeaveNoAdmins(
  groupId: string,
  userId: string,
  action: 'remove' | 'demote'
): Promise<boolean> {
  const adminCount = await countAdminsInGroup(groupId)
  const membership = await prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId } }
  })

  if (membership?.role !== 'ADMIN') return false
  return adminCount <= 1
}
```

### 2. Backend - Type Definitions

**File: `src/types/index.ts`**
Add user management types:
```typescript
export interface GroupMember {
  id: string
  userId: string
  role: Role
  joinedAt: Date
  user: {
    id: string
    email: string
    name: string | null
    createdAt: Date
  }
}

export interface CreateUserRequest {
  email: string
  name?: string
  role: Role
}

export interface CreateUserResponse {
  user: UserPublic
  temporaryPassword: string
  message: string
}

export interface UpdateRoleRequest {
  role: Role
}
```

### 3. Backend - API Endpoints

**File: `src/app/api/admin/users/route.ts`**

**GET /api/admin/users** - List group members
- Check `requirePermission('group:invite')`
- Fetch GroupMembership where groupId = session.user.groupId
- Include user details, exclude password
- Return: `{ members: GroupMember[], total: number }`

**POST /api/admin/users** - Create new user (direct add)
- Check `requirePermission('group:invite')`
- Validate email format (use `validateEmail()`)
- Check email doesn't exist in database
- Validate role is valid enum (ADMIN, POWER_USER, READ_ONLY)
- Generate temp password with `generateTemporaryPassword()`
- Hash password with `hashPassword()`
- Transaction: Create User + GroupMembership
- Return user info + temporary password (one-time display)

**File: `src/app/api/admin/users/[userId]/route.ts`**

**DELETE /api/admin/users/[userId]** - Remove member
- Check `requirePermission('group:remove_member')`
- Verify user is in admin's group
- Check `wouldLeaveNoAdmins()` - reject if last admin
- Prevent admin from removing themselves
- Delete GroupMembership (keeps User record)
- Return success message

**PATCH /api/admin/users/[userId]** - Change role
- Check `requirePermission('group:change_role')`
- Verify user is in admin's group
- Validate new role
- If demoting to non-admin, check `wouldLeaveNoAdmins()`
- Update GroupMembership.role
- Return updated member info

### 4. Frontend - Admin Page

**File: `src/app/admin/page.tsx`**
Server component:
- Check `session.user.role === 'ADMIN'`, redirect if not
- Display page title and "Invite User" button
- Render MemberList component
- Link back to recipes

### 5. Frontend - Components

**File: `src/components/admin/MemberList.tsx`**
Client component:
- Fetch `/api/admin/users` on mount
- Display table: Name, Email, Role, Joined Date, Actions
- Action buttons per row:
  - Change Role button (opens dialog)
  - Remove button (opens confirmation)
- Disable actions for self and last admin
- Handle loading/error states

**File: `src/components/admin/InviteUserModal.tsx`**
Modal with form:
- Email input (required, validated)
- Name input (optional)
- Role dropdown (default: READ_ONLY)
- Submit → POST /api/admin/users
- On success: Show TempPasswordDisplay component
- Refresh member list after close

**File: `src/components/admin/TempPasswordDisplay.tsx`**
Display component:
- Show temp password in large, copyable text
- "Copy to Clipboard" button
- Warning: "Share this securely. User should change password after login."
- "Done" button to close

**File: `src/components/admin/ChangeRoleDialog.tsx`**
Confirmation dialog:
- Show current role and new role selector
- Warning if demoting admin
- Submit → PATCH /api/admin/users/[userId]
- Refresh list on success

**File: `src/components/admin/RemoveMemberDialog.tsx`**
Confirmation dialog:
- Show member name/email
- Warning about removal
- "Cancel" and "Remove" buttons
- Submit → DELETE /api/admin/users/[userId]
- Refresh list on success

### 6. Navigation Updates

**File: `src/app/dashboard/page.tsx`**
Add admin link (after line 77):
```tsx
{session.user?.role === 'ADMIN' && (
  <div className="space-y-3 rounded-lg border border-orange-300 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-900/30">
    <h2 className="text-lg font-semibold text-orange-900 dark:text-orange-300">
      Phase 5: User Management
    </h2>
    <p className="text-sm text-orange-800 dark:text-orange-400">
      Manage group members and permissions
    </p>
    <Link
      href="/admin"
      className="inline-block rounded bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
    >
      👥 Manage Users
    </Link>
  </div>
)}
```

**File: `src/app/recipes/page.tsx`**
Add admin link to header (admin users only)

### 7. Optional: Fix RecipeList Bug

**File: `src/components/recipes/RecipeList.tsx`** (line 150)
Change from:
```typescript
const canEdit = userRole === 'ADMIN' || userRole === 'POWER_USER'
```
To:
```typescript
const canEdit = await canEditRecipe(session.user.id, session.user.groupId)
```
Note: This requires making the component async or fetching governance setting from server

---

## Testing Strategy

### Unit Tests
**File: `tests/unit/api/admin-users.test.ts`**
- Test `countAdminsInGroup()`
- Test `wouldLeaveNoAdmins()` for remove and demote scenarios
- Test `generateTemporaryPassword()` format and length

### Integration Tests
**File: `tests/integration/api/admin/users.test.ts`**
- GET: Admin can list, non-admin gets 403, correct group filtering
- POST: Admin creates user, duplicate email rejected, new user can login
- DELETE: Remove member works, last admin protected, can't remove self
- PATCH: Change role works, last admin can't be demoted, role validated

### Component Tests
**File: `tests/unit/components/admin/MemberList.test.tsx`**
- Renders member list correctly
- Shows/hides action buttons based on permissions
- Disables last admin actions

### Manual Testing Checklist
- [ ] Admin can view member list
- [ ] Admin can invite user (minimal info)
- [ ] New user can login with temp password
- [ ] Admin can invite user (full info)
- [ ] Admin can change member role
- [ ] Cannot remove last admin (blocked)
- [ ] Cannot demote last admin (blocked)
- [ ] Can add second admin, then demote first
- [ ] Admin can remove READ_ONLY member
- [ ] Non-admin cannot access /admin
- [ ] Non-admin API calls return 403

---

## Files to Create

```
src/app/api/admin/users/
  ├── route.ts                     # GET list, POST create
  └── [userId]/route.ts            # DELETE remove, PATCH change role

src/app/admin/
  └── page.tsx                     # Admin dashboard

src/components/admin/
  ├── MemberList.tsx               # Main member management UI
  ├── InviteUserModal.tsx          # Invite form
  ├── TempPasswordDisplay.tsx      # Password display after creation
  ├── ChangeRoleDialog.tsx         # Role change confirmation
  └── RemoveMemberDialog.tsx       # Remove confirmation

tests/unit/api/
  └── admin-users.test.ts

tests/integration/api/admin/
  └── users.test.ts

tests/unit/components/admin/
  ├── MemberList.test.tsx
  └── InviteUserModal.test.tsx
```

## Files to Modify

```
src/types/index.ts                 # Add user management types
src/lib/auth-utils.ts              # Add generateTemporaryPassword()
src/lib/authorization.ts           # Add admin count helpers
src/app/dashboard/page.tsx         # Add admin link
src/app/recipes/page.tsx           # Add admin link
```

---

## Success Criteria

- [ ] Admin can view group members
- [ ] Admin can invite new users
- [ ] Admin can remove members (with protection)
- [ ] Admin can change roles (with protection)
- [ ] Non-admins blocked from user management
- [ ] All tests pass (target: 35+ new tests)
- [ ] Manual testing complete
- [ ] Code follows existing patterns
