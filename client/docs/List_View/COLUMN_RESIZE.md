# Column Width Persistence

This document describes the column width persistence feature implementation for the Issue List table view.

## Overview

Users can resize table columns by dragging resize handles between column headers. Column widths are automatically persisted to localStorage and restored on page load, providing a personalized table layout experience.

## Features

✅ **Visual Resize Handles** - Draggable handles appear between column headers  
✅ **Mouse Drag Interaction** - Click and drag to resize columns smoothly  
✅ **Min/Max Width Constraints** - Prevents columns from becoming too narrow or wide  
✅ **Automatic Persistence** - Widths saved to localStorage on every change  
✅ **Per-Column Configuration** - Each column maintains its own width  
✅ **Restore on Load** - Widths restored from localStorage when app loads  
✅ **Visual Feedback** - Cursor changes and handle highlights during drag  
✅ **Keyboard Accessible** - ARIA labels for screen readers

## Architecture

### Components

```
useColumnResize (hook)
  ↓
Table (generic)
  ↓
IssueTable (issue-specific)
  ↓
IssueListContainer (orchestrator)
  ↓
useIssueListPreferences (persistence)
  ↓
localStorage
```

### Key Files

1. **`src/hooks/useColumnResize.ts`**  
   Core hook that manages resize logic and mouse events

2. **`src/hooks/useIssueListPreferences.ts`**  
   Extended to store/retrieve column widths in preferences

3. **`src/components/organisms/Table/Table.tsx`**  
   Generic table with resize handle rendering

4. **`src/components/issues/IssueTable/IssueTable.tsx`**  
   Issue table with default column widths

5. **`src/components/issues/IssueListContainer/IssueListContainer.tsx`**  
   Wires up column widths to preferences

## Usage

### Basic Example

```tsx
import { useColumnResize } from '@/hooks/useColumnResize';

function MyTable() {
  const { columnWidths, startResize, resizingColumn } = useColumnResize({
    minWidth: 100,
    maxWidth: 800,
    initialWidths: { name: 300, status: 150 },
    onWidthsChange: (widths) => {
      // Save to localStorage or state
      console.log('New widths:', widths);
    },
  });

  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: columnWidths.name || 300 }}>
            Name
            <div
              onMouseDown={(e) => startResize('name', e.clientX)}
              className="resize-handle"
            />
          </th>
          <th style={{ width: columnWidths.status || 150 }}>
            Status
          </th>
        </tr>
      </thead>
    </table>
  );
}
```

### With IssueTable

The IssueTable component has column resizing enabled by default:

```tsx
import { IssueTable } from '@/components/issues/IssueTable';

function MyView() {
  const [columnWidths, setColumnWidths] = useState({});

  return (
    <IssueTable
      issues={issues}
      // ... other props
      resizable={true} // default: true
      columnWidths={columnWidths}
      onColumnWidthsChange={setColumnWidths}
    />
  );
}
```

### Integration with Preferences

The IssueListContainer automatically integrates with preferences:

```tsx
// IssueListContainer.tsx
const { preferences, updateColumnWidths } = useIssueListPreferences();

<IssueTable
  columnWidths={preferences.columnWidths}
  onColumnWidthsChange={updateColumnWidths}
  resizable
/>
```

## API Reference

### `useColumnResize` Hook

```typescript
interface UseColumnResizeOptions {
  /** Minimum column width in pixels (default: 100) */
  minWidth?: number;
  /** Maximum column width in pixels (default: 1000) */
  maxWidth?: number;
  /** Initial column widths */
  initialWidths?: ColumnWidths;
  /** Callback when column widths change */
  onWidthsChange?: (widths: ColumnWidths) => void;
}

interface UseColumnResizeReturn {
  /** Current column widths */
  columnWidths: ColumnWidths;
  /** Start resizing a column */
  startResize: (columnKey: string, startX: number) => void;
  /** Whether currently resizing */
  isResizing: boolean;
  /** Key of column being resized */
  resizingColumn: string | null;
  /** Reset widths to initial values */
  resetWidths: () => void;
  /** Set a specific column width */
  setColumnWidth: (columnKey: string, width: number) => void;
}
```

