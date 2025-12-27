# Phase 9: UI Polish & Cooking Experience - Implementation Plan

## Overview

Transform the Recipe Book into a polished, kitchen-friendly application with interactive cooking features, essential accessibility (WCAG 2.1 Level AA), and mobile-first optimizations.

**Branch**: `phase-9-ui-polish`

**Primary Focus**: Cooking experience optimizations with interactive features for real-world kitchen use.

## User Priorities (Confirmed)

1. **Cooking experience optimizations** (primary focus)
2. **Interactive ingredient checkboxes** (session-based, resets on reload)
3. **Additional cooking features**:
   - Sticky ingredient panel
   - Print-friendly view
   - Larger text option
   - Step highlighting
4. **Essential accessibility** (WCAG 2.1 Level AA compliance)

## Key Features to Implement

### 1. Interactive Ingredient Checkboxes
- Enable checkboxes in RecipeDetail.tsx (currently disabled at line 195)
- Session-based state using React useState (resets on page reload)
- Visual feedback: strikethrough text + opacity for checked items
- Screen reader announcements for state changes
- Proper ARIA labels with ingredient details

### 2. Step Highlighting with Keyboard Navigation
- Click/tap any instruction step to highlight it
- Keyboard navigation: Arrow Down (next), Arrow Up (prev), Escape (clear)
- Visual highlight: border, background, shadow changes
- Only one step highlighted at a time
- Full keyboard accessibility with focus management

### 3. Sticky Ingredient Panel
- CSS sticky positioning for ingredients section
- Keeps ingredients visible while scrolling through instructions
- Collapsible on mobile with toggle button
- Auto-static on large screens (≥1024px)
- Smart height management to avoid viewport overflow

### 4. Cooking Controls Toolbar
- Text size toggle (normal ↔ large) with localStorage persistence
- Print recipe button (triggers window.print())
- Sticky panel toggle (mobile only)
- Positioned above recipe content

### 5. Print-Friendly Styles
- Hide: navigation, buttons, comments, theme toggle
- Show: title, photo (small), ingredients, instructions, notes, family story
- Clean black-on-white formatting
- Page break controls for long recipes
- Checkboxes render as empty boxes for manual checking

### 6. Typography & Spacing Improvements
- Larger base text for kitchen readability (1.125rem on mobile, 1.25rem on desktop)
- Improved line-height (1.7-1.8) for instructions
- Stronger font-weight hierarchy (500/600/700)
- More generous spacing between sections (space-y-10 instead of space-y-8)
- Better breathing room in ingredient/instruction cards

### 7. Essential Accessibility (WCAG 2.1 Level AA)
- Custom focus indicators (3px blue outline with 2px offset)
- Skip-to-content link
- Screen reader text for emoji icons (👥, ⏱️, 🔥)
- Live region announcements for state changes
- Reduced motion support (@media prefers-reduced-motion)
- Color contrast verification (4.5:1 ratio for text)
- Proper heading hierarchy (already correct, verify maintained)
- 44x44px minimum touch targets

## Implementation Phases

### Phase A: Foundation (Hooks & Utils)
**Goal**: Create reusable state management hooks

**New Files**:
- `src/hooks/useLocalStorage.ts` - Generic localStorage hook with SSR safety
- `src/hooks/useKeyboardNavigation.ts` - Arrow key navigation for steps

**Tests**:
- `tests/unit/hooks/useLocalStorage.test.tsx`
- `tests/unit/hooks/useKeyboardNavigation.test.tsx`

### Phase B: Interactive Checkboxes
**Goal**: Enable ingredient tracking while cooking

**Modify**: `src/components/recipes/RecipeDetail.tsx`
- Add `useState` for checked ingredients (Set<number>)
- Enable checkboxes (line 192-196) with onChange handler
- Add strikethrough + opacity styling for checked items
- Implement screen reader announcements
- Update ARIA labels with full ingredient details

**Tests**: `tests/unit/components/RecipeDetail.cooking.test.tsx`

### Phase C: Accessibility Foundation
**Goal**: Core a11y improvements

**New Files**:
- `src/components/ui/SkipToContent.tsx` - Skip link component

**Modify**:
- `src/app/layout.tsx` - Add SkipToContent component
- `src/app/recipes/[id]/page.tsx` - Add id="main-content" to wrapper
- `src/app/globals.css` - Add focus indicators, reduced motion, contrast fixes
- `tailwind.config.ts` - Extend theme with focus ring utilities

**Modify**: `src/components/recipes/RecipeMetadata.tsx`
- Add sr-only text for emoji icons
- Mark emojis as aria-hidden="true"

### Phase D: Step Highlighting
**Goal**: Interactive cooking workflow

