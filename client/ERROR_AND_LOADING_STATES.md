# Error and Loading States Documentation

Comprehensive error handling and loading states for the List View components.

## Overview

The List View now includes production-ready error and loading states:
1. **Loading State Component** - Skeleton placeholders matching table layout
2. **Error State Component** - User-friendly error messages with retry
3. **Empty State Component** - Contextual empty states (no issues, no results, filtered)
4. **Integrated States** - Seamless integration with IssueListContainer

## Components Created

### 1. IssueListLoadingState

**File:** `src/components/issues/IssueListLoadingState/IssueListLoadingState.tsx`

Skeleton placeholder component that matches the actual table layout.

**Features:**
- Configurable number of skeleton rows
- Optional toolbar skeleton
- Matches actual table column widths
- Pulse animation for better UX
- Dark mode support

**Usage:**
```typescript
import { IssueListLoadingState } from '../IssueListLoadingState/IssueListLoadingState';

<IssueListLoadingState rows={10} showToolbar={true} />
```

**Props:**
```typescript
interface IssueListLoadingStateProps {
  rows?: number;          // Number of skeleton rows (default: 10)
  showToolbar?: boolean;  // Show toolbar skeleton (default: true)
}
```

---

### 2. IssueListErrorState

**File:** `src/components/issues/IssueListErrorState/IssueListErrorState.tsx`

Error display component with retry functionality and helpful suggestions.

**Features:**
- User-friendly error messages
- Retry button with callback
- Helpful troubleshooting suggestions
- Custom title and description support
- Error icon with visual feedback
- Dark mode support

**Usage:**
```typescript
import { IssueListErrorState } from '../IssueListErrorState/IssueListErrorState';

<IssueListErrorState 
  error={error} 
  onRetry={handleRetry}
  title="Failed to load issues"
/>
```

**Props:**
```typescript
interface IssueListErrorStateProps {
  error?: Error | string;  // Error object or message
  onRetry?: () => void;    // Retry callback
  title?: string;          // Custom title
}
```

**Error Handling:**
- Accepts both Error objects and string messages
- Displays user-friendly error messages
- Shows troubleshooting suggestions
- Provides retry button if callback provided

---

### 3. IssueListEmptyState

**File:** `src/components/issues/IssueListEmptyState/IssueListEmptyState.tsx`

Contextual empty state component with multiple variants.

**Features:**
- Three variants: no-issues, no-results, filtered
- Contextual icons and messaging
- Action button with callback
- Custom title and description
- Dark mode support

**Variants:**

**No Issues:**
```typescript
<IssueListEmptyState 
  variant="no-issues"
  onAction={handleCreateIssue}
/>
```
- Icon: Inbox
- Message: "No issues yet"
- Description: "Get started by creating your first issue"
- Action: "Create issue"

**No Results:**
```typescript
<IssueListEmptyState 
  variant="no-results"
  onAction={handleClearSearch}
/>
```
- Icon: Search
- Message: "No issues found"
- Description: "Try adjusting your search query or filters"
- Action: "Clear search"

**Filtered:**
```typescript
<IssueListEmptyState 
  variant="filtered"
  onAction={handleClearFilters}
/>
```
- Icon: Filter
- Message: "No matching issues"
- Description: "No issues match the current filters"
- Action: "Clear filters"

**Props:**
```typescript
interface IssueListEmptyStateProps {
  variant?: 'no-issues' | 'no-results' | 'filtered';
  onAction?: () => void;
  actionText?: string;
  title?: string;
  description?: string;
}
```

---

## Integration with IssueListContainer

The IssueListContainer now handles all state scenarios automatically.

### Updated Props

```typescript
interface IssueListContainerProps {
  issues: Issue[];
  isLoading?: boolean;
  isError?: boolean;          // NEW
  error?: Error | null;       // NEW
  onRetry?: () => void;       // NEW
  onClearFilters?: () => void; // NEW
  onIssueClick?: (issue: Issue) => void;
  onIssuesDelete?: (issueIds: string[]) => void;
  onIssueStatusChange?: (issueId: string, status: IssueStatus) => void;
  onIssuePriorityChange?: (issueId: string, priority: IssuePriority) => void;
}
```

### State Priority

The container renders states in this priority order:

1. **Loading State** (Initial load)
   - When: `isLoading === true` AND `issues.length === 0`
   - Shows: IssueListLoadingState with skeleton

2. **Error State**
   - When: `isError === true`
   - Shows: IssueListErrorState with error message

