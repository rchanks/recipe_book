# Phase 8: Photos & Media - Manual Testing Guide

## Test Environment Setup
- Browser: Modern browser (Chrome/Firefox/Safari/Edge)
- OS: Windows/Mac/Linux
- Network: Online with file system access
- Database: PostgreSQL with test data

## Test Categories

### 1. Photo Upload Testing

#### 1.1 Basic Upload
- [ ] Navigate to "Create Recipe" page
- [ ] Fill in required fields (title, ingredients, steps)
- [ ] In "Recipe Photo" section, click upload area
- [ ] Select a valid JPG file from filesystem
- [ ] Verify image preview appears before submission
- [ ] Submit form
- [ ] Verify recipe is created successfully
- [ ] Verify photo is stored in `public/uploads/recipes/`
- [ ] Verify photo URL is saved in database

#### 1.2 Upload with Different Formats
- [ ] Upload JPG file - should work
- [ ] Upload PNG file - should work
- [ ] Upload WebP file - should work
- [ ] Upload GIF file - should show error: "Invalid file type"
- [ ] Upload PDF file - should show error: "Invalid file type"
- [ ] Upload SVG file - should show error: "Invalid file type"

#### 1.3 File Size Validation
- [ ] Upload 100KB image - should work
- [ ] Upload 2MB image - should work
- [ ] Upload 5MB image (exactly) - should work
- [ ] Upload 5.5MB image - should show error: "File too large. Maximum size is 5MB."
- [ ] Upload 10MB image - should show error: "File too large"

#### 1.4 Edit Recipe with Photo
- [ ] Create recipe without photo
- [ ] Edit recipe and add photo
- [ ] Submit - should save photo
- [ ] Edit recipe again and change photo to different image
- [ ] Submit - should replace old photo with new one
- [ ] Verify old photo file is not in uploads directory

#### 1.5 Edit Recipe Remove Photo
- [ ] Create recipe with photo
- [ ] Edit recipe
- [ ] Click "Remove Photo" button
- [ ] Submit form
- [ ] Verify photo no longer displays on recipe detail page
- [ ] Verify photoUrl is null in database

### 2. Photo Display Testing