**Modify**: `src/components/recipes/RecipeDetail.tsx`
- Add `useState` for highlightedStep (number | null)
- Integrate useKeyboardNavigation hook
- Add click handlers to instruction steps (line 227-247)
- Implement highlighted state styling (border, bg, shadow)
- Add role="button", tabIndex, onKeyDown for accessibility
- Update ARIA attributes (aria-pressed, aria-label)

**Tests**: Add step highlighting tests to RecipeDetail.cooking.test.tsx

### Phase E: Cooking Controls Toolbar
**Goal**: User preferences and quick actions

**New Files**:
- `src/components/recipes/CookingControls.tsx` - Toolbar component with:
  - Text size toggle button (uses useLocalStorage)
  - Print button (calls window.print())
  - Sticky panel toggle (mobile only, lg:hidden)

**Modify**: `src/components/recipes/RecipeDetailWrapper.tsx`
- Import and render CookingControls above RecipeDetail
- Pass necessary state/handlers

**Modify**: `src/app/globals.css`
- Add CSS custom properties for large text mode ([data-large-text="true"])
- Scale all text sizes: xs→0.875rem, base→1.25rem, 4xl→2.75rem

**Tests**: `tests/unit/components/CookingControls.test.tsx`

### Phase F: Sticky Ingredient Panel
**Goal**: Keep ingredients visible while scrolling

**Modify**: `src/components/recipes/RecipeDetail.tsx` (line 182-219)
- Add `useState` for stickyPanelCollapsed (boolean)
- Wrap ingredients section with sticky positioning classes:
  - `sticky top-0 z-10 bg-white dark:bg-gray-950 pb-4 pt-2`
  - Conditional rendering based on collapse state
- Add toggle button (mobile only: `lg:hidden`)
- Add collapsible content wrapper
- Style with subtle bottom border/shadow when stuck

### Phase G: Print Styles
**Goal**: Clean, printable recipe format

**New Files**:
- `src/styles/print.css` - Comprehensive @media print styles:
  - Hide: header, nav, button, .comments-section
  - Override: body → white bg, black text
  - Style: clean borders, page breaks, compact layout
  - Checkboxes: render as empty squares

**Modify**: `src/app/layout.tsx`
- Import print.css: `import '@/styles/print.css'`

**Add classes to components**:
- Add `.no-print` class to elements that should hide in print
- Add `.recipe-notes`, `.family-story` classes for consistent print styling

### Phase H: Typography & Spacing Polish
**Goal**: Enhanced readability

**Modify**: `src/components/recipes/RecipeDetail.tsx`
- Update base text sizes: `text-base` → `recipe-base-text` custom class
- Increase spacing: `space-y-8` → `space-y-10`
- Add section margins: `mb-12` between major sections
- Improve card padding: `p-3` → `p-4`
- Add `.recipe-instruction` class to steps for better line-height

**Modify**: `src/app/globals.css`
- Define `.recipe-base-text` with responsive sizing
- Define `.recipe-instruction` with line-height: 1.8
- Define font-weight utilities (.recipe-ingredient-quantity: 500)
- Update color values for WCAG AA contrast

### Phase I: Testing & Accessibility Audit
**Goal**: Comprehensive quality assurance

**New Test Files**:
- `tests/unit/accessibility/RecipeDetail.a11y.test.tsx` - jest-axe tests
- Add integration test for complete cooking workflow

**Manual Testing Checklist**:
- [ ] Screen reader testing (NVDA/JAWS/VoiceOver)
- [ ] Keyboard navigation (Tab, Arrow keys, Escape, Enter)
- [ ] Print preview (Chrome, Firefox, Safari)
- [ ] Mobile testing (320px-768px)
- [ ] Color contrast verification (WCAG AA: 4.5:1)
- [ ] Focus indicators visible in both themes
- [ ] Touch target size (44x44px minimum)

## Critical Files

### Files to Create (7 new)
1. `src/hooks/useLocalStorage.ts`
2. `src/hooks/useKeyboardNavigation.ts`
3. `src/components/recipes/CookingControls.tsx`
4. `src/components/ui/SkipToContent.tsx`
5. `src/styles/print.css`
6. `tests/unit/components/CookingControls.test.tsx`
7. `tests/unit/accessibility/RecipeDetail.a11y.test.tsx`

### Files to Modify (6 existing)
1. `src/components/recipes/RecipeDetail.tsx` - Primary component for all cooking features
2. `src/app/globals.css` - Accessibility, typography, large text mode
3. `src/components/recipes/RecipeMetadata.tsx` - Screen reader text for emojis
4. `tailwind.config.ts` - Focus ring utilities
5. `src/app/layout.tsx` - SkipToContent, print.css import
6. `src/components/recipes/RecipeDetailWrapper.tsx` - CookingControls integration

