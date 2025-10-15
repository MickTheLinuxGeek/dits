# Component Library

This directory contains the DITS UI component library, organized using Atomic Design principles.

## Atomic Design Structure

### Atoms (`/atoms`)
The smallest, most basic building blocks of the UI. These are typically single-purpose components that can't be broken down further without losing their function.

**Examples:**
- Button
- Input
- Label
- Icon
- Checkbox
- Radio
- Badge
- Avatar
- Spinner

**Guidelines:**
- Should be highly reusable
- Should accept minimal, focused props
- Should be stateless when possible
- Should have clear, single responsibility

### Molecules (`/molecules`)
Combinations of atoms that work together as a unit. These are simple, functional groups of UI elements.

**Examples:**
- Form Field (Label + Input + Error message)
- Search Bar (Input + Button)
- Card Header (Avatar + Text + Icon)
- Dropdown Menu Item (Icon + Label + Shortcut)
- Pagination Controls (Buttons + Text)

**Guidelines:**
- Composed of 2-5 atoms typically
- Should be reusable across contexts
- Can have simple internal state
- Should have clear functional purpose

### Organisms (`/organisms`)
Complex UI components composed of molecules and/or atoms. These are distinct sections of an interface.

**Examples:**
- Navigation Bar
- Issue List
- Issue Detail Panel
- Sidebar Navigation
- Command Palette
- Modal Dialog
- Data Table

**Guidelines:**
- Can be more specific to application context
- May have complex internal state
- May connect to global state/data
- Should be self-contained

### Templates (`/templates`)
Page-level layouts that organize organisms into a structure. These define the content structure without actual content.

**Examples:**
- App Layout (Header + Sidebar + Main)
- List View Layout
- Board View Layout
- Detail View Layout
- Settings Layout

**Guidelines:**
- Define the overall page structure
- Don't contain actual content/data
- Focus on layout and positioning
- Should be flexible and reusable

## Component File Structure

Each component should follow this structure:

```
ComponentName/
├── ComponentName.tsx          # Main component file
├── ComponentName.module.css   # Component styles (CSS Modules)
├── ComponentName.test.tsx     # Unit tests
├── ComponentName.stories.tsx  # Storybook stories
├── index.ts                   # Re-export for clean imports
└── types.ts                   # TypeScript interfaces/types (optional)
```

## Naming Conventions

- **Files:** PascalCase (e.g., `Button.tsx`, `FormField.tsx`)
- **Components:** PascalCase (e.g., `Button`, `FormField`)
- **Props interfaces:** `ComponentNameProps` (e.g., `ButtonProps`)
- **CSS Modules:** `ComponentName.module.css`

## Import Structure

Components should be importable cleanly:

```typescript
// Good
import { Button } from '@components/atoms/Button';
import { FormField } from '@components/molecules/FormField';

// Also supported via barrel exports
import { Button, Icon } from '@components/atoms';
```

## Component Guidelines

### Props Design
- Use TypeScript interfaces for all props
- Provide sensible defaults
- Support common HTML attributes via spread
- Use discriminated unions for variants

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

### Styling
- Use CSS Modules for component-specific styles
- Reference design tokens from `/styles`
- Support theme variants (light/dark)
- Avoid hardcoded values

### Accessibility
- Use semantic HTML elements
- Provide ARIA labels when needed
- Support keyboard navigation
- Ensure focus indicators are visible
- Test with screen readers

### Performance
- Use React.memo() for expensive components
- Lazy load heavy components when possible
- Avoid unnecessary re-renders
- Keep bundle sizes small

## Testing

All components should have:
- Unit tests for logic and rendering
- Accessibility tests
- Interaction tests (user events)
- Snapshot tests (when appropriate)

## Documentation

All components should have:
- Storybook stories showing all variants
- JSDoc comments explaining usage
- TypeScript types for props
- Example usage in stories

## Design Tokens

Always use design tokens from `/styles` instead of hardcoded values:

```typescript
import { colors } from '@/styles/tokens';
import { spacing } from '@/styles/spacing';
import { typography } from '@/styles/typography';
import { mediaQueries } from '@/styles/breakpoints';
```

## Related Files

- Design Tokens: `src/styles/tokens.ts`
- Typography: `src/styles/typography.ts`
- Spacing: `src/styles/spacing.ts`
- Breakpoints: `src/styles/breakpoints.ts`