### `IssueTable` Props

```typescript
interface IssueTableProps {
  // ... existing props
  
  /** Column widths from preferences */
  columnWidths?: ColumnWidths;
  /** Callback when column widths change */
  onColumnWidthsChange?: (widths: ColumnWidths) => void;
  /** Enable column resizing (default: true) */
  resizable?: boolean;
}
```

### `Table` Props

```typescript
interface TableProps {
  // ... existing props
  
  /** Enable column resizing (default: false) */
  resizable?: boolean;
  /** Column widths (controlled) */
  columnWidths?: ColumnWidths;
  /** Callback when column widths change */
  onColumnWidthsChange?: (widths: ColumnWidths) => void;
}
```

### `useIssueListPreferences` Extension

```typescript
interface IssueListPreferences {
  // ... existing fields
  
  /** Column widths (in pixels) */
  columnWidths?: ColumnWidths;
}

interface UseIssueListPreferencesReturn {
  // ... existing methods
  
  /** Update column widths */
  updateColumnWidths: (columnWidths: ColumnWidths) => void;
}
```

## Implementation Details

### Mouse Event Handling

The `useColumnResize` hook manages mouse events through:

1. **Mouse Down** - Captures column key and start position
2. **Mouse Move** - Calculates delta and updates width (with constraints)
3. **Mouse Up** - Ends resize and cleans up event listeners

Body styles are temporarily set during drag:
- `cursor: col-resize` - Shows resize cursor
- `user-select: none` - Prevents text selection

### Width Constraints

Constraints are enforced in two places:

1. **useColumnResize** - During mouse drag (min: 100px, max: 1000px)
2. **IssueTable** - Default widths per column

```typescript
const DEFAULT_COLUMN_WIDTHS = {
  id: 100,
  title: 300,
  status: 140,
  priority: 120,
  labels: 200,
  dueDate: 140,
  createdAt: 140,
  updatedAt: 140,
};
```

### Persistence Flow

```
User drags handle
  ↓
useColumnResize updates state
  ↓
onColumnWidthsChange callback
  ↓
updateColumnWidths (preferences hook)
  ↓
useEffect in preferences hook
  ↓
localStorage.setItem('dits_issue_list_preferences', JSON)
```

On load:
```
useIssueListPreferences init
  ↓
localStorage.getItem('dits_issue_list_preferences')
  ↓
Parse JSON
  ↓
Merge with defaults
  ↓
Pass to IssueTable via columnWidths prop
```

### CSS Styling

Resize handles have the following styles:

```css
.resizeHandle {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  z-index: 1;
}

.resizeHandle::after {
  content: '';
  width: 2px;
  height: 60%;
  background-color: transparent;
  transition: background-color 150ms;
}

.resizeHandle:hover::after {
  background-color: #3B82F6; /* Blue */
}

.resizeHandle.resizing::after {
  background-color: #2563EB; /* Darker blue */
}
```

## Testing

### Unit Tests

**useColumnResize Hook:**
- ✅ Initialization with default/custom options
- ✅ Starting resize operation
- ✅ Setting column widths programmatically
- ✅ Enforcing min/max width constraints
- ✅ Resetting widths to initial values
- ✅ Callback invocation on width change

**useIssueListPreferences:**
- ✅ Updating column widths
- ✅ Persisting to localStorage
- ✅ Loading column widths on mount
- ✅ Merging with defaults for missing fields

### Manual Testing

1. **Resize a column**  
   - Hover between column headers
   - See resize handle appear (blue line on hover)
   - Click and drag left/right
   - Column width changes smoothly
   - Cursor shows `col-resize`

2. **Test constraints**  
   - Try to make column very narrow (stops at 100px)
   - Try to make column very wide (stops at 800px)

3. **Verify persistence**  
   - Resize a few columns
   - Refresh the page
   - Column widths should be restored

4. **Test across sessions**  
   - Resize columns
   - Close browser
   - Reopen browser and navigate to issue list
   - Widths should persist

## Performance Considerations

### Optimizations Applied

