# Filter Presets

This document describes the filter presets feature implementation for the DITS Issue List.

## Overview

Filter presets allow users to save frequently used filter combinations for quick access. This eliminates the need to repeatedly configure the same filters and improves productivity when working with different issue views.

## Features

✅ **Save Filter Combinations** - Save current filters as named presets  
✅ **Quick Loading** - Load saved presets with one click  
✅ **localStorage Persistence** - Presets persist across browser sessions  
✅ **Preset Management** - View, load, and delete saved presets  
✅ **Duplicate Name Prevention** - Validates preset names before saving  
✅ **Filter Description** - Shows active filters for each preset  
✅ **Modal Interface** - Clean dialog for managing presets  
✅ **Preset Count Badge** - Shows number of saved presets in toolbar

## User Workflow

### Saving a Preset

1. Apply filters in the issue list (search, status, priority, labels, date)
2. Click the **"Presets"** button in the toolbar
3. Enter a name for the preset (2-50 characters)
4. Click **"Save Preset"**
5. Preset is saved and immediately available

### Loading a Preset

1. Click the **"Presets"** button in the toolbar
2. Find the desired preset in the list
3. Click **"Load"** on that preset
4. All filters are applied immediately
5. Modal closes automatically

### Deleting a Preset

1. Click the **"Presets"** button in the toolbar
2. Find the preset to delete
3. Click the trash icon
4. Confirm deletion in the dialog
5. Preset is removed from the list

## Architecture

### Components

```
FilterPresetManager (Modal)
  ↓
useFilterPresets (Hook)
  ↓
localStorage
```

### Key Files

1. **`src/hooks/useFilterPresets.ts`** (164 lines)  
   Core hook managing preset CRUD operations and persistence

2. **`src/components/issues/FilterPresetManager/FilterPresetManager.tsx`** (246 lines)  
   Modal UI for saving, viewing, loading, and deleting presets

3. **`src/components/issues/FilterPresetManager/FilterPresetManager.module.css`** (417 lines)  
   Styling for preset manager dialog and preset items

4. **`src/components/issues/IssueListToolbar/IssueListToolbar.tsx`** (updated)  
   Added "Presets" button with count badge

5. **`src/components/issues/IssueListContainer/IssueListContainer.tsx`** (updated)  
   Integrated preset management with filter state

## Data Model

### FilterPreset Interface

```typescript
interface FilterPreset {
  /** Unique identifier (e.g., "preset_1234567890_abc123") */
  id: string;
  /** Display name (2-50 characters) */
  name: string;
  /** Filter configuration */
  filters: IssueFilters;
  /** ISO 8601 timestamp when created */
  createdAt: string;
  /** ISO 8601 timestamp when last updated */
  updatedAt: string;
}
```

### IssueFilters Interface

```typescript
interface IssueFilters {
  /** Search query string */
  search: string;
  /** Status filter */
  status: IssueStatus | 'all';
  /** Priority filter */
  priority: IssuePriority | 'all';
  /** Label IDs to filter by */
  labels: string[];
  /** Filter by due date presence */
  hasDate: boolean | null;
}
```

## API Reference

### `useFilterPresets` Hook

```typescript
const {
  presets,
  savePreset,
  updatePreset,
  deletePreset,
  loadPreset,
  getPreset,
  presetNameExists,
} = useFilterPresets();
```

**Methods:**

- **`savePreset(name: string, filters: IssueFilters): FilterPreset`**  
  Creates a new preset with the given name and filters. Returns the created preset with generated ID and timestamps.

- **`updatePreset(id: string, name: string, filters: IssueFilters): void`**  
  Updates an existing preset's name and/or filters. Updates the `updatedAt` timestamp.

- **`deletePreset(id: string): void`**  
  Removes a preset from the list by ID.

- **`loadPreset(id: string): IssueFilters | null`**  
  Returns a copy of the filters for the given preset ID, or null if not found.

- **`getPreset(id: string): FilterPreset | undefined`**  
  Returns the full preset object by ID, or undefined if not found.

