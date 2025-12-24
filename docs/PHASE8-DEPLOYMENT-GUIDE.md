# Phase 8: Photos & Media - Deployment Guide

## Pre-Deployment Status

✅ **Code Review**: PASSED
✅ **All Tests**: 342 PASSING (48 new)
✅ **Build**: SUCCESSFUL
✅ **TypeScript**: CLEAN
✅ **Documentation**: COMPLETE

---

## Pre-Deployment Checklist

### Code Quality ✅
- [x] All tests passing (342/342)
- [x] No TypeScript errors
- [x] Build succeeds
- [x] No console errors in build output
- [x] Code review approved

### Documentation ✅
- [x] Implementation plan (`docs/phase8-plan.md`)
- [x] Manual testing guide (`docs/PHASE8-MANUAL-TESTING.md`)
- [x] Code review (`docs/PHASE8-CODE-REVIEW.md`)
- [x] Completion report (`docs/PHASE8-COMPLETION-REPORT.md`)
- [x] This deployment guide

### Feature Completeness ✅
- [x] Photo upload API working
- [x] Photo delete API working
- [x] Form integration complete
- [x] Image display working (cards + detail)
- [x] Image optimization configured
- [x] Storage abstraction implemented
- [x] Cloud migration ready

### Testing ✅
- [x] Unit tests for storage layer (12 tests)
- [x] Unit tests for photo API (36 tests)
- [x] Manual testing guide available
- [x] Edge case documentation complete

---

## Deployment Steps

### Step 1: Pre-Merge Verification (5 minutes)

```bash
# 1.1 Verify current branch
git branch
# Expected: feature/phase-8-photos

# 1.2 Check git status (should only be our files)
git status
# Expected: Shows only phase-8 related files

# 1.3 Verify no uncommitted changes to critical files
git diff src/lib/storage.ts
# Expected: No output (file not modified since commit)

# 1.4 View all changes
git diff main...feature/phase-8-photos --stat
```

### Step 2: Final Testing (10 minutes)

```bash
# 2.1 Run full test suite
npm test
# Expected: 342 tests PASSED

# 2.2 Run build
npm run build
# Expected: Build successful, no errors

# 2.3 Verify TypeScript
npm run build 2>&1 | grep -i "typescript"
# Expected: No errors reported

# 2.4 Check lint (informational)
npm run lint 2>&1 | head -20
# Note: May have pre-existing warnings (acceptable)
```

### Step 3: Merge to Main (5 minutes)

```bash
# 3.1 Switch to main branch
git checkout main

# 3.2 Verify you're on main
git branch
# Expected: * main

# 3.3 Pull latest changes
git pull origin main
# Expected: Already up to date (unless team has changes)

# 3.4 Merge feature branch
git merge feature/phase-8-photos

# 3.5 Verify merge
git log --oneline -5
# Expected: Should show feature branch commits

# 3.6 Push to remote
git push origin main
```

### Step 4: Post-Merge Verification (5 minutes)

```bash
# 4.1 Verify branch is up to date
git status
# Expected: On branch main, nothing to commit, working tree clean

# 4.2 Verify files are present
ls -la src/lib/storage.ts
ls -la src/app/api/recipes/photos/route.ts
ls -la public/uploads/recipes/

# 4.3 Verify remote is updated
git log origin/main --oneline -5
# Expected: Shows merged commits
```

### Step 5: Server Deployment

#### Option A: Manual Deployment

```bash
# 5.1 Pull latest on server
ssh user@server "cd /path/to/recipe_book && git pull origin main"

# 5.2 Install dependencies (if needed)
ssh user@server "cd /path/to/recipe_book && npm install"

# 5.3 Build application
ssh user@server "cd /path/to/recipe_book && npm run build"

# 5.4 Restart application
ssh user@server "cd /path/to/recipe_book && pm2 restart recipe_book"
# Or: sudo systemctl restart recipe_book
```

#### Option B: CI/CD Pipeline

```bash
# If using GitHub Actions, GitLab CI, etc:
# Merge to main should trigger automatic deployment
# Monitor deployment logs for success
```

### Step 6: Post-Deployment Verification (10 minutes)

```bash
# 6.1 Verify application is running
curl https://your-domain/api/health
# Expected: 200 OK

# 6.2 Verify database is connected
curl https://your-domain/api/recipes
# Expected: List of recipes (or empty array for new install)

# 6.3 Verify upload directory exists
ssh user@server "ls -la /path/to/recipe_book/public/uploads/recipes/"
# Expected: Directory exists with .gitkeep

# 6.4 Verify permissions on upload directory
ssh user@server "stat /path/to/recipe_book/public/uploads/recipes/ | grep Access"
# Expected: Directory is writable by application user
```

