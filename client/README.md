# DITS Client

Frontend application for DITS (Developer Issue Tracking System) - a purpose-built issue tracker designed for individual software developers.

Built with React, TypeScript, and Vite.

## Features

- 🎯 **Main Dashboard**: Sidebar navigation with Smart Views, Projects, and Areas
- 📋 **Issue Management**: Create, view, and manage issues with labels, priorities, and statuses
- 🔍 **Search**: Fast search across all issues
- ⌨️ **Keyboard Shortcuts**: Power user features (C for new issue, Cmd/Ctrl+K for search)
- 🎨 **Modern UI**: Clean, minimal design with smooth animations
- 📱 **Responsive**: Works on desktop screens (1280px+)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix

# Type checking
npm run type-check
```

### Storybook

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## Mock Data

The application uses mock data for development. This allows frontend development to proceed independently of backend implementation.

### Environment Variables

Control mock data usage with the `VITE_USE_MOCK_DATA` environment variable:

```env
# .env.development
VITE_USE_MOCK_DATA=true

# .env.production  
VITE_USE_MOCK_DATA=false
```

- **Development**: Mock data is enabled by default
- **Production**: Mock data is disabled by default

### Mock Data Structure

Mock data is located in `src/mocks/`:

- `types.ts` - TypeScript interfaces (Issue, Project, Area, Label)
- `issues.ts` - Sample issues for all views
- `projects.ts` - Sample projects
- `areas.ts` - Sample areas
- `navigation.ts` - Navigation counts (dynamically calculated)
- `index.ts` - Central export point

### Using Mock Data

Components import mock data directly:

```typescript
import { mockIssues, mockProjects, mockAreas } from '../mocks';
```

When backend API is ready, replace with API calls:

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchIssues } from '../services/api';

const { data: issues } = useQuery(['issues'], fetchIssues);
```

## Keyboard Shortcuts

- `C` - Create new issue
- `Cmd/Ctrl+K` - Focus search bar

## Project Structure

```
src/
├── components/          # React components
│   ├── atoms/          # Atomic components (Button, Input, etc.)
│   ├── molecules/      # Molecule components
│   ├── organisms/      # Organism components
│   ├── templates/      # Template components
│   ├── layout/         # Layout components (Sidebar, Header, etc.)
│   ├── ui/             # UI components (Label, Badge, etc.)
│   ├── issues/         # Issue-related components
│   └── auth/           # Authentication components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── mocks/              # Mock data
├── services/           # API services
├── store/              # State management (Zustand)
├── router/             # Routing configuration
└── lib/                # Utilities and helpers
```

## Component Documentation

All components include:

- **TypeScript interfaces** for props
- **JSDoc comments** describing component purpose
- **Storybook stories** demonstrating usage
- **Unit tests** for core functionality

View component documentation in Storybook:

```bash
npm run storybook
```

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
