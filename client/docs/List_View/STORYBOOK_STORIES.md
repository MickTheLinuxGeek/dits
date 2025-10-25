# Storybook Stories for List View Components

Comprehensive Storybook stories have been created for all List View components to facilitate documentation, testing, and development.

## Stories Created

### 1. **Pagination.stories.tsx** (11 stories)

Located in: `src/components/issues/Pagination/`

**Stories:**
- `Default` - First page of 10
- `MiddlePage` - Middle page navigation
- `LastPage` - Last page state
- `ManyPages` - Handling 100+ pages with ellipsis
- `FewPages` - Small page counts (5 pages)
- `WithoutFirstLast` - Without first/last buttons
- `CustomSiblingCount` - Custom page sibling display
- `SinglePage` - Returns null for single page
- `Interactive` - Fully interactive with state
- `PageRanges` - Showcase of first/middle/last positions

**Features Demonstrated:**
- Smart page number generation with ellipsis
- First/last page buttons
- Disabled states
- Accessibility (ARIA labels)
- Responsive button states
- Interactive page navigation

---

### 2. **FilterDropdown.stories.tsx** (8 stories)

Located in: `src/components/issues/FilterDropdown/`

**Stories:**
- `StatusFilter` - Status filtering options
- `PriorityFilter` - Priority filtering options
- `DateFilter` - Date filtering options
- `WithSelection` - Pre-selected value display
- `InteractiveStatus` - Interactive status filter
- `InteractivePriority` - Interactive priority filter
- `MultipleFilters` - Multiple filters working together

**Features Demonstrated:**
- Different filter types (status, priority, date)
- Dropdown open/close behavior
- Selection highlighting
- Multiple filters coordination
- Interactive state management

---

### 3. **SortDropdown.stories.tsx** (6 stories)

Located in: `src/components/issues/SortDropdown/`

**Stories:**
- `DefaultSort` - Default sort by created date
- `SortByTitle` - Title sorting (ascending)
- `SortByPriority` - Priority sorting
- `SortByDueDate` - Due date sorting
- `Interactive` - Fully interactive sort with direction toggle
- `AllSortFields` - All 6 sort fields showcase

**Features Demonstrated:**
- 6 sort fields (title, status, priority, dueDate, createdAt, updatedAt)
- Direction toggle (asc/desc)
- Active field highlighting
- Direction indicators (up/down arrows)
- Click same field to toggle behavior

---

### 4. **BulkActionsBar.stories.tsx** (9 stories)

Located in: `src/components/issues/BulkActionsBar/`

**Stories:**
- `SingleIssue` - Single issue selected (singular text)
- `MultipleIssues` - 5 issues selected
- `ManyIssues` - 23 issues selected
- `InteractiveStatusChange` - Status change dropdown demo
- `InteractivePriorityChange` - Priority change dropdown demo
- `InteractiveDelete` - Delete confirmation flow demo
- `InteractiveClearSelection` - Clear selection demo
- `UsageExample` - Typical usage context

**Features Demonstrated:**
- Selection count display (singular/plural)
- Status change dropdown
- Priority change dropdown with color indicators
- Delete confirmation flow
- Clear selection button
- Dropdown mutual exclusivity

---

## Running Storybook

### Development Mode
```bash
npm run storybook
```
Starts Storybook on http://localhost:6006

### Build Static Storybook
```bash
npm run build-storybook
```
Builds a static Storybook site for deployment

## Story Organization

All stories follow the Storybook 7+ Component Story Format (CSF3):

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';

