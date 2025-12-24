# Phase 8: Photos & Media

## Pre-Implementation Setup

**BEFORE starting implementation:**
1. Create new branch: `git checkout -b feature/phase-8-photos`
2. Copy this plan to: `docs/phase8-plan.md` (for documentation)

## Overview

Phase 8 adds visual enhancement to recipes through photo upload and display:
- **Photo Upload** - Upload recipe photos via RecipeForm (optional field)
- **Photo Display** - Show photos in RecipeCard (list view) and RecipeDetail (detail view)
- **Storage Abstraction** - Local filesystem storage with design for easy cloud migration
- **Image Optimization** - Use next/image for automatic optimization and responsive images

## What Exists

**Database Schema:**
- ✅ Recipe model has `photoUrl?: string | null` field (line 103 of schema.prisma)
- ✅ No migration needed - field already exists

**Current Recipe Display:**
- ✅ RecipeCard component (`src/components/recipes/RecipeCard.tsx`) - list view
- ✅ RecipeDetail component (`src/components/recipes/RecipeDetail.tsx`) - detail view
- ✅ RecipeForm component (`src/components/recipes/RecipeForm.tsx`) - create/edit form

**What's Missing:**
- ❌ File upload handling (API endpoint)
- ❌ Storage abstraction layer
- ❌ Photo upload UI in RecipeForm
- ❌ Photo display in RecipeCard and RecipeDetail
- ❌ next/image configuration
- ❌ File validation (type, size)

## User Decisions

- **Storage**: Local filesystem (`public/uploads/recipes/`) with abstraction layer for future cloud migration
- **Requirement**: Optional - recipes can be created without photos
- **Validation**: 5MB max file size, jpg/png/webp formats only
- **Processing**: Store original uploads, use next/image for client-side optimization
- **Placeholder**: Show placeholder image if no photo exists

## What We're Building

### 1. Storage Abstraction Layer
- File storage service with interface for local/cloud providers
- Local filesystem implementation saving to `public/uploads/recipes/`
- Unique filename generation (timestamp + random hash)
- File cleanup on recipe deletion

### 2. Photo Upload API
- `POST /api/recipes/photos` - Upload photo, return URL
- `DELETE /api/recipes/photos` - Delete photo file
- Validation: file type, size, user authentication
- Integration with recipe create/update endpoints

### 3. RecipeForm Updates
- File input for photo upload with drag-and-drop
- Image preview before submission
- Remove/change photo functionality
- Client-side validation (file type, size)
- Handle photo URL in form data

### 4. Photo Display
- RecipeCard: Thumbnail at top of card (16:9 aspect ratio)
- RecipeDetail: Large hero image after title/description
- Placeholder image when no photo exists
- Use next/image for optimization and lazy loading

### 5. Configuration
- Next.js image configuration for local served images
- Image sizes and formats configuration
- MIME type validation

---

## Implementation Steps

### 1. Storage Abstraction Layer

**Create: `src/lib/storage.ts`**