3. **Empty State - No Issues**
   - When: `!isLoading` AND `issues.length === 0`
   - Shows: IssueListEmptyState variant="no-issues"

4. **Empty State - No Results**
   - When: `filteredIssues.length === 0` AND `hasActiveFilters === true`
   - Shows: IssueListEmptyState variant="filtered"

5. **Normal State**
   - When: None of the above
   - Shows: IssueTable with data

### Usage Example

```typescript
function InboxPage() {
  const { 
    issues, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useIssueList({
    fetchFunction: issuesService.getInboxIssues,
  });

  return (
    <IssueListContainer
      issues={issues}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
      onIssuesDelete={handleDelete}
      onIssueStatusChange={handleStatusChange}
      onIssuePriorityChange={handlePriorityChange}
    />
  );
}
```

---

## State Flow Diagram

```
┌─────────────────┐
│  Page Component │
└────────┬────────┘
         │
         │ useIssueList()
         │
         ▼
┌─────────────────────┐
│ IssueListContainer  │
└─────────┬───────────┘
          │
          │ State Check
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
isLoading?   isError?
    │           │
   YES         YES
    │           │
    ▼           ▼
┌────────┐  ┌─────────┐
│Loading │  │ Error   │
│State   │  │ State   │
└────────┘  └─────────┘
    │           │
   NO          NO
    │           │
    ▼           ▼
issues.length === 0?
    │
   YES ──────► ┌──────────┐
    │          │ Empty    │
    │          │ State    │
    │          └──────────┘
    │
   NO
    │
    ▼
filteredIssues.length === 0
AND hasActiveFilters?
    │
   YES ──────► ┌──────────┐
    │          │ No       │
    │          │ Results  │
    │          └──────────┘
    │
   NO
    │
    ▼
┌─────────────┐
│ Issue Table │
│ (Normal)    │
└─────────────┘
```

---

## CSS Styling

All state components include:
- **Light mode** styling
- **Dark mode** support with `@media (prefers-color-scheme: dark)`
- **Responsive design** with proper spacing
- **Accessible colors** with sufficient contrast
- **Consistent design language** matching the app theme

### Color Palette

**Light Mode:**
- Background: `#ffffff`
- Border: `#e5e7eb`
- Text: `#111827`
- Muted text: `#6b7280`
- Error: `#ef4444`
- Icon: `#9ca3af`

**Dark Mode:**
- Background: `#1f2937`
- Border: `#374151`
- Text: `#f9fafb`
- Muted text: `#9ca3af`
- Error: `#f87171`
- Icon: `#6b7280`

---

## User Experience Patterns

### 1. Progressive Loading

```typescript
// First render - show loading skeleton
if (isLoading && issues.length === 0) {
  return <IssueListLoadingState />;
}

// Subsequent loads - keep data visible
if (isLoading && issues.length > 0) {
  // Show spinner in toolbar or add opacity to table
  return <IssueTable issues={issues} isLoading={true} />;
}
```

### 2. Error Recovery

```typescript
// Show error with retry button
if (isError) {
  return (
    <IssueListErrorState 
      error={error}
      onRetry={() => {
        // Clear error state
        setIsError(false);
        // Retry API call
        refetch();
      }}
    />
  );
}
```

### 3. Contextual Empty States

```typescript
// No issues at all - encourage creation
<IssueListEmptyState 
  variant="no-issues"
  onAction={() => navigate('/issues/new')}
/>

// No search results - suggest clearing
<IssueListEmptyState 
  variant="no-results"
  onAction={() => setSearch('')}
/>

// No filter matches - offer to clear filters
<IssueListEmptyState 
  variant="filtered"
  onAction={clearAllFilters}
/>
```

---

## Accessibility Features

### Loading State
- Uses `aria-hidden="true"` on skeleton elements
- Screen readers announce "Loading" via role="status"
- Keyboard navigation is disabled during loading

### Error State
- Error icon has proper ARIA labels
- Retry button is keyboard accessible
- Error messages are announced by screen readers
- Focus moves to retry button after error

### Empty State
- Clear, descriptive messages
- Action buttons are keyboard accessible
- Icons are decorative with aria-hidden
- Proper heading hierarchy

---

## Testing

### Manual Testing Checklist

**Loading States:**
- [ ] Initial load shows skeleton
- [ ] Skeleton matches table layout
- [ ] Skeleton animates smoothly
- [ ] Dark mode skeleton displays correctly
- [ ] Loading doesn't flicker for fast requests