- **`presetNameExists(name: string): boolean`**  
  Checks if a preset with the given name already exists (case-insensitive).

### `FilterPresetManager` Component

```typescript
<FilterPresetManager
  presets={presets}
  currentFilters={filters}
  onSave={(name) => savePreset(name, filters)}
  onLoad={(id) => {
    const filters = loadPreset(id);
    if (filters) setFilters(filters);
  }}
  onDelete={deletePreset}
  onClose={() => setShowModal(false)}
  presetNameExists={presetNameExists}
/>
```

**Props:**

- **`presets: FilterPreset[]`** - All saved presets
- **`currentFilters: IssueFilters`** - Current filter state (to save)
- **`onSave: (name: string) => void`** - Callback to save a new preset
- **`onLoad: (id: string) => void`** - Callback to load a preset
- **`onDelete: (id: string) => void`** - Callback to delete a preset
- **`onClose: () => void`** - Callback when modal is closed
- **`presetNameExists: (name: string) => boolean`** - Check for duplicate names

## Usage Examples

### Basic Integration

```typescript
function IssueList() {
  const [filters, setFilters] = useState<IssueFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    labels: [],
    hasDate: null,
  });
  
  const [showPresetManager, setShowPresetManager] = useState(false);
  
  const {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    presetNameExists,
  } = useFilterPresets();
  
  const handleSavePreset = (name: string) => {
    savePreset(name, filters);
  };
  
  const handleLoadPreset = (id: string) => {
    const presetFilters = loadPreset(id);
    if (presetFilters) {
      setFilters(presetFilters);
    }
  };
  
  return (
    <>
      <button onClick={() => setShowPresetManager(true)}>
        Presets ({presets.length})
      </button>
      
      {showPresetManager && (
        <FilterPresetManager
          presets={presets}
          currentFilters={filters}
          onSave={handleSavePreset}
          onLoad={handleLoadPreset}
          onDelete={deletePreset}
          onClose={() => setShowPresetManager(false)}
          presetNameExists={presetNameExists}
        />
      )}
    </>
  );
}
```

### Programmatic Preset Management

```typescript
// Save a preset programmatically
const bugFilters: IssueFilters = {
  search: '',
  status: 'todo',
  priority: 'high',
  labels: ['bug'],
  hasDate: true,
};
const bugPreset = savePreset('High Priority Bugs', bugFilters);

// Load a preset by ID
const filters = loadPreset(bugPreset.id);
if (filters) {
  setFilters(filters);
}

// Check if name exists before saving
if (!presetNameExists('My Filters')) {
  savePreset('My Filters', currentFilters);
}

// Delete old presets
presets.forEach((preset) => {
  const age = Date.now() - new Date(preset.createdAt).getTime();
  const daysOld = age / (1000 * 60 * 60 * 24);
  if (daysOld > 90) {
    deletePreset(preset.id);
  }
});
```

## Implementation Details

### ID Generation

Preset IDs are generated using a combination of timestamp and random string:

```typescript
const generateId = () => {
  return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
// Example: "preset_1698765432_abc123xyz"
```

### localStorage Schema

Presets are stored in localStorage under the key `'dits_filter_presets'` as a JSON array:

