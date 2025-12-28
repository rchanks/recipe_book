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

// Phase 10: Recipe Status
export enum RecipeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface Group {
  id: string
  name: string
  slug: string
  recipeBookTitle?: string | null
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

// Phase 4: Recipe types
export interface Ingredient {
  quantity: string
  unit?: string | null
  name: string
  note?: string | null
}

export interface RecipeStep {
  stepNumber: number
  instruction: string
  notes?: string | null
}

export interface Recipe {
  id: string
  title: string
  description?: string | null
  ingredients: Ingredient[]
  steps: RecipeStep[]
  servings?: number | null
  prepTime?: number | null
  cookTime?: number | null
  notes?: string | null
  familyStory?: string | null
  photoUrl?: string | null
  status: RecipeStatus // Phase 10: Recipe status (DRAFT or PUBLISHED)
  sourceUrl?: string | null // Phase 10: URL where recipe was imported from
  createdBy: string
  creator: UserPublic
  groupId: string
  categories: Array<{
    id: string
    categoryId: string
    category: Category
  }>
  tags: Array<{
    id: string
    tagId: string
    tag: Tag
  }>
  favorites: Favorite[]
  createdAt: Date
  updatedAt: Date
}

export interface RecipeFormData {
  title: string
  description: string
  ingredients: Ingredient[]
  steps: RecipeStep[]
  servings: string
  prepTime: string
  cookTime: string
  notes: string
  familyStory: string
  categoryIds: string[]
  tagIds: string[]
  photoUrl?: string | null
  status?: RecipeStatus // Phase 10: Optional for forms
}

// Phase 6: Category and Tag types (prepare for future)
export interface Category {
  id: string
  name: string
  slug: string
  groupId: string
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  name: string
  slug: string
  groupId: string
  createdAt: Date
  updatedAt: Date
}

// Phase 6: Favorite type
export interface Favorite {
  id: string
  userId: string
  recipeId: string
  createdAt: Date
}

// Phase 5: User Management types
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

export interface GroupMembersResponse {
  members: GroupMember[]
  total: number
}

// Phase 7: Comment types
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

export interface UpdateGroupRequest {
  name?: string
  recipeBookTitle?: string | null
  allowPowerUserEdit?: boolean
}