1. **useCallback** - Resize event handlers are memoized
2. **useRef** - Resize state stored in ref to avoid stale closures
3. **useMemo** - Default column widths and effective widths memoized
4. **Debounced localStorage** - Built-in via React state batching

### Performance Tips

- Avoid expensive operations in `onColumnWidthsChange` callback
- Consider debouncing if saving to external storage
- Use memoization for derived column configurations

## Accessibility

### Screen Reader Support

- Resize handles have `aria-label="Resize [column name] column"`
- Visual resize indicator (blue line) visible on hover/focus
- Keyboard users can use column customizer instead

### Keyboard Navigation

While mouse dragging is the primary interaction, keyboard users can:
1. Use the Column Customizer to show/hide columns
2. Reset column widths via preferences reset

Future enhancement: Keyboard-based resize (Arrow keys + modifier)

## Browser Compatibility

Tested and working in:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requirements:
- CSS `::after` pseudo-elements
- CSS `cursor: col-resize`
- MouseEvent API
- localStorage API

## Troubleshooting

### Column widths not persisting

**Symptom:** Widths reset after page reload

**Solution:** Check localStorage quota and browser settings
```typescript
// Check if localStorage is available
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.error('localStorage not available');
}
```

### Resize handle not visible

**Symptom:** Can't see or click resize handle

**Solution:** Check CSS is loaded and z-index is correct
```css
.resizeHandle {
  z-index: 1; /* Must be above other content */
}
```

### Columns too narrow/wide

**Symptom:** Column widths outside expected range

**Solution:** Adjust min/max constraints in useColumnResize
```typescript
useColumnResize({
  minWidth: 80,  // Adjust as needed
  maxWidth: 600, // Adjust as needed
});
```

### Widths not updating during drag

**Symptom:** Column doesn't resize smoothly

**Solution:** Ensure mouse event listeners are properly attached
- Check browser console for errors
- Verify `startResize` is being called
- Check if `isResizing` state is true

## Future Enhancements

### Planned Features

1. **Double-click to auto-fit** - Double-click resize handle to auto-size column to content
2. **Keyboard resize** - Arrow keys + modifier to resize focused column
3. **Column presets** - Save/load multiple column layout presets
4. **Reset individual columns** - Right-click to reset single column width
5. **Animated transitions** - Smooth animation when setting width programmatically
6. **Touch support** - Touch drag on mobile/tablet devices
7. **Column bounds indicators** - Visual feedback when at min/max width

### API Additions

```typescript
// Auto-fit column to content
const autoFitColumn = (columnKey: string) => {
  const width = calculateContentWidth(columnKey);
  setColumnWidth(columnKey, width);
};

// Reset single column
const resetColumn = (columnKey: string) => {
  setColumnWidth(columnKey, initialWidths[columnKey]);
};

// Save/load presets
const savePreset = (name: string) => {
  localStorage.setItem(`preset_${name}`, JSON.stringify(columnWidths));
};

const loadPreset = (name: string) => {
  const preset = localStorage.getItem(`preset_${name}`);
  if (preset) {
    setColumnWidths(JSON.parse(preset));
  }
};
```

## Migration Guide

If you have existing components using the Table component without resizing:

### Before (No Resizing)
```tsx
<Table
  columns={columns}
  data={data}
/>
```

### After (With Resizing)
```tsx
const [columnWidths, setColumnWidths] = useState({});

<Table
  columns={columns}
  data={data}
  resizable={true}
  columnWidths={columnWidths}
  onColumnWidthsChange={setColumnWidths}
/>
```

### Disable Resizing (If Needed)
```tsx
<Table
  columns={columns}
  data={data}
  resizable={false} // Explicitly disable
/>
```

## Contributing

When modifying column resize functionality:

1. **Run tests** - Ensure all tests pass: `npm test`
2. **Check types** - Verify TypeScript: `npx tsc --noEmit`
3. **Lint code** - Run ESLint: `npm run lint`
4. **Test manually** - Verify resize interaction works smoothly
5. **Update docs** - Keep this file in sync with changes

## Support

For issues or questions:
1. Check this documentation first
2. Search existing GitHub issues
3. Create a new issue with:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)