```json
[
  {
    "id": "preset_1698765432_abc123xyz",
    "name": "High Priority Bugs",
    "filters": {
      "search": "",
      "status": "todo",
      "priority": "high",
      "labels": ["bug"],
      "hasDate": true
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Filter Description Generation

Each preset displays a human-readable description of its filters:

```typescript
function getFilterDescription(filters: IssueFilters): string {
  const parts: string[] = [];
  
  if (filters.search) parts.push(`Search: "${filters.search}"`);
  if (filters.status !== 'all') parts.push(`Status: ${filters.status}`);
  if (filters.priority !== 'all') parts.push(`Priority: ${filters.priority}`);
  if (filters.labels.length > 0) parts.push(`${filters.labels.length} labels`);
  if (filters.hasDate === true) parts.push('With due date');
  if (filters.hasDate === false) parts.push('Without due date');
  
  return parts.length > 0 ? parts.join(' • ') : 'No filters';
}
```

Examples:
- `"Search: \"bug\" • Status: todo • Priority: high • 2 labels • With due date"`
- `"Status: in-progress • Priority: urgent"`
- `"No filters"` (when all filters are cleared)

### Validation Rules

**Preset Name:**
- Minimum length: 2 characters
- Maximum length: 50 characters
- Leading/trailing whitespace is trimmed
- Case-insensitive uniqueness check
- Cannot be empty after trimming

**Active Filters Check:**
- At least one filter must be active to save a preset
- Empty filters show a message: "No active filters. Apply some filters before saving a preset."

## UI/UX Details

### Modal Layout

```
┌─────────────────────────────────────────┐
│ ★ Filter Presets                      × │
├─────────────────────────────────────────┤
│ SAVE CURRENT FILTERS                    │
│                                         │
│ Active filters:                         │
│ Status: todo • Priority: high           │
│                                         │
│ ┌───────────────────┐  ┌────────────┐  │
│ │ Enter preset name │  │ Save Preset│  │
│ └───────────────────┘  └────────────┘  │
├─────────────────────────────────────────┤
│ SAVED PRESETS (3)                       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ High Priority Bugs                  │ │
│ │ Status: todo • Priority: high       │ │
│ │ Saved Jan 15, 2024                  │ │
│ │                    [Load] [🗑️]       │ │
│ └─────────────────────────────────────┘ │
│ ...                                     │
└─────────────────────────────────────────┘
```

### Toolbar Button

The "Presets" button in the toolbar shows:
- Star icon (★)
- "Presets" text
- Count badge (blue circle with number) if presets exist
- Hover tooltip with preset count

## Testing

### Unit Tests (15 tests)

**useFilterPresets Hook:**
- ✅ Initializes with empty presets array
- ✅ Loads presets from localStorage on mount
- ✅ Saves a new preset
- ✅ Trims preset name when saving
- ✅ Persists presets to localStorage
- ✅ Updates an existing preset
- ✅ Deletes a preset
- ✅ Loads a preset by ID
- ✅ Returns null for non-existent preset
- ✅ Gets a specific preset by ID
- ✅ Returns undefined for non-existent preset
- ✅ Checks if preset name exists (case-insensitive)
- ✅ Handles multiple presets
- ✅ Handles corrupted localStorage data gracefully
- ✅ Handles non-array data in localStorage

### Manual Testing Checklist

**Saving Presets:**
- [ ] Save preset with valid name
- [ ] Try to save with empty name (should show error)
- [ ] Try to save with name < 2 chars (should show error)
- [ ] Try to save duplicate name (should show error)
- [ ] Try to save without active filters (should show message)
- [ ] Verify preset appears in list immediately

**Loading Presets:**
- [ ] Load a preset
- [ ] Verify all filters are applied correctly
- [ ] Verify modal closes after loading
- [ ] Load different presets and verify filters change

**Deleting Presets:**
- [ ] Delete a preset
- [ ] Verify confirmation dialog appears
- [ ] Verify preset is removed from list
- [ ] Verify preset is removed from localStorage

**Persistence:**
- [ ] Save presets
- [ ] Refresh page
- [ ] Verify presets are still there
- [ ] Close and reopen browser
- [ ] Verify presets persist across sessions

**Edge Cases:**
- [ ] Save 10+ presets (scrolling works)
- [ ] Save preset with very long name
- [ ] Save preset with special characters in search
- [ ] Clear localStorage and verify app handles gracefully

## Performance Considerations

### Optimizations Applied

1. **Memoized Callbacks** - All callback functions use `useCallback`
2. **Efficient ID Generation** - Simple timestamp + random string
3. **localStorage Batching** - React batches state updates before localStorage write
4. **Shallow Filter Copies** - Uses spread operator for filter copies
5. **Array Operations** - Uses efficient array methods (filter, map, find)

### Performance Tips

- Keep preset count under 50 for optimal performance
- Avoid extremely long filter descriptions (UI will truncate)
- Consider implementing preset export/import for power users
- Clean up old unused presets periodically

## Accessibility

### ARIA Labels

- Modal title: "Filter Presets"
- Close button: "Close"
- Save button: "Save Preset"
- Load button: "Load preset"
- Delete button: "Delete [preset name]"
- Preset manager button: "Manage filter presets"

### Keyboard Support

- **Enter** in name input → Save preset
- **Escape** in modal → Close modal
- **Tab** navigation through all interactive elements
- **Focus visible** indicators on all buttons

### Screen Reader Announcements

- Preset count in toolbar button title
- Active filter description for each preset
- Error messages for validation failures

## Browser Compatibility

Tested and working in:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requirements:
- localStorage API
- JSON.parse/stringify
- Array methods (filter, map, find)
- ES6+ features (spread operator, template literals)

## Troubleshooting

### Presets not persisting

**Symptom:** Presets disappear after page reload

**Solution:** Check localStorage is enabled and not full
```typescript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.error('localStorage not available:', e);
}
```

### Duplicate name error when name is unique

**Symptom:** Error says name exists when it doesn't

**Solution:** Name check is case-insensitive. "Test" and "test" are considered duplicates.

### Cannot save preset with filters applied

**Symptom:** Save button disabled or shows "no filters" message

**Solution:** Check that at least one filter is not at default value:
- `search !== ''`
- `status !== 'all'`
- `priority !== 'all'`
- `labels.length > 0`
- `hasDate !== null`

### Modal doesn't close after loading preset

**Symptom:** Expected modal to close, but it stays open

**Solution:** This is intentional for the current implementation. User must click X or outside modal.

## Future Enhancements

### Planned Features

1. **Preset Sharing** - Export/import presets as JSON
2. **Default Preset** - Mark one preset as default (auto-load on app start)
3. **Preset Categories** - Organize presets into folders
4. **Preset Search** - Search presets by name or filter content
5. **Recently Used** - Show recently loaded presets first
6. **Quick Apply** - Apply preset without opening modal (dropdown in toolbar)
7. **Preset Icons** - Add optional icons to presets
8. **Keyboard Shortcuts** - Cmd/Ctrl + 1-9 to load first 9 presets

### API Additions

```typescript
// Export presets as JSON
const exportPresets = (): string => {
  return JSON.stringify(presets, null, 2);
};