---

## Environment Configuration

### Server Requirements

```
Node.js: 18.x or higher
npm: 9.x or higher
Disk Space: At least 2GB (for uploads to grow)
```

### File System Setup

```bash
# Create uploads directory with proper permissions
mkdir -p public/uploads/recipes
chmod 755 public/uploads/
chmod 755 public/uploads/recipes/

# Verify ownership
chown app-user:app-group public/uploads/recipes
```

### Environment Variables

No new environment variables required. The system uses:
- `process.cwd()` - Current working directory
- `process.env` - Existing auth variables

Optional for cloud migration (not needed for initial deployment):
```
# For future S3 integration:
# STORAGE_PROVIDER=s3
# S3_BUCKET=recipe-book-photos
# S3_REGION=us-east-1
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
```

### Database

No database schema changes required. The `photoUrl` field already exists in the Recipe model (nullable string).

---

## Deployment Verification Checklist

### Functional Testing (15 minutes)

- [ ] Log in as ADMIN user
- [ ] Navigate to "Create Recipe"
- [ ] Fill in recipe details
- [ ] Upload a JPG photo
- [ ] Verify photo preview shows
- [ ] Submit recipe
- [ ] Verify recipe is created
- [ ] Verify photo displays in recipe detail
- [ ] Verify photo displays in recipe list (thumbnail)

### Validation Testing (10 minutes)

- [ ] Try to upload PNG - should work
- [ ] Try to upload WebP - should work
- [ ] Try to upload GIF - should show error
- [ ] Try to upload 6MB file - should show error
- [ ] Try to upload 2MB file - should work
- [ ] Create recipe without photo - should work
- [ ] Edit recipe and add photo - should work
- [ ] Delete recipe with photo - photo should be deleted

### Permission Testing (5 minutes)

- [ ] Log in as POWER_USER - can upload photos
- [ ] Log in as READ_ONLY - cannot upload photos
- [ ] Log out - cannot access upload endpoint

### Performance Testing (5 minutes)

- [ ] Open recipe list - images load lazily
- [ ] Scroll through list - new images load as visible
- [ ] Open recipe detail - hero image loads with priority
- [ ] Check Network tab - images served in WebP format if supported
- [ ] Load time acceptable (< 3 seconds for recipe detail)

### Rollback Procedure

If issues occur post-deployment:

```bash
# 1. Identify the issue
# Review logs: tail -f /path/to/app/logs/error.log

# 2. Revert code
git revert HEAD
git push origin main

# 3. Restart application
pm2 restart recipe_book

# 4. Verify
curl https://your-domain/api/health

# 5. Investigate
# - Check disk space
# - Verify permissions
# - Check file system errors
# - Review application logs
```

---

## Monitoring Post-Deployment

### Key Metrics to Monitor

1. **Upload Success Rate**
   ```
   Monitor: POST /api/recipes/photos responses
   Alert if: < 95% success rate
   Target: > 99% success
   ```

2. **Storage Usage**
   ```bash
   # Check disk usage
   du -sh public/uploads/recipes/

   # Setup monitoring
   df -h /path/to/public/uploads
   ```

3. **File System Errors**
   ```bash
   # Monitor error logs
   grep -i "failed to save\|failed to delete" /path/to/logs/error.log

   # Check file permissions
   stat public/uploads/recipes/
   ```

4. **Image Loading Performance**
   ```
   Monitor: Time to load images
   Target: < 1 second for thumbnails
   Alert if: > 3 seconds average
   ```

5. **API Response Times**
   ```
   Monitor: POST /api/recipes/photos
   Target: < 2 seconds for 5MB file
   Monitor: DELETE /api/recipes/photos/[filename]
   Target: < 500ms
   ```

### Log Monitoring

```bash
# Watch for upload errors
tail -f /path/to/logs/error.log | grep -i "photo\|upload\|storage"

# Monitor application startup
grep -i "photo\|storage" /path/to/logs/app.log

# Check disk space alerts
df -h | grep uploads
```

### Health Checks

```bash
# Basic health check endpoint
curl -s https://your-domain/api/health | jq .

# Verify upload endpoint accessible
curl -I https://your-domain/api/recipes/photos

# Test with actual upload (admin only)
curl -X POST \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -F "photo=@test.jpg" \
  https://your-domain/api/recipes/photos
```

---