```typescript
/**
 * Storage abstraction for file uploads
 * Supports local filesystem and future cloud providers
 */

export interface StorageProvider {
  save(file: File, path: string): Promise<string>
  delete(url: string): Promise<void>
  getPublicUrl(path: string): string
}

class LocalStorageProvider implements StorageProvider {
  private baseDir = 'public/uploads/recipes'
  private publicPath = '/uploads/recipes'

  async save(file: File, filename: string): Promise<string> {
    // Save to public/uploads/recipes/
    // Return public URL: /uploads/recipes/filename
  }

  async delete(url: string): Promise<void> {
    // Extract filename from URL
    // Delete file from filesystem
  }

  getPublicUrl(filename: string): string {
    return `${this.publicPath}/${filename}`
  }
}

// Export singleton instance
export const storage: StorageProvider = new LocalStorageProvider()

// Helper: Generate unique filename
export function generateUniqueFilename(originalName: string): string {
  const ext = originalName.split('.').pop()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}.${ext}`
}
```

### 2. Photo Upload API Endpoint

**Create: `src/app/api/recipes/photos/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { storage, generateUniqueFilename } from '@/lib/storage'
import { hasPermission } from '@/lib/authorization'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission (recipe:create or recipe:update)
    if (!hasPermission(session.user.role, 'recipe:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only jpg, png, and webp are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename and save
    const filename = generateUniqueFilename(file.name)
    const photoUrl = await storage.save(file, filename)

    return NextResponse.json({ photoUrl }, { status: 201 })
  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
```

**Create: `src/app/api/recipes/photos/[filename]/route.ts`**

```typescript
// DELETE /api/recipes/photos/[filename]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const photoUrl = `/uploads/recipes/${filename}`
    await storage.delete(photoUrl)

    return NextResponse.json({ message: 'Photo deleted' })
  } catch (error) {
    console.error('Photo delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
```

### 3. Update Recipe API to Handle Photo Deletion

**Modify: `src/app/api/recipes/[id]/route.ts`**

In DELETE handler, add photo cleanup:

```typescript
// Before deleting recipe, delete associated photo if exists
const recipe = await prisma.recipe.findUnique({
  where: { id },
  select: { photoUrl: true },
})

if (recipe?.photoUrl) {
  try {
    await storage.delete(recipe.photoUrl)
  } catch (error) {
    console.error('Failed to delete recipe photo:', error)
    // Continue with recipe deletion even if photo delete fails
  }
}

await prisma.recipe.delete({ where: { id } })
```

### 4. Update Types

**Modify: `src/types/index.ts`**

Add photoUrl to RecipeFormData:

```typescript
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
  photoUrl?: string | null  // ADD THIS
}
```

### 5. Update RecipeForm Component

**Modify: `src/components/recipes/RecipeForm.tsx`**

Add photo upload section after description field (around line 211):

```typescript
// Add state for photo
const [photoFile, setPhotoFile] = useState<File | null>(null)
const [photoPreview, setPhotoPreview] = useState<string | null>(
  recipe?.photoUrl || null
)
const [uploadingPhoto, setUploadingPhoto] = useState(false)

// Handle file selection
function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]
  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    alert('Invalid file type. Only jpg, png, and webp are allowed.')
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File too large. Maximum size is 5MB.')
    return
  }

  setPhotoFile(file)

  // Create preview
  const reader = new FileReader()
  reader.onloadend = () => {
    setPhotoPreview(reader.result as string)
  }
  reader.readAsDataURL(file)
}

// Remove photo
function handleRemovePhoto() {
  setPhotoFile(null)
  setPhotoPreview(null)
  setFormData(prev => ({ ...prev, photoUrl: null }))
}

// Upload photo before submitting recipe
async function uploadPhoto(): Promise<string | null> {
  if (!photoFile) return formData.photoUrl || null

  setUploadingPhoto(true)
  try {
    const formData = new FormData()
    formData.append('photo', photoFile)

    const res = await fetch('/api/recipes/photos', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to upload photo')
    }

    const { photoUrl } = await res.json()
    return photoUrl
  } catch (error) {
    console.error('Photo upload error:', error)
    throw error
  } finally {
    setUploadingPhoto(false)
  }
}

// Modify handleSubmit to upload photo first
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  try {
    // Upload photo if selected
    const photoUrl = await uploadPhoto()

    // Include photoUrl in recipe data
    const recipeData = {
      ...formData,
      photoUrl,
      // ... rest of data
    }

    // Submit recipe
    // ... existing submit logic
  } catch (error) {
    // ... error handling
  }
}

// JSX - Add after description field
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Recipe Photo (Optional)
  </label>

  {photoPreview ? (
    <div className="mt-2">
      <img
        src={photoPreview}
        alt="Recipe preview"
        className="h-48 w-full object-cover rounded-lg"
      />
      <button
        type="button"
        onClick={handleRemovePhoto}
        className="mt-2 text-sm text-red-600 hover:text-red-700"
      >
        Remove Photo
      </button>
    </div>
  ) : (
    <div className="mt-2">
      <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Click to upload or drag and drop
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          JPG, PNG, or WebP (max 5MB)
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoSelect}
          className="hidden"
        />
      </label>
    </div>
  )}
</div>
```

### 6. Update RecipeCard Component

**Modify: `src/components/recipes/RecipeCard.tsx`**

Add photo display at top of card (before title, around line 45):

```typescript
import Image from 'next/image'

// In JSX, add photo section at top
<Link
  href={`/recipes/${recipe.id}`}
  className="block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