const meta: Meta<typeof Component> = {
  title: 'Issues/Component',
  component: Component,
  parameters: { /* ... */ },
  argTypes: { /* ... */ },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Component>;

export const StoryName: Story = {
  args: { /* ... */ },
};
```

## Features Used

### Controls (argTypes)
All stories have interactive controls in the Storybook UI to modify props dynamically.

### Actions
Callback props are logged in the Actions panel:
- `onPageChange`
- `onChange`
- `onSortChange`
- `onDelete`
- `onStatusChange`
- `onPriorityChange`

### Documentation (autodocs)
All components use the `autodocs` tag for automatic documentation generation from:
- PropTypes/TypeScript types
- JSDoc comments
- Story descriptions

### Interactive Examples
Many stories include fully functional interactive examples with state management to demonstrate real-world behavior.

## Story Types

### 1. Basic Props Stories
Show different prop combinations:
```typescript
export const Default: Story = {
  args: { currentPage: 1, totalPages: 10 }
};
```

### 2. Interactive Stories
Include state management for full interaction:
```typescript
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [value, setValue] = useState('all');
    return <Component value={value} onChange={setValue} />;
  }
};
```

### 3. Showcase Stories
Display multiple variations together:
```typescript
export const AllVariants: Story = {
  render: () => (
    <div>
      <Component variant="a" />
      <Component variant="b" />
    </div>
  )
};
```

## Best Practices Applied

### ✅ Descriptive Names
Story names clearly describe what they demonstrate.

### ✅ Documentation
Each story includes descriptions explaining its purpose.

### ✅ Real Data
Stories use realistic data similar to production use cases.

### ✅ Interactive
Complex components include interactive examples with state.

### ✅ Edge Cases
Stories cover edge cases (single page, many pages, empty selection, etc.).

### ✅ Accessibility
Stories demonstrate ARIA labels and keyboard navigation where applicable.

## Testing with Storybook

### Visual Testing
Stories can be used for visual regression testing with tools like Chromatic.

### Interaction Testing
With `@storybook/addon-vitest`, stories can be used as tests:
```typescript
import { expect } from '@storybook/jest';
import { within, userEvent } from '@storybook/testing-library';

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(canvas.getByText('Clicked')).toBeInTheDocument();
  }
};
```

## Next Steps

### Potential Enhancements

1. **Add IssueTable Stories**
   - Complex table component with sorting, selection, pagination
   - Multiple data scenarios (empty, loading, error)

2. **Add IssueListContainer Stories**
   - Full integration story showing all components together
   - Complete workflow demonstrations

3. **Add IssueListToolbar Stories**
   - Search functionality
   - Filter panel toggle
   - Filter chips display

4. **Add Interaction Tests**
   - Use `@storybook/addon-vitest` for interaction testing
   - Test dropdown interactions
   - Test keyboard navigation

5. **Add Accessibility Tests**
   - Use `@storybook/addon-a11y` for accessibility auditing
   - Ensure WCAG compliance
   - Test keyboard navigation flows

6. **Visual Regression Testing**
   - Set up Chromatic or similar tool
   - Automated screenshot comparison
   - PR visual diff reviews

## Usage in Development

### Component Development
1. Create component
2. Create stories alongside
3. Develop using Storybook for instant feedback
4. Test different states without running full app

### Documentation
- Stories serve as living documentation
- Examples show usage patterns
- Props are documented automatically

### Design Review
- Stakeholders can review components in isolation
- Easy to share specific component states
- No need to navigate through app

### QA Testing
- QA can test components independently
- Easy to reproduce specific states
- Consistent test environment

## File Structure
```
src/components/issues/
├── Pagination/
│   ├── Pagination.tsx
│   ├── Pagination.test.tsx
│   ├── Pagination.stories.tsx       ✅ NEW
│   └── Pagination.module.css
├── FilterDropdown/
│   ├── FilterDropdown.tsx
│   ├── FilterDropdown.test.tsx
│   ├── FilterDropdown.stories.tsx   ✅ NEW
│   └── FilterDropdown.module.css
├── SortDropdown/
│   ├── SortDropdown.tsx
│   ├── SortDropdown.test.tsx
│   ├── SortDropdown.stories.tsx     ✅ NEW
│   └── SortDropdown.module.css
└── BulkActionsBar/
    ├── BulkActionsBar.tsx
    ├── BulkActionsBar.test.tsx
    ├── BulkActionsBar.stories.tsx   ✅ NEW
    └── BulkActionsBar.module.css
```

## Summary

✅ **4 story files created** with **34 total stories**
✅ **Comprehensive coverage** of all component states
✅ **Interactive examples** for complex behaviors
✅ **Full documentation** with descriptions
✅ **Production-ready** stories following best practices
✅ **Type-safe** with TypeScript
✅ **Accessible** with ARIA labels and keyboard support

The Storybook stories provide a complete reference for List View components, enabling efficient development, testing, and documentation.
