# Git Branching Strategy

## Overview
This project uses a **feature branch workflow** aligned with development phases. Each phase is developed on its own branch and merged to `main` when complete.

## Workflow

### 1. Start a New Phase

Create a feature branch for each phase:

```bash
# Create a new feature branch for the phase
git checkout -b feature/phase-{phase-number}-{phase-name}

# Example:
# git checkout -b feature/phase-2-authentication
# git checkout -b feature/phase-3-groups-and-roles
# git checkout -b feature/phase-4-recipe-core
```

### 2. During Phase Development

- Make regular commits on your feature branch as you implement features
- Commit messages should be descriptive and reference what was done
- Test continuously (run `npm test` before committing)
- Update relevant documentation in the feature branch

```bash
# Work on your feature
git add src/...
git commit -m "Add feature X for phase Y"

# Keep pushing to feature branch periodically
git push origin feature/phase-{number}-{name}
```

### 3. At End of Phase

When a phase is complete and tested:

1. **Ensure all tests pass locally**
   ```bash
   npm test
   npm run build
   ```

2. **Commit any final changes**
   ```bash
   git add .
   git commit -m "Phase {number}: {Description} - Complete"
   ```

3. **Push feature branch to GitHub**
   ```bash
   git push origin feature/phase-{number}-{name}
   ```

4. **Merge to main**
   ```bash
   git checkout main
   git pull origin main  # Ensure main is up to date
   git merge feature/phase-{number}-{name}
   git push origin main
   ```

5. **Optionally delete the feature branch** (after merge is confirmed on GitHub)
   ```bash
   git branch -d feature/phase-{number}-{name}
   git push origin --delete feature/phase-{number}-{name}
   ```

## Branch Naming Convention

```
feature/phase-{number}-{short-description}
```

Examples:
- `feature/phase-1-foundation`
- `feature/phase-2-authentication`
- `feature/phase-3-groups-and-roles`
- `feature/phase-4-recipe-core`
- `feature/phase-5-permissions-governance`

## Current Status

| Phase | Branch | Status |
|-------|--------|--------|
| 1 | main | ✓ Merged |
| 2 | main | ✓ Merged |
| 3 | main | ✓ Merged |
| 4 | main | ✓ Merged |
| 5 | TBD | Pending |
| 6+ | TBD | Pending |

## Key Principles

1. **One branch per phase** - Each phase gets its own feature branch
2. **Complete before merging** - Ensure phase is complete, tested, and documented before merging to main
3. **Main is always production-ready** - Only tested, complete code is merged to main
4. **Clear commit history** - Use descriptive commit messages that explain the "why"
5. **Test before pushing** - Run `npm test` locally before pushing to ensure CI won't fail

## Checklist Before Merging to Main

- [ ] All tests pass: `npm test`
- [ ] Code builds: `npm run build`
- [ ] Linter passes: `npm run lint`
- [ ] Phase deliverables are complete
- [ ] Phase documentation updated
- [ ] No console errors in dev mode
- [ ] Manual testing completed
- [ ] Commit messages are descriptive