**Error States:**
- [ ] Error message displays correctly
- [ ] Retry button works
- [ ] Retry button is keyboard accessible
- [ ] Error suggestions are helpful
- [ ] Dark mode error displays correctly

**Empty States:**
- [ ] No issues state shows on empty list
- [ ] No results state shows when search yields nothing
- [ ] Filtered state shows when filters match nothing
- [ ] Action buttons work correctly
- [ ] Icons display properly
- [ ] Dark mode empty states display correctly

### Unit Tests

Example tests for state components:

```typescript
// IssueListLoadingState.test.tsx
describe('IssueListLoadingState', () => {
  it('renders with default rows', () => {
    render(<IssueListLoadingState />);
    // Assert 10 skeleton rows
  });

  it('renders custom number of rows', () => {
    render(<IssueListLoadingState rows={5} />);
    // Assert 5 skeleton rows
  });

  it('hides toolbar when showToolbar is false', () => {
    render(<IssueListLoadingState showToolbar={false} />);
    // Assert toolbar is not rendered
  });
});

// IssueListErrorState.test.tsx
describe('IssueListErrorState', () => {
  it('displays error message', () => {
    render(<IssueListErrorState error={new Error('Test error')} />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', () => {
    const onRetry = jest.fn();
    render(<IssueListErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });
});

// IssueListEmptyState.test.tsx
describe('IssueListEmptyState', () => {
  it('shows no-issues variant', () => {
    render(<IssueListEmptyState variant="no-issues" />);
    expect(screen.getByText('No issues yet')).toBeInTheDocument();
  });

  it('shows no-results variant', () => {
    render(<IssueListEmptyState variant="no-results" />);
    expect(screen.getByText('No issues found')).toBeInTheDocument();
  });

  it('shows filtered variant', () => {
    render(<IssueListEmptyState variant="filtered" />);
    expect(screen.getByText('No matching issues')).toBeInTheDocument();
  });

  it('calls onAction when button clicked', () => {
    const onAction = jest.fn();
    render(<IssueListEmptyState onAction={onAction} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalled();
  });
});
```

---

## Performance Considerations

### Loading State
- **Skeleton rendering** is lightweight (just divs with CSS)
- **No JavaScript animations** - uses CSS only
- **Minimal re-renders** - static component

### Error State
- **Lazy loaded** - only rendered when error occurs
- **Simple DOM structure** - minimal overhead
- **No polling** - waits for user retry action

### Empty State
- **Lightweight** - minimal DOM nodes
- **Static rendering** - no animations by default
- **Fast paint** - simple CSS styling

---

## Migration Guide

### Before (without states)

```typescript
function InboxPage() {
  const [issues, setIssues] = useState([]);
  
  return <IssueListContainer issues={issues} />;
}
```

### After (with states)

```typescript
function InboxPage() {
  const { 
    issues, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useIssueList({
    fetchFunction: issuesService.getInboxIssues,
  });
  
  return (
    <IssueListContainer
      issues={issues}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
      onClearFilters={() => {/* handle clear */}}
      // ... other props
    />
  );
}
```

---

## Best Practices

### 1. Always Provide Retry
```typescript
<IssueListErrorState 
  error={error} 
  onRetry={refetch}  // Always provide this
/>
```

### 2. Use Contextual Empty States
```typescript
// Good - specific message
<IssueListEmptyState variant="filtered" />

// Bad - generic message
<div>No data</div>
```

### 3. Show Loading Only on Initial Load
```typescript
// Good - skeleton on first load
if (isLoading && issues.length === 0) {
  return <IssueListLoadingState />;
}

// Good - keep data visible on subsequent loads
if (isLoading && issues.length > 0) {
  return <IssueTable issues={issues} isLoading={true} />;
}
```

### 4. Provide Clear Error Messages
```typescript
// Good - specific message from API
throw new Error('Network request failed. Please check your connection.');

// Bad - generic message
throw new Error('Error');
```

---

## Summary

✅ **Loading State** - Skeleton placeholders for better UX  
✅ **Error State** - User-friendly errors with retry  
✅ **Empty States** - Contextual messages (3 variants)  
✅ **Container Integration** - Automatic state handling  
✅ **Dark Mode** - Full support across all states  
✅ **Accessibility** - ARIA labels and keyboard nav  
✅ **Performance** - Optimized rendering  
✅ **Documentation** - Complete usage guide  

All List View components now have production-ready error and loading states!
