# Main Dashboard UI Implementation Plan

## Overview

This document outlines the plan to implement the main dashboard UI based on the design mockup at `mockups/desktop/01-main-dashboard.html`. The implementation will create a modern, clean interface that matches the mockup's look and feel while maintaining the existing component architecture.

## Goals

1. Implement the sidebar-based layout with Smart Views, Projects, and Areas sections
2. Create the main content area with header, search, view toggles, and issue list
3. Build reusable components for labels, priorities, and status indicators
4. Establish mock data infrastructure for parallel frontend/backend development
5. Maintain keyboard-first design principles and sub-100ms interaction requirements

## Design System Changes

### Color Palette (from mockup)
- **Backgrounds**: `#f8fafc` (main), `white` (sidebar/cards)
- **Borders**: `#e2e8f0` (primary), `#f1f5f9` (secondary)
- **Text**: `#1e293b` (primary), `#475569` (secondary), `#64748b` (tertiary)
- **Blue Accent**: `#3b82f6` (primary), `#2563eb` (hover/dark), `#eff6ff` (light bg), `#dbeafe` (lighter)
- **Status Colors**:
  - Red (urgent/bug): `#dc2626`, `#fee2e2`
  - Orange (high): `#f97316`, `#f59e0b`
  - Yellow (medium): `#eab308`
  - Green (low/enhancement): `#22c55e`, `#65a30d`, `#ecfccb`
  - Blue (feature): `#2563eb`, `#dbeafe`

### Typography
- **Font Family**: System font stack (already configured)
- **Sizes**: 20px (view title), 14px (body/nav), 13px (buttons), 11-12px (metadata), 10px (labels)
- **Weights**: 600 (headings), 500 (medium), 400 (normal)

### Spacing
- **Sidebar**: 280px width, 20px vertical padding for sections
- **Padding**: 16-24px for main elements, 8-12px for smaller elements
- **Transitions**: 0.15s ease for all hover/interactive states

## Architecture Changes

### Layout Structure
```
App (full viewport)
├── Sidebar (280px fixed, full height)
│   ├── Logo
│   ├── Smart Views Section
│   ├── Projects Section
│   └── Areas Section
└── Main Content (flex: 1)
    ├── Header (search, view toggle, actions)
    └── Issue List (scrollable)
```

### New Components to Create

1. **Layout Components**
   - `Sidebar` - Main navigation sidebar
   - `SidebarSection` - Reusable section with title
   - `NavItem` - Navigation link with icon, label, count, active state
   - `MainHeader` - Header with search and actions
   - `IssueList` - Scrollable issue list container

2. **UI Components**
   - `Label` - Colored pill badge for issue labels
   - `PriorityIndicator` - Dot + text for priority levels
   - `StatusBadge` - Badge with dot for issue status
   - `SearchBar` - Input with search icon overlay
   - `ViewToggle` - Segmented control for List/Board/Calendar
   - `IssueItem` - Individual issue row with all metadata

3. **Utility Components**
   - `KeyboardShortcut` - Styled keyboard shortcut badge (e.g., `<kbd>C</kbd>`)

### Mock Data Infrastructure

Create a `src/mocks/` directory structure:
```
src/mocks/
├── index.ts                 # Export all mocks
├── issues.ts                # Mock issue data
├── projects.ts              # Mock project data
├── areas.ts                 # Mock area data
├── navigation.ts            # Mock navigation counts
└── types.ts                 # Shared mock types
```

**Mock Data Strategy:**
- Use environment variable `VITE_USE_MOCK_DATA` to toggle between mock and real API
- Default to mock data in development (`import.meta.env.DEV`)
- Create TypeScript interfaces that match backend API contracts
- Populate with realistic data matching the mockup (3 inbox items, 5 today, etc.)
- Include edge cases: long titles, many labels, various priorities/statuses

## Implementation Phases

### Phase 1: Setup & Foundation
1. Create feature branch `feature/implement-main-dashboard-mockup`
2. Set up mock data infrastructure and types
3. Update global styles to match new color palette
4. Remove dark theme temporarily (will re-add later)

### Phase 2: Layout Restructure
1. Restructure App.tsx to remove top header
2. Implement new sidebar-based layout
3. Update routing to work with new layout
4. Remove sidebar toggle functionality

### Phase 3: Sidebar Implementation
1. Create Sidebar component with fixed 280px width
2. Create Logo section
3. Create SidebarSection component
4. Create NavItem component with active states
5. Implement Smart Views section
6. Implement Projects section (with mock data)
7. Implement Areas section (with mock data)