// Import presets from JSON
const importPresets = (json: string): void => {
  const imported = JSON.parse(json);
  setPresets([...presets, ...imported]);
};

// Mark preset as default
const setDefaultPreset = (id: string): void => {
  // Store in preferences
};

// Get default preset
const getDefaultPreset = (): FilterPreset | null => {
  // Load from preferences
};

// Get recently used presets
const getRecentPresets = (limit: number = 5): FilterPreset[] => {
  // Sort by lastUsedAt timestamp
};
```

## Migration Guide

### Upgrading from No Presets

No migration needed. Presets are opt-in and don't affect existing functionality.

### Changing localStorage Key

If you need to change the storage key:

```typescript
const OLD_KEY = 'dits_filter_presets';
const NEW_KEY = 'dits_filter_presets_v2';

// Migrate data
const oldData = localStorage.getItem(OLD_KEY);
if (oldData) {
  localStorage.setItem(NEW_KEY, oldData);
  localStorage.removeItem(OLD_KEY);
}
```

## Contributing

When modifying filter preset functionality:

1. **Run tests** - Ensure all tests pass: `npm test`
2. **Check types** - Verify TypeScript: `npx tsc --noEmit`
3. **Lint code** - Run ESLint: `npm run lint`
4. **Test manually** - Verify save/load/delete workflows
5. **Update docs** - Keep this file in sync with changes

## Support

For issues or questions:
1. Check this documentation first
2. Search existing GitHub issues
3. Create a new issue with:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - localStorage contents (if relevant)
   - Console errors (if any)