#### 2.1 RecipeCard Display
- [ ] View recipe list page
- [ ] Verify recipes with photos show thumbnail at top of card
- [ ] Verify recipes without photos show image placeholder icon
- [ ] Verify thumbnail is proper aspect ratio (16:9-ish from h-48 width)
- [ ] Verify image loading is lazy (doesn't load until visible)
- [ ] Hover over card - verify shadow effect works
- [ ] Click on photo area - navigates to recipe detail

#### 2.2 RecipeDetail Display
- [ ] Navigate to recipe detail with photo
- [ ] Verify hero image displays after title/description
- [ ] Verify hero image has proper size (h-64 on mobile, h-96 on desktop)
- [ ] Verify image is responsive on different screen sizes
- [ ] Verify image loads properly with `priority` flag
- [ ] Navigate to recipe without photo
- [ ] Verify no image section displays (no empty space)

#### 2.3 Image Optimization
- [ ] Open DevTools Network tab
- [ ] Navigate to recipe with photo
- [ ] Verify image is served in WebP format if browser supports it
- [ ] Verify srcset attribute has multiple sizes
- [ ] Verify image scales appropriately for device size

### 3. Delete Testing

#### 3.1 Recipe Deletion with Photo
- [ ] Create recipe with photo
- [ ] Note the photo filename in `public/uploads/recipes/`
- [ ] Delete recipe
- [ ] Confirm deletion dialog
- [ ] Verify recipe is removed from database
- [ ] Verify photo file is deleted from filesystem
- [ ] Verify `public/uploads/recipes/` no longer contains that file

#### 3.2 Recipe Deletion without Photo
- [ ] Create recipe without photo
- [ ] Delete recipe
- [ ] Confirm deletion dialog
- [ ] Verify recipe is removed (no errors about photo)

### 4. Permission Testing

#### 4.1 ADMIN Role
- [ ] Log in as ADMIN user
- [ ] Create recipe with photo - should work
- [ ] Edit recipe and change photo - should work
- [ ] Delete recipe with photo - should work

#### 4.2 POWER_USER Role
- [ ] Log in as POWER_USER user
- [ ] Create recipe with photo - should work
- [ ] Edit recipe and change photo - should work (if allowPowerUserEdit=true)
- [ ] Delete recipe - should fail (no permission)

#### 4.3 READ_ONLY Role
- [ ] Log in as READ_ONLY user
- [ ] Try to create recipe - should fail
- [ ] Try to edit recipe - should fail
- [ ] Try to upload photo - should fail
- [ ] Can view recipes with photos - should work

#### 4.4 Unauthenticated User
- [ ] Don't log in
- [ ] Try to access `/recipes/new` - should redirect to login
- [ ] Try to access upload endpoint directly - should get 401 Unauthorized

### 5. Edge Cases & Error Handling

#### 5.1 Network Errors
- [ ] Start upload, kill network mid-upload
- [ ] Verify graceful error message
- [ ] Verify form still usable for retry

#### 5.2 Storage Errors
- [ ] Simulate disk full scenario
- [ ] Try to upload photo
- [ ] Verify error message: "Failed to upload photo"

#### 5.3 Database Errors
- [ ] Upload photo successfully
- [ ] Disconnect database before form submission
- [ ] Try to save recipe
- [ ] Verify error message and photo cleanup

#### 5.4 Concurrent Uploads
- [ ] Open multiple windows/tabs
- [ ] Create recipes with photos in each simultaneously
- [ ] Verify all uploads complete successfully
- [ ] Verify unique filenames generated (no collisions)

#### 5.5 Special Characters in Filenames
- [ ] Upload file with spaces in name: "my photo.jpg"
- [ ] Upload file with special chars: "photo@2024.jpg"
- [ ] Upload file with Unicode: "receta_español.jpg"
- [ ] All should generate unique normalized filenames

### 6. Dark Mode Testing

#### 6.1 RecipeCard in Dark Mode
- [ ] Enable dark mode
- [ ] View recipe list
- [ ] Verify photo displays correctly with dark backgrounds
- [ ] Verify placeholder icon is visible in dark mode
- [ ] Verify text contrast is readable

#### 6.2 RecipeDetail in Dark Mode
- [ ] Enable dark mode
- [ ] Navigate to recipe detail with photo
- [ ] Verify hero image displays properly
- [ ] Verify title and description text is readable

#### 6.3 Upload Form in Dark Mode
- [ ] Enable dark mode
- [ ] Go to create recipe page
- [ ] Verify upload area styling is visible
- [ ] Verify image preview displays correctly
- [ ] Verify error messages are readable

### 7. Responsive Design Testing

#### 7.1 Mobile (320px width)
- [ ] View recipe list on mobile
- [ ] Verify thumbnail height is reasonable
- [ ] Verify image doesn't cause layout shift
- [ ] Upload photo on mobile - should work
- [ ] Verify form is usable on small screen

#### 7.2 Tablet (768px width)
- [ ] View recipe list
- [ ] Verify card layout adapts
- [ ] View recipe detail
- [ ] Verify hero image height (h-64) is appropriate
- [ ] Verify image doesn't overflow

#### 7.3 Desktop (1920px width)
- [ ] View recipe list
- [ ] Verify cards are properly sized
- [ ] View recipe detail
- [ ] Verify hero image height (h-96) displays correctly
- [ ] Verify image quality is good

### 8. Performance Testing

#### 8.1 Image Loading
- [ ] Navigate to recipe list with 10+ recipes with photos
- [ ] Open DevTools Performance tab
- [ ] Scroll through list
- [ ] Verify images lazy load as they become visible
- [ ] Verify no jank or layout shift

#### 8.2 Form Submission
- [ ] Create recipe with 5MB photo
- [ ] Monitor Network tab during submission
- [ ] Verify photo uploads first, then recipe is created
- [ ] Measure total time (should be <5 seconds)

### 9. Cross-Browser Testing

#### 9.1 Chrome/Chromium
- [ ] All features should work
- [ ] WebP format should be served if supported
- [ ] Upload should work
- [ ] Display should work

#### 9.2 Firefox
- [ ] All features should work
- [ ] If WebP not supported, fallback should work
- [ ] Upload should work
- [ ] Display should work

#### 9.3 Safari
- [ ] All features should work
- [ ] WebP support varies, fallback should work
- [ ] Upload should work
- [ ] Display should work

## Test Results Summary

### Checklist Status
- Upload Tests: ___/16
- Display Tests: ___/8
- Delete Tests: ___/2
- Permission Tests: ___/6
- Edge Cases: ___/8
- Dark Mode Tests: ___/6
- Responsive Tests: ___/6
- Performance Tests: ___/4
- Cross-Browser Tests: ___/6

### Issues Found
1. Issue: _________________
   - Severity: High/Medium/Low
   - Steps to reproduce: __________
   - Expected: __________
   - Actual: __________
   - Fix: __________

2. [Add more as needed]

### Sign-Off
- Tested by: ________________
- Date: ________________
- All tests passed: [ ] Yes [ ] No
- Ready for deployment: [ ] Yes [ ] No