### Phase 4: Main Content Area
1. Create MainHeader component
2. Implement view title display
3. Create SearchBar component with icon
4. Create ViewToggle component (List/Board/Calendar)
5. Create "New Issue" button with keyboard shortcut
6. Wire up header to routing context

### Phase 5: Issue List
1. Create IssueList container component
2. Create IssueItem component
3. Implement Label component with color variants
4. Implement PriorityIndicator component
5. Implement StatusBadge component
6. Add issue checkbox functionality
7. Add hover states and transitions
8. Integrate with mock issue data

### Phase 6: Polish & Integration
1. Add empty state handling
2. Implement keyboard shortcuts (C for new issue, Cmd/Ctrl+K for search)
3. Test all interactive states (hover, active, focus)
4. Ensure all transitions are 0.15s ease
5. Add proper TypeScript types throughout
6. Test responsiveness (minimum: ensure it works on 1280px+ screens)
7. Run linter and fix any issues

### Phase 7: Testing & Documentation
1. Write unit tests for new components
2. Create Storybook stories for key components
3. Test with various mock data scenarios
4. Document component APIs
5. Update README with mock data usage

## Detailed Task List

### Setup & Infrastructure

- [ ] 1.1. Create feature branch `feature/implement-main-dashboard-mockup`
- [ ] 1.2. Create `src/mocks/` directory structure
- [ ] 1.3. Create `src/mocks/types.ts` with Issue, Project, Area interfaces
- [ ] 1.4. Create `src/mocks/issues.ts` with 3 inbox issues matching mockup
- [ ] 1.5. Create `src/mocks/projects.ts` with 3 projects (DITS v1.0, Portfolio Redesign, Mobile App)
- [ ] 1.6. Create `src/mocks/areas.ts` with 3 areas (Work, Personal, Learning)
- [ ] 1.7. Create `src/mocks/navigation.ts` with view counts
- [ ] 1.8. Create `src/mocks/index.ts` exporting all mocks
- [ ] 1.9. Add `VITE_USE_MOCK_DATA` environment variable handling
- [ ] 1.10. Update `src/index.css` with new color palette CSS variables

### Layout Restructure

- [ ] 2.1. Remove top header from `App.tsx`
- [ ] 2.2. Change `App.tsx` layout to horizontal (sidebar + main content)
- [ ] 2.3. Remove `sidebarOpen` state from store
- [ ] 2.4. Remove sidebar toggle button functionality
- [ ] 2.5. Update `App.css` for new layout structure
- [ ] 2.6. Set main content background to `#f8fafc`

### Sidebar Components

- [ ] 3.1. Create `src/components/layout/Sidebar/Sidebar.tsx`
- [ ] 3.2. Create `src/components/layout/Sidebar/Sidebar.module.css`
- [ ] 3.3. Implement logo section with DITS name and circular icon
- [ ] 3.4. Create `src/components/layout/SidebarSection/SidebarSection.tsx`
- [ ] 3.5. Create `src/components/layout/SidebarSection/SidebarSection.module.css`
- [ ] 3.6. Implement section title with uppercase styling
- [ ] 3.7. Create `src/components/layout/NavItem/NavItem.tsx`
- [ ] 3.8. Create `src/components/layout/NavItem/NavItem.module.css`
- [ ] 3.9. Implement NavItem with icon, label, count, and active state
- [ ] 3.10. Add left blue border accent for active state
- [ ] 3.11. Add hover effect with background color change
- [ ] 3.12. Wire up NavItem to React Router with proper active detection
- [ ] 3.13. Implement Smart Views section (Inbox, Today, Upcoming, Logbook)
- [ ] 3.14. Implement Projects section with mock project data
- [ ] 3.15. Implement Areas section with mock area data
- [ ] 3.16. Add issue counts to all nav items from mock data

### Main Header

- [ ] 4.1. Create `src/components/layout/MainHeader/MainHeader.tsx`
- [ ] 4.2. Create `src/components/layout/MainHeader/MainHeader.module.css`
- [ ] 4.3. Implement header layout (title, search, actions)
- [ ] 4.4. Add white background with bottom border
- [ ] 4.5. Create `src/components/ui/SearchBar/SearchBar.tsx`
- [ ] 4.6. Create `src/components/ui/SearchBar/SearchBar.module.css`
- [ ] 4.7. Implement search input with placeholder text
- [ ] 4.8. Add search icon overlay on left side
- [ ] 4.9. Add focus styles (blue border, shadow, white background)
- [ ] 4.10. Create `src/components/ui/ViewToggle/ViewToggle.tsx`
- [ ] 4.11. Create `src/components/ui/ViewToggle/ViewToggle.module.css`
- [ ] 4.12. Implement segmented control for List/Board/Calendar
- [ ] 4.13. Add active state styling (white background, shadow)
- [ ] 4.14. Create `src/components/ui/KeyboardShortcut/KeyboardShortcut.tsx`
- [ ] 4.15. Create `src/components/ui/KeyboardShortcut/KeyboardShortcut.module.css`
- [ ] 4.16. Style keyboard shortcut badge (monospace, gray bg, border)
- [ ] 4.17. Add "New Issue" button with `C` keyboard shortcut badge
- [ ] 4.18. Wire up header to display current view name from route