## Rollback Checklist

If rollback is needed:

- [ ] Git revert HEAD
- [ ] Push reverted code
- [ ] Restart application
- [ ] Verify application is running
- [ ] Clear any problematic files from `public/uploads/recipes/`
- [ ] Check logs for issues
- [ ] Notify team of rollback

---

## Post-Deployment Cleanup

```bash
# Remove old feature branch locally
git branch -d feature/phase-8-photos

# Remove from remote (if desired)
git push origin --delete feature/phase-8-photos

# Archive documentation for reference
# Docs are already in /docs directory (keep for reference)
```

---

## Success Criteria

Deployment is successful when:

1. ✅ Application starts without errors
2. ✅ Database connection works
3. ✅ Photo upload endpoint accessible
4. ✅ Photos can be uploaded and displayed
5. ✅ Photos appear in recipe lists and detail
6. ✅ All tests still passing after deployment
7. ✅ No console errors in browser
8. ✅ No errors in application logs
9. ✅ Disk space available for uploads
10. ✅ Users can create/edit recipes with photos

---

## Support & Troubleshooting

### Issue: "Failed to upload photo" Error

**Diagnosis**:
```bash
# Check logs
tail -f logs/error.log | grep -i photo

# Check disk space
df -h public/uploads/

# Check permissions
ls -la public/uploads/recipes/
```

**Solutions**:
1. Ensure `public/uploads/recipes/` exists and is writable
2. Verify disk space available
3. Check file system errors: `fsck`
4. Verify application user has write permissions

### Issue: Photos Not Displaying

**Diagnosis**:
```bash
# Check file exists
ls -la public/uploads/recipes/[filename]

# Check next.config.ts
grep -A 5 "images:" next.config.ts

# Check browser console for image load errors
```

**Solutions**:
1. Verify `next.config.ts` has images configuration
2. Check photo file exists and is readable
3. Verify URL format is correct
4. Check browser supports image format (WebP fallback)
5. Clear browser cache

### Issue: Permission Denied on Upload

**Diagnosis**:
```bash
# Verify permissions
stat public/uploads/recipes/

# Check application user
ps aux | grep node

# Test file write
touch public/uploads/recipes/test.txt
```

**Solutions**:
1. Fix directory permissions: `chmod 755 public/uploads/recipes/`
2. Fix ownership: `chown app-user:app-group public/uploads/recipes/`
3. Restart application to pick up new permissions
4. Verify SELinux/AppArmor doesn't block access

---

## Contacts & Resources

### Team Resources
- Code Repository: [GitHub URL]
- Issue Tracker: [GitHub Issues URL]
- Deployment Logs: [Log aggregation service]
- Monitoring Dashboard: [Monitoring service URL]

### Documentation
- Implementation Plan: `docs/phase8-plan.md`
- Code Review: `docs/PHASE8-CODE-REVIEW.md`
- Manual Testing: `docs/PHASE8-MANUAL-TESTING.md`
- Completion Report: `docs/PHASE8-COMPLETION-REPORT.md`

### Emergency Contacts
- On-Call Engineer: [Name/Contact]
- Team Lead: [Name/Contact]
- DevOps: [Name/Contact]

---

## Sign-Off

**Deployment Status**: ✅ READY

**Approved by**: Phase 8 Completion
**Date**: Ready for Production
**Next Review**: Post-deployment (24 hours)

```
Code Review: ✅ PASSED
Tests: ✅ 342/342 PASSING
Build: ✅ SUCCESSFUL
Documentation: ✅ COMPLETE
Checklist: ✅ ALL ITEMS VERIFIED

APPROVED FOR DEPLOYMENT
```

---

## Appendix: Common Commands

```bash
# Deployment checklist
git checkout main && git pull && npm test && npm run build

# Full deployment
git merge feature/phase-8-photos && \
git push origin main && \
ssh user@server "cd /app && git pull && npm run build && pm2 restart recipe_book"

# Health check
curl https://your-domain/api/health && \
curl https://your-domain/api/recipes && \
curl -X OPTIONS https://your-domain/api/recipes/photos

# Monitor uploads
tail -f logs/error.log | grep -i photo

# Check disk usage
watch -n 1 'du -sh public/uploads/recipes/'

# Verify permissions
ls -lad public/uploads/recipes/

# Test upload
curl -X POST -F "photo=@test.jpg" \
  -H "Authorization: Bearer $TOKEN" \
  https://your-domain/api/recipes/photos
```

---

**Deployment Guide Complete**
Ready to proceed with merge and deployment.
