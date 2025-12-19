/**
 * Shared TypeScript types and interfaces
 */

// User types
export interface User {
  id: string
  email: string
  name?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserPublic {
  id: string
  email: string
  name?: string | null
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  name?: string
}

export interface AuthError {
  error: string
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface SignupResponse {
  user: UserPublic
  message: string
}

// Phase 3: Groups & Roles
export enum Role {
  ADMIN = 'ADMIN',
  POWER_USER = 'POWER_USER',
  READ_ONLY = 'READ_ONLY',
}

export interface Group {
  id: string
  name: string
  slug: string
  allowPowerUserEdit: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GroupMembership {
  id: string
  role: Role
  joinedAt: Date
  userId: string
  groupId: string
}

export interface UserWithGroup extends User {
  groupId: string
  groupSlug: string
  role: Role
}
