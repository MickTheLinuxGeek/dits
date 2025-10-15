# Design System & Styling Guide

This directory contains the DITS design system tokens and styling utilities.

## Design Tokens

Design tokens are the foundation of the design system. They provide consistent values for colors, typography, spacing, and more.

### Files

- `tokens.ts` - Color palette and theme tokens (light/dark themes)
- `typography.ts` - Typography system (fonts, sizes, weights, presets)
- `spacing.ts` - Spacing scale, layout utilities, and grid system
- `breakpoints.ts` - Responsive breakpoints and media query utilities

## Using Design Tokens

Always use design tokens instead of hardcoded values:

```typescript
import { colors, lightTheme, darkTheme } from '@styles/tokens';
import { spacing, borderRadius } from '@styles/spacing';
import { typography, fontSizes } from '@styles/typography';
import { mediaQueries, breakpointValues } from '@styles/breakpoints';

// In your component styles
const styles = {
  button: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: fontSizes.sm,
    borderRadius: borderRadius.md,
    backgroundColor: lightTheme.semantic.primary,
  },
};
```

## CSS Modules

DITS uses CSS Modules for component styling. CSS Modules provide:
- Scoped CSS class names (no conflicts)
- TypeScript support
- Better performance than CSS-in-JS
- Familiar CSS syntax

### Naming Convention

Component styles should use the `.module.css` extension:
- `Button.module.css`
- `FormField.module.css`
- `IssueList.module.css`

### Class Naming

Use camelCase for class names (automatically converted by Vite):

```css
/* Button.module.css */
.button {
  /* base styles */
}

.buttonPrimary {
  /* primary variant */
}

.buttonLarge {
  /* large size */
}
```

Import and use in TypeScript:

```typescript
import styles from './Button.module.css';

<button className={styles.button}>Click me</button>
<button className={`${styles.button} ${styles.buttonPrimary}`}>Primary</button>
```

### Using Design Tokens in CSS Modules

Reference design tokens using CSS custom properties or import them as JavaScript:

**Option 1: CSS Variables (Recommended)**

First, define CSS variables in a global file:

```css
/* global.css */
:root {
  --color-primary: #2563eb;
  --spacing-4: 1rem;
  --border-radius-md: 0.375rem;
}
```

Then use in CSS Modules:

```css
/* Button.module.css */
.button {
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  background-color: var(--color-primary);
}
```

**Option 2: Import Tokens (For Dynamic Styles)**

```typescript
import { spacing } from '@styles/spacing';
import styles from './Button.module.css';

const Button = ({ size = 'md' }) => {
  const style = {
    padding: size === 'lg' ? spacing[6] : spacing[4],
  };
  
  return <button className={styles.button} style={style}>Click</button>;
};
```

### Composing Classes

Use the `classnames` utility or template strings for conditional classes:

```typescript
import styles from './Button.module.css';

// Template string
<button 
  className={`${styles.button} ${variant === 'primary' ? styles.buttonPrimary : ''}`}
>

// Or install 'clsx' for cleaner syntax:
import clsx from 'clsx';

<button 
  className={clsx(
    styles.button,
    variant === 'primary' && styles.buttonPrimary,
    size === 'large' && styles.buttonLarge,
    disabled && styles.buttonDisabled
  )}
>
```

### Global vs Module Styles

**Global styles** (`index.css`):
- CSS resets
- Base HTML element styles
- CSS custom properties (variables)
- Font imports
- Global utilities (use sparingly)

**Module styles** (`.module.css`):
- Component-specific styles
- Scoped to component
- Use design tokens
- Avoid global selectors

### Theming with CSS Modules

Use CSS custom properties for theming:

```css
/* App.module.css */
.app[data-theme='light'] {
  --bg-primary: #ffffff;
  --text-primary: #111827;
}

.app[data-theme='dark'] {
  --bg-primary: #030712;
  --text-primary: #f9fafb;
}

.container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

### Responsive Styles

Use media queries directly in CSS Modules:

```css
/* IssueList.module.css */
.list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .list {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .list {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Best Practices

1. **One CSS Module per component**: Keep styles close to components
2. **Use design tokens**: Never hardcode colors, spacing, etc.
3. **Mobile-first**: Start with mobile styles, add breakpoints for larger screens
4. **Avoid nesting**: Keep selectors flat for better performance
5. **Use semantic class names**: `.button`, not `.btn` or `.b1`
6. **Avoid !important**: Structure CSS to avoid specificity wars
7. **Keep files small**: If CSS file is large, consider splitting component
8. **Document complex styles**: Add comments for non-obvious CSS

### Performance Tips

- Keep selectors simple (avoid deep nesting)
- Use CSS containment for isolated components
- Avoid expensive properties (filters, shadows on large areas)
- Use `will-change` sparingly and only when needed
- Consider using `transform` and `opacity` for animations (GPU accelerated)

## File Organization

```
styles/
├── README.md           # This file
├── tokens.ts          # Color tokens and themes
├── typography.ts      # Typography system
├── spacing.ts         # Spacing and layout
├── breakpoints.ts     # Responsive breakpoints
└── global.css         # Global styles (if needed)

components/
└── atoms/
    └── Button/
        ├── Button.tsx
        ├── Button.module.css    # Component styles
        ├── Button.test.tsx
        └── index.ts
```

## Resources

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Vite CSS Guide](https://vitejs.dev/guide/features.html#css)
- [Modern CSS](https://moderncss.dev/)
