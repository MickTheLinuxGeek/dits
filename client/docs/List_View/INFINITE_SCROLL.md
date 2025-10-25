# Infinite Scroll Implementation

Comprehensive documentation for the infinite scroll feature added to the List View.

## Overview

The List View now supports two viewing modes:
1. **Table View** - Paginated table with sortable columns (default)
2. **List View** - Infinite scroll with compact issue cards

Users can toggle between views using the view mode toggle in the toolbar.

## Architecture

### Components

#### 1. useInfiniteScroll Hook
**File:** `src/hooks/useInfiniteScroll.ts`

Custom React hook that implements infinite scroll using the Intersection Observer API.

**Features:**
- Performant intersection-based detection
- Configurable root margin (triggers before reaching bottom)
- Automatic loading prevention during active requests
- Clean cleanup on unmount
- TypeScript support with full type safety

**Usage:**
```typescript
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const { sentinelRef } = useInfiniteScroll({
  onLoadMore: loadMoreItems,
  hasMore: hasNextPage,
  isLoading: isFetchingMore,
  rootMargin: '200px', // Trigger 200px before bottom
  threshold: 0.1,
});

return (
  <div>
    {items.map(item => <Item key={item.id} {...item} />)}
    <div ref={sentinelRef} /> {/* Invisible sentinel element */}
  </div>
);
```

**Props:**
- `onLoadMore: () => void` - Callback when more items should be loaded
- `hasMore: boolean` - Whether there are more items available
- `isLoading?: boolean` - Prevents duplicate loads
- `rootMargin?: string` - Distance before bottom to trigger (default: '100px')
- `threshold?: number` - Intersection threshold (default: 0.1)
- `enabled?: boolean` - Enable/disable observer (default: true)

---

#### 2. InfiniteScrollContainer
**File:** `src/components/issues/InfiniteScrollContainer/InfiniteScrollContainer.tsx`

Wrapper component that provides UI for infinite scroll lists.

**Features:**
- Initial loading skeleton
- Load more spinner
- End of list message
- Custom loading component support
- Error handling ready
- Fully accessible

**Usage:**
```typescript
<InfiniteScrollContainer
  onLoadMore={loadMoreIssues}
  hasMore={hasNextPage}
  isLoadingMore={isFetchingMore}
  isLoading={isInitialLoad}
  loadingItemCount={5}
  endMessage="No more issues to load"
>
  {issues.map(issue => (
    <IssueCard key={issue.id} issue={issue} />
  ))}
</InfiniteScrollContainer>
```

**Props:**
```typescript
interface InfiniteScrollContainerProps {
  children: React.ReactNode;           // Items to render
  onLoadMore: () => void;              // Load more callback
  hasMore: boolean;                    // Has more items
  isLoadingMore?: boolean;             // Loading more state
  isLoading?: boolean;                 // Initial loading state
  loadingItemCount?: number;           // Skeleton count (default: 3)
  loadingComponent?: React.ReactNode;  // Custom loader
  rootMargin?: string;                 // Observer margin (default: '200px')
  className?: string;                  // Custom styles
  endMessage?: string;                 // End message
}
```

---

#### 3. IssueCard
**File:** `src/components/issues/IssueCard/IssueCard.tsx`

Compact card component optimized for list view display.

**Features:**
- Priority indicator bar (left edge)
- Status and priority badges
- Label badges (shows first 3, indicates more)
- Due date with contextual styling (overdue, today, upcoming)
- Description preview (2-line clamp)
- Selection checkbox support
- Click to open issue
- Keyboard accessible

**Usage:**
```typescript
<IssueCard
  issue={issue}
  isSelected={selectedIds.has(issue.id)}
  onClick={handleIssueClick}
  onSelectionChange={handleSelectionChange}
  showCheckbox={hasSelections}
/>
```

**Visual Design:**
- 4px colored bar on left indicates priority
- Compact horizontal layout
- Status/priority badges in metadata row
- Truncated description for quick scanning
- Hover effects for interactivity

---

#### 4. View Mode Toggle
**Location:** IssueListToolbar component

Toggle buttons in the toolbar allow switching between views.

**Icons:**
- 📋 Table2 icon - Table view with pagination
- 📄 List icon - Infinite scroll list view

**Behavior:**
- Active view is highlighted
- Preference persisted to localStorage
- Smooth transition between modes
- Maintains filters and sorting