### Issue List Components

- [ ] 5.1. Create `src/components/issues/IssueList/IssueList.tsx`
- [ ] 5.2. Create `src/components/issues/IssueList/IssueList.module.css`
- [ ] 5.3. Implement scrollable white container
- [ ] 5.4. Create `src/components/issues/IssueItem/IssueItem.tsx`
- [ ] 5.5. Create `src/components/issues/IssueItem/IssueItem.module.css`
- [ ] 5.6. Implement issue item layout (checkbox, content, status)
- [ ] 5.7. Add bottom border and hover effect
- [ ] 5.8. Implement issue title display
- [ ] 5.9. Implement issue metadata row (ID, labels, priority, due date)
- [ ] 5.10. Style issue ID with monospace font
- [ ] 5.11. Create `src/components/ui/Label/Label.tsx`
- [ ] 5.12. Create `src/components/ui/Label/Label.module.css`
- [ ] 5.13. Implement colored pill badges
- [ ] 5.14. Add color variants (bug=red, feature=blue, enhancement=green, etc.)
- [ ] 5.15. Style with uppercase text, letter spacing, border radius
- [ ] 5.16. Create `src/components/ui/PriorityIndicator/PriorityIndicator.tsx`
- [ ] 5.17. Create `src/components/ui/PriorityIndicator/PriorityIndicator.module.css`
- [ ] 5.18. Implement colored dot component
- [ ] 5.19. Add priority level variants (urgent=red, high=orange, medium=yellow, low=green)
- [ ] 5.20. Create `src/components/ui/StatusBadge/StatusBadge.tsx`
- [ ] 5.21. Create `src/components/ui/StatusBadge/StatusBadge.module.css`
- [ ] 5.22. Implement rounded badge with dot and status text
- [ ] 5.23. Add status variants (todo=gray, in progress=blue, review=orange)
- [ ] 5.24. Add checkbox interaction handling (mark complete)
- [ ] 5.25. Integrate IssueList with mock issue data

### View Pages

- [ ] 6.1. Create `src/pages/InboxPage/InboxPage.tsx`
- [ ] 6.2. Integrate MainHeader and IssueList for Inbox view
- [ ] 6.3. Filter mock issues for Inbox (status !== 'Done')
- [ ] 6.4. Create `src/pages/TodayPage/TodayPage.tsx`
- [ ] 6.5. Filter mock issues for Today (due date = today)
- [ ] 6.6. Create `src/pages/UpcomingPage/UpcomingPage.tsx`
- [ ] 6.7. Filter and sort mock issues by due date
- [ ] 6.8. Create `src/pages/LogbookPage/LogbookPage.tsx`
- [ ] 6.9. Filter mock issues for Logbook (status = 'Done')
- [ ] 6.10. Update router to use new page components

### Polish & Refinement

- [ ] 7.1. Implement empty state component for lists with no issues
- [ ] 7.2. Add empty state styling (icon, heading, description)
- [ ] 7.3. Add keyboard shortcut handler for `C` (new issue)
- [ ] 7.4. Add keyboard shortcut handler for `Cmd/Ctrl+K` (command palette/search focus)
- [ ] 7.5. Verify all transitions are 0.15s ease
- [ ] 7.6. Test hover states on all interactive elements
- [ ] 7.7. Test focus-visible styles for keyboard navigation
- [ ] 7.8. Add proper TypeScript types to all new components
- [ ] 7.9. Export all new components from appropriate index.ts files
- [ ] 7.10. Test on minimum viewport width (1280px)
- [ ] 7.11. Run `npm run lint` and fix any issues
- [ ] 7.12. Run `npm run typecheck` and fix any issues

### Testing & Documentation