>
  {/* Photo Section - ADD THIS */}
  <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
    {recipe.photoUrl ? (
      <Image
        src={recipe.photoUrl}
        alt={recipe.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    ) : (
      <div className="flex h-full items-center justify-center">
        <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )}
  </div>

  {/* Existing card content */}
  <div className="p-4">
    {/* Title, description, metadata, etc. */}
  </div>
</Link>
```

### 7. Update RecipeDetail Component

**Modify: `src/components/recipes/RecipeDetail.tsx`**

Add hero image section after title/description (around line 100):

```typescript
import Image from 'next/image'

// Add after title and description, before metadata
{recipe.photoUrl && (
  <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg md:h-96">
    <Image
      src={recipe.photoUrl}
      alt={recipe.title}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 768px"
      priority
    />
  </div>
)}
```

### 8. Configure Next.js for Images

**Modify: `next.config.ts`**

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // For future cloud storage support
      // {
      //   protocol: 'https',
      //   hostname: 'your-bucket.s3.amazonaws.com',
      // },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

### 9. Create Public Uploads Directory

```bash
mkdir -p public/uploads/recipes
```

Add `.gitkeep` to preserve directory structure:

```bash
echo "" > public/uploads/recipes/.gitkeep
```

Add to `.gitignore`:

```
# Uploaded files
public/uploads/recipes/*
!public/uploads/recipes/.gitkeep
```

---

## Implementation Sequence

### Day 1: Storage & API Foundation (4-5 hours)
- Create storage abstraction layer (`src/lib/storage.ts`)
- Implement local filesystem provider
- Create photo upload API endpoint (`POST /api/recipes/photos`)
- Create photo delete API endpoint (`DELETE /api/recipes/photos/[filename]`)
- Add photo cleanup to recipe delete handler
- Manual API testing with Postman/curl

### Day 2: Form Integration (5-6 hours)
- Update RecipeFormData type to include photoUrl
- Add photo upload UI to RecipeForm
- Implement file input with drag-and-drop
- Add image preview functionality
- Add client-side validation (type, size)
- Integrate photo upload into recipe submission flow
- Test create/edit with photos

### Day 3: Display Integration (4-5 hours)
- Configure next/image in next.config.ts
- Add photo display to RecipeCard (thumbnail)
- Add photo display to RecipeDetail (hero image)
- Add placeholder image for recipes without photos
- Test responsive image display
- Dark mode verification

### Day 4: Testing & Polish (4-5 hours)
- Create public/uploads/recipes directory structure
- Update .gitignore for uploads
- Write unit tests for storage layer
- Write API tests for photo endpoints
- Manual testing: upload, display, delete, edge cases
- UI polish and error handling
- Build and deploy verification

---

## Files to Create

```
src/lib/storage.ts                           # Storage abstraction layer
src/app/api/recipes/photos/route.ts          # Photo upload endpoint
src/app/api/recipes/photos/[filename]/route.ts  # Photo delete endpoint
public/uploads/recipes/.gitkeep              # Directory structure
tests/unit/lib/storage.test.ts               # Storage layer tests
tests/unit/api/photos.test.ts                # Photo API tests
docs/phase8-plan.md                          # This plan (copy)
```

## Files to Modify

```
src/types/index.ts                           # Add photoUrl to RecipeFormData
src/components/recipes/RecipeForm.tsx        # Add photo upload UI
src/components/recipes/RecipeCard.tsx        # Add photo thumbnail display
src/components/recipes/RecipeDetail.tsx      # Add hero image display
src/app/api/recipes/[id]/route.ts           # Add photo cleanup on delete
next.config.ts                               # Add image configuration
.gitignore                                   # Ignore uploaded files
```

---

## Success Criteria

**Photo Upload:**
- [ ] Users can upload photos when creating recipes
- [ ] Users can upload photos when editing recipes
- [ ] File type validation works (jpg, png, webp only)
- [ ] File size validation works (5MB max)
- [ ] Photos save to `public/uploads/recipes/` with unique filenames
- [ ] Photo preview shows before submission
- [ ] Users can remove/change selected photo
- [ ] Upload errors display appropriate messages

**Photo Display:**
- [ ] Photos display in RecipeCard (list view) as thumbnails
- [ ] Photos display in RecipeDetail (detail view) as hero images
- [ ] Placeholder image shows when no photo exists
- [ ] Images are responsive and properly sized
- [ ] Images use next/image optimization
- [ ] Lazy loading works for off-screen images
- [ ] Dark mode styling looks good

**Photo Management:**
- [ ] Deleting recipe also deletes associated photo file
- [ ] Updating recipe photo deletes old photo file
- [ ] Photo URLs are properly stored in database
- [ ] Photos are accessible via public URL

**Technical:**
- [ ] All tests passing (unit + API tests)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build succeeds
- [ ] Images work in development and production builds
- [ ] Storage abstraction allows easy future migration to cloud

**Optional/Nice-to-Have:**
- [ ] Drag-and-drop file upload works
- [ ] Image aspect ratio preserved in all views
- [ ] Loading states during upload
- [ ] Success feedback after upload

---

## Notes for Future Phases

**Cloud Migration (when needed):**
- Implement `CloudStorageProvider` class (S3/R2/etc.)
- Update storage.ts to use cloud provider
- Add environment variables for cloud credentials
- Update next.config.ts remote patterns
- No changes needed to components or API endpoints (abstraction layer handles this)

**Potential Enhancements:**
- Multiple photos per recipe
- Image cropping/editing tools
- Automatic image optimization (Sharp library)
- CDN integration
- Photo gallery view