---

### Updated Components

#### IssueListContainer
**File:** `src/components/issues/IssueListContainer/IssueListContainer.tsx`

Enhanced to support both view modes.

**New Props:**
```typescript
interface IssueListContainerProps {
  // ... existing props
  onLoadMore?: () => void;              // Load more for infinite scroll
  hasMore?: boolean;                    // Has more items
  isLoadingMore?: boolean;              // Loading more state
  viewMode?: ViewMode;                  // 'table' | 'list'
  onViewModeChange?: (mode: ViewMode) => void;
}
```

**View Mode Logic:**
- Table view: Shows `IssueTable` with pagination
- List view: Shows `InfiniteScrollContainer` with `IssueCard` items
- Filters and sorting work in both modes
- Selection works in both modes

---

#### IssueListToolbar
**File:** `src/components/issues/IssueListToolbar/IssueListToolbar.tsx`

Added view mode toggle buttons.

**New Props:**
```typescript
interface IssueListToolbarProps {
  // ... existing props
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}
```

**UI Changes:**
- View mode toggle appears before filter button
- Two-button group with table/list icons
- Active state styling
- Tooltips on hover

---

## User Experience

### Switching Views

**From Table to List:**
1. User clicks the List icon in toolbar
2. View mode changes to 'list'
3. Table is replaced with card list
4. Scroll position resets to top
5. Infinite scroll begins monitoring

**From List to Table:**
1. User clicks the Table icon in toolbar
2. View mode changes to 'table'
3. Card list is replaced with table
4. Pagination appears at bottom
5. Shows items for current page

### Infinite Scroll Behavior

**Initial Load:**
- Shows skeleton loading (3-10 cards)
- Loads first batch of items
- Displays items when ready

**Scrolling:**
- As user scrolls near bottom (200px before)
- Automatically triggers `onLoadMore`
- Shows "Loading more..." spinner
- Appends new items to list
- Seamless continuation

**End of List:**
- When `hasMore` becomes false
- Shows "No more items to load" message
- Scroll monitoring continues (no extra requests)

**Error Handling:**
- Errors during load more should be caught by parent
- Can show inline error message
- Provide retry button
- Don't lose already loaded items

---

## API Integration

### Cursor-Based Pagination

For infinite scroll to work efficiently, the API should support cursor-based pagination.

**Request Parameters:**
```typescript
{
  cursor?: string;      // Cursor from last response
  limit?: number;       // Items per page (e.g., 20)
  sortBy?: string;      // Sort field
  sortOrder?: 'asc' | 'desc';
  // ... filters
}
```

**Response Format:**
```typescript
{
  items: Issue[];       // Array of issues
  nextCursor: string | null;  // Cursor for next page
  hasMore: boolean;     // Whether more items exist
  total?: number;       // Optional total count
}
```

### Example Implementation

**useIssueList Hook Enhancement:**
```typescript
export function useIssueListInfinite({
  fetchFunction,
  initialParams = {},
}: UseIssueListOptions) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [items, setItems] = useState<Issue[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetchFunction({
        ...initialParams,
        cursor: cursor || undefined,
      });

      setItems(prev => [...prev, ...response.items]);
      setCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    issues: items,
    hasMore,
    isLoadingMore,
    loadMore,
    // ... other methods
  };
}
```

**Backend Endpoint Example:**
```
GET /api/v1/issues?cursor=abc123&limit=20&sortBy=createdAt&sortOrder=desc

Response:
{
  "items": [...],
  "nextCursor": "def456",
  "hasMore": true,
  "total": 245
}
```

---

## Performance Considerations

### Intersection Observer

**Why Intersection Observer?**
- Native browser API (no polling)
- Excellent performance
- Automatic lifecycle management
- Efficient even with many elements

**Configuration:**
- `rootMargin: '200px'` - Triggers early for smooth UX
- `threshold: 0.1` - Minimal visibility needed
- Root = viewport (scrolls with page)

### Rendering Optimization

**Card List:**
- Each card is lightweight (~80px height)
- Minimal React tree depth
- CSS animations (GPU accelerated)
- No heavy computations on scroll

**Memory Management:**
- Consider virtualization for 1000+ items
- Use React.memo for IssueCard
- Memoize callbacks with useCallback
- Stable keys (issue.id) prevent re-renders