### Test Files (5 new)
1. `tests/unit/hooks/useLocalStorage.test.tsx`
2. `tests/unit/hooks/useKeyboardNavigation.test.tsx`
3. `tests/unit/components/RecipeDetail.cooking.test.tsx`
4. `tests/unit/components/CookingControls.test.tsx`
5. `tests/unit/accessibility/RecipeDetail.a11y.test.tsx`

## Frontend Design Skill Usage

The frontend-design skill will be invoked at TWO points:

### Point 1: Before Implementation
**When**: After plan approval, before writing code
**Command**: Use frontend-design skill to review CookingControls toolbar design
**Purpose**: Validate layout, spacing, responsive behavior, dark mode colors

### Point 2: After Initial Implementation
**When**: After core features work, before final QA
**Command**: Use frontend-design skill to review overall RecipeDetail visual polish
**Purpose**: Fine-tune visual hierarchy, contrast, spacing, print output

## State Management Strategy

- **Session-based** (resets on reload): Checked ingredients, highlighted step, sticky panel collapsed
- **Persistent** (localStorage): Text size preference
- **Implementation**: React useState + custom useLocalStorage hook
- **No Context needed**: All state scoped to RecipeDetail component

## Mobile Responsiveness

- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Touch targets**: 44x44px minimum for all interactive elements
- **Sticky panel**: Collapsible on mobile, static on desktop (lg:static)
- **Typography**: Larger base sizes on mobile for arm's-length reading
- **Spacing**: Responsive padding (px-4 md:px-6 lg:px-8)

## Dark Mode

All features include dark mode via Tailwind `dark:` modifier:
- Backgrounds: `bg-white dark:bg-gray-900`
- Text: `text-gray-900 dark:text-white`
- Borders: `border-gray-200 dark:border-gray-700`
- Interactive states: `hover:bg-gray-200 dark:hover:bg-gray-700`
- Focus: `focus:ring-blue-500 dark:focus:ring-blue-400`

Print styles override to light mode (black on white).

## Accessibility Compliance (WCAG 2.1 Level AA)

✓ Custom focus indicators (3px outline, visible in both themes)
✓ Skip-to-content link
✓ Screen reader announcements for dynamic changes
✓ Text alternatives for emoji icons
✓ Keyboard navigation for all features
✓ Color contrast 4.5:1 ratio minimum
✓ Touch targets 44x44px minimum
✓ Reduced motion support
✓ Semantic HTML (proper heading hierarchy)
✓ ARIA labels and states

## Testing Strategy

1. **Unit tests**: All new hooks and components
2. **Integration tests**: Complete cooking workflow
3. **Accessibility tests**: jest-axe automated + manual screen reader
4. **Visual tests**: frontend-design skill review
5. **Manual tests**: Print preview, keyboard nav, mobile devices

## Implementation Sequence

1. Create branch `phase-9-ui-polish`
2. **Phase A**: Create hooks (useLocalStorage, useKeyboardNavigation)
3. **Phase B**: Enable interactive checkboxes
4. **Phase C**: Accessibility foundation (skip link, focus indicators, emoji text)
5. **Phase D**: Step highlighting with keyboard nav
6. **Phase E**: CookingControls toolbar
7. **Phase F**: Sticky ingredient panel
8. **Phase G**: Print styles
9. **Phase H**: Typography & spacing polish
10. **Phase I**: Testing & a11y audit
11. **Invoke frontend-design skill** for final review
12. Create PR with comprehensive description

## Success Criteria

Phase 9 is complete when:

- [ ] All interactive cooking features functional (checkboxes, highlighting, sticky panel)
- [ ] Text size toggle works and persists
- [ ] Print view shows clean, ink-efficient recipe
- [ ] WCAG 2.1 Level AA compliance verified (jest-axe + manual)
- [ ] Screen reader testing passed
- [ ] Keyboard navigation 100% functional
- [ ] Mobile tested 320px-768px
- [ ] Dark mode works for all new features
- [ ] All tests passing (unit + integration + accessibility)
- [ ] Frontend-design skill review completed
- [ ] Documentation updated

## Estimated Complexity

- **Hooks & Utils**: Simple (2-3 hours)
- **Interactive Checkboxes**: Simple (2 hours)
- **Accessibility Foundation**: Moderate (3-4 hours)
- **Step Highlighting**: Moderate (3 hours)
- **Cooking Controls**: Moderate (3 hours)
- **Sticky Panel**: Moderate (2-3 hours)
- **Print Styles**: Simple (2 hours)
- **Typography Polish**: Simple (2 hours)
- **Testing & A11y Audit**: Moderate (4-5 hours)

**Total**: 23-29 hours of development time

## Technical Notes

- Use CSS `position: sticky` (no JavaScript scroll listeners needed)
- Text scaling via CSS custom properties + data attributes
- Print styles in separate file to avoid bloating main CSS
- All state management with React hooks (no Redux/Context needed)
- Screen reader announcements via temporary live region elements
- localStorage wrapped in try-catch for quota/privacy mode handling