- [ ] 8.1. Write unit tests for Label component
- [ ] 8.2. Write unit tests for PriorityIndicator component
- [ ] 8.3. Write unit tests for StatusBadge component
- [ ] 8.4. Write unit tests for IssueItem component
- [ ] 8.5. Write unit tests for NavItem component
- [ ] 8.6. Create Storybook story for Label component
- [ ] 8.7. Create Storybook story for PriorityIndicator component
- [ ] 8.8. Create Storybook story for StatusBadge component
- [ ] 8.9. Create Storybook story for IssueItem component
- [ ] 8.10. Create Storybook story for Sidebar component
- [ ] 8.11. Test with empty issue list (empty state)
- [ ] 8.12. Test with many issues (scrolling)
- [ ] 8.13. Test with long issue titles (text wrapping)
- [ ] 8.14. Test with many labels (layout handling)
- [ ] 8.15. Document mock data usage in README
- [ ] 8.16. Document environment variable `VITE_USE_MOCK_DATA`
- [ ] 8.17. Add JSDoc comments to all public component props
- [ ] 8.18. Update component documentation for new layout components

### Final Steps

- [ ] 9.1. Review all changes against mockup for accuracy
- [ ] 9.2. Verify performance (interactions < 100ms)
- [ ] 9.3. Test full user flow (navigation, viewing issues, etc.)
- [ ] 9.4. Run full test suite (`npm test`)
- [ ] 9.5. Create pull request with screenshots
- [ ] 9.6. Address PR feedback
- [ ] 9.7. Merge to main branch

## Mock Data Implementation Details

### Environment Variable Configuration

Add to `.env.development`:
```env
VITE_USE_MOCK_DATA=true
```

Add to `.env.production`:
```env
VITE_USE_MOCK_DATA=false
```

### Mock Data Hook Pattern

Create `src/hooks/useIssues.ts`:
```typescript
import { useMemo } from 'react';
import { mockIssues } from '../mocks';

export function useIssues() {
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
                      (import.meta.env.DEV && !import.meta.env.VITE_USE_API);
  
  const issues = useMemo(() => {
    if (useMockData) {
      return mockIssues;
    }
    // TODO: Replace with actual API call using React Query
    // return useQuery(['issues'], fetchIssues);
    return [];
  }, [useMockData]);
  
  return issues;
}
```

### Mock Data Structure Example

```typescript
// src/mocks/types.ts
export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  labels: Label[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  areaId?: string;
}

export interface Label {
  id: string;
  name: string;
  color: 'bug' | 'feature' | 'enhancement' | 'security' | 'database' | 'devops' | 'design';
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  issueCount: number;
}

export interface Area {
  id: string;
  name: string;
  icon: string;
  issueCount: number;
}
```

## Success Criteria

- [ ] UI matches mockup design accurately (layout, colors, typography, spacing)
- [ ] All navigation items work and show correct active states
- [ ] Issue list displays with all metadata (labels, priority, status, dates)
- [ ] Hover and interactive states work smoothly with 0.15s transitions
- [ ] Mock data system is in place and toggleable via environment variable
- [ ] All components have proper TypeScript types
- [ ] Code passes ESLint and Prettier checks
- [ ] Key components have Storybook stories
- [ ] Unit tests pass for core components
- [ ] Keyboard navigation works (Tab, Enter, shortcuts)
- [ ] Performance meets sub-100ms interaction requirement

## Future Enhancements (Out of Scope)

These items will be addressed in future iterations:
- Board view implementation
- Calendar view implementation
- Command palette (Cmd/Ctrl+K) full implementation
- Issue detail modal/page
- Create new issue modal
- Drag and drop for issue reordering
- Real-time updates via WebSocket
- Dark theme re-implementation
- Mobile responsive design
- Actual API integration replacing mocks
- Advanced filtering and search
- Bulk operations on issues
- Keyboard shortcut customization

## Notes

- Focus on matching the mockup design exactly before adding additional features
- Prioritize clean, maintainable component architecture over rapid implementation
- Keep components small and focused (single responsibility)
- Use CSS modules for component-scoped styling
- Leverage existing atomic components (Button, Input) where applicable
- Document any deviations from the mockup with reasons
- The mock data system should make it easy to swap in real API calls later

## Timeline Estimate

- **Phase 1-2 (Setup & Layout)**: 2-4 hours
- **Phase 3 (Sidebar)**: 4-6 hours
- **Phase 4 (Header)**: 3-4 hours
- **Phase 5 (Issue List)**: 6-8 hours
- **Phase 6 (Polish)**: 2-3 hours
- **Phase 7 (Testing)**: 4-6 hours

**Total Estimate**: 21-31 hours (3-4 full development days)

## References

- Design Mockup: `mockups/desktop/01-main-dashboard.html`
- Project Requirements: `design_docs/requirements.md`
- Project Plan: `design_docs/plan.md`
- Existing Task List: `design_docs/tasks.md`