**Potential Enhancements:**
```typescript
// Virtual scrolling for very large lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={issues.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <IssueCard issue={issues[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## Accessibility

### Keyboard Navigation

**In List View:**
- Tab to focus cards
- Enter/Space to open issue
- Shift+Tab to navigate backwards
- Focus indicators visible

**View Mode Toggle:**
- Keyboard accessible (Tab to reach)
- Enter/Space to activate
- ARIA labels for screen readers
- Clear focus states

### Screen Readers

**Announcements:**
- "Loading more issues..."
- "No more items to load"
- "Table view" / "List view" button labels
- Issue card content readable

**ARIA Attributes:**
```html
<button
  aria-label="List view (infinite scroll)"
  aria-pressed={viewMode === 'list'}
>
  <List />
</button>
```

---

## Testing

### Unit Tests

**useInfiniteScroll Hook:**
```typescript
describe('useInfiniteScroll', () => {
  it('calls onLoadMore when sentinel is visible', () => {
    const onLoadMore = jest.fn();
    // Setup IntersectionObserver mock
    // Trigger intersection
    // Assert onLoadMore called
  });

  it('does not call onLoadMore when isLoading', () => {
    // Test loading state prevents duplicate calls
  });

  it('cleans up observer on unmount', () => {
    // Test cleanup
  });
});
```

**InfiniteScrollContainer:**
```typescript
describe('InfiniteScrollContainer', () => {
  it('shows loading skeleton initially', () => {
    render(
      <InfiniteScrollContainer
        onLoadMore={jest.fn()}
        hasMore={true}
        isLoading={true}
      >
        <div>Item</div>
      </InfiniteScrollContainer>
    );
    expect(screen.getAllByRole('status')).toHaveLength(3);
  });

  it('shows end message when no more items', () => {
    render(
      <InfiniteScrollContainer
        onLoadMore={jest.fn()}
        hasMore={false}
        endMessage="All done!"
      >
        <div>Item</div>
      </InfiniteScrollContainer>
    );
    expect(screen.getByText('All done!')).toBeInTheDocument();
  });
});
```

**IssueCard:**
```typescript
describe('IssueCard', () => {
  it('renders issue details', () => {
    render(<IssueCard issue={mockIssue} />);
    expect(screen.getByText(mockIssue.title)).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = jest.fn();
    render(<IssueCard issue={mockIssue} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(mockIssue);
  });

  it('shows priority indicator', () => {
    render(<IssueCard issue={mockIssue} />);
    const indicator = screen.getByLabelText(/priority/i);
    expect(indicator).toBeInTheDocument();
  });
});
```

### Integration Tests

**View Mode Switching:**
```typescript
it('switches from table to list view', async () => {
  render(<InboxPage />);
  
  // Initially shows table
  expect(screen.getByRole('table')).toBeInTheDocument();
  
  // Click list view button
  fireEvent.click(screen.getByLabelText('List view'));
  
  // Now shows cards
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
});
```

**Infinite Scroll Loading:**
```typescript
it('loads more items on scroll', async () => {
  const loadMore = jest.fn();
  render(
    <InfiniteScrollContainer
      onLoadMore={loadMore}
      hasMore={true}
    >
      {items.map(item => <div key={item.id}>{item.title}</div>)}
    </InfiniteScrollContainer>
  );
  
  // Scroll to bottom
  // Trigger intersection observer
  await waitFor(() => {
    expect(loadMore).toHaveBeenCalled();
  });
});
```

---

## File Structure

```
client/src/
├── hooks/
│   ├── useInfiniteScroll.ts         # Intersection observer hook
│   ├── useIssueList.ts              # API integration hook
│   └── useIssueListPreferences.ts   # Stores view mode preference
├── components/
│   ├── atoms/
│   │   └── Badge/                   # Generic badge component
│   │       ├── Badge.tsx
│   │       ├── Badge.module.css
│   │       └── index.ts
│   └── issues/
│       ├── IssueCard/               # Card for list view
│       │   ├── IssueCard.tsx
│       │   ├── IssueCard.module.css
│       │   └── index.ts
│       ├── InfiniteScrollContainer/ # Scroll wrapper
│       │   ├── InfiniteScrollContainer.tsx
│       │   ├── InfiniteScrollContainer.module.css
│       │   └── index.ts
│       ├── IssueListContainer/      # Main container (updated)
│       │   ├── IssueListContainer.tsx
│       │   └── ...
│       └── IssueListToolbar/        # Toolbar (updated)
│           ├── IssueListToolbar.tsx
│           ├── IssueListToolbar.module.css
│           └── ...
└── pages/
    └── InboxPageWithAPI.tsx         # Example usage
```

---

## Usage Examples

### Basic Infinite Scroll

```typescript
function IssueListPage() {
  const {
    issues,
    hasMore,
    isLoadingMore,
    loadMore,
  } = useIssueListInfinite({
    fetchFunction: issuesService.getIssues,
  });

  return (
    <InfiniteScrollContainer
      onLoadMore={loadMore}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
    >
      {issues.map(issue => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </InfiniteScrollContainer>
  );
}
```

### With View Mode Toggle

```typescript
function InboxPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const {
    issues,
    isLoading,
    hasMore,
    isLoadingMore,
    loadMore,
  } = useIssueListInfinite({
    fetchFunction: issuesService.getInboxIssues,
  });

  return (
    <>
      <MainHeader title="Inbox" />
      <IssueListContainer
        issues={issues}
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        // For list view:
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
        // Handlers:
        onIssueClick={handleIssueClick}
        onIssuesDelete={handleDelete}
        onIssueStatusChange={handleStatusChange}
      />
    </>
  );
}
```

### Custom Loading Component

```typescript
<InfiniteScrollContainer
  onLoadMore={loadMore}
  hasMore={hasMore}
  isLoadingMore={isLoadingMore}
  loadingComponent={
    <div className="custom-loader">
      <Spinner size="lg" />
      <p>Fetching more issues...</p>
    </div>
  }
>
  {children}
</InfiniteScrollContainer>
```

---

## Best Practices

### Do's ✅

1. **Use cursor-based pagination** for infinite scroll
2. **Trigger loading early** (200px before bottom)
3. **Show loading indicators** for good UX
4. **Preserve scroll position** when navigating back
5. **Handle errors gracefully** with retry options
6. **Memoize callbacks** to prevent unnecessary re-renders
7. **Use stable keys** (issue.id) for list items
8. **Test with slow networks** to catch edge cases

### Don'ts ❌

1. **Don't use offset pagination** (pages shift with updates)
2. **Don't load too many items** at once (20-30 is good)
3. **Don't ignore loading states** (causes duplicate requests)
4. **Don't render all items** at once if 1000+ (use virtualization)
5. **Don't block the UI** during load more
6. **Don't lose items** on error (keep what's loaded)
7. **Don't forget accessibility** (keyboard nav, ARIA labels)
8. **Don't skip the sentinel element** (it's crucial)

---

## Troubleshooting

### Issue: onLoadMore called multiple times

**Cause:** isLoading not set or sentinel not disabled
**Solution:** Ensure isLoading prop is passed and true during requests

### Issue: Doesn't trigger near bottom

**Cause:** rootMargin too small or sentinel not in DOM
**Solution:** Increase rootMargin or verify sentinel element exists

### Issue: Poor performance with many items

**Cause:** Too many DOM nodes, expensive re-renders
**Solution:** Implement virtual scrolling with react-window

### Issue: Scroll jumps when switching views

**Cause:** Different content heights
**Solution:** Reset scroll position on view change

---

## Future Enhancements

1. **Virtual Scrolling** - For 1000+ items
2. **Pull to Refresh** - Mobile-friendly reload
3. **Scroll Restoration** - Remember position on back navigation
4. **Infinite Scroll Up** - Bidirectional loading
5. **Optimistic Updates** - Instant visual feedback
6. **Skeleton Customization** - Match actual card dimensions
7. **Load More Button** - Alternative to auto-load
8. **Scroll Animations** - Smooth fade-in for new items

---

## Summary

✅ **useInfiniteScroll Hook** - Intersection observer-based  
✅ **InfiniteScrollContainer** - Wrapper with loading states  
✅ **IssueCard Component** - Compact card for list view  
✅ **View Mode Toggle** - Table ↔ List switching  
✅ **IssueListContainer** - Supports both modes  
✅ **Badge Component** - For status/priority display  
✅ **TypeScript Support** - Full type safety  
✅ **Accessibility** - Keyboard nav and ARIA labels  
✅ **Performance** - Optimized rendering  
✅ **Documentation** - Complete usage guide  

The infinite scroll implementation is production-ready and provides an excellent alternative to traditional pagination!
