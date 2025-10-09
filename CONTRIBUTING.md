# Contributing to DITS

Thank you for contributing to the Developer Issue Tracking System!

## Development Workflow

### Prerequisites

- Node.js 18.x or 20.x
- PostgreSQL 15+
- Redis 7+
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/MickTheLinuxGeek/dits.git
   cd dits
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. (Optional) Seed the database:
   ```bash
   npm run db:seed
   ```

## Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality before commits and pushes.

### Pre-commit Hook

When you run `git commit`, the following checks run automatically on staged files:

1. **ESLint** - Automatically fixes and checks for code quality issues
2. **Prettier** - Automatically formats code
3. **TypeScript** - Type checks all TypeScript files

If any check fails, the commit will be aborted. Fix the errors and try again.

### Pre-push Hook

When you run `git push`, the following checks run on the entire codebase:

1. **Type Check** (`npm run type-check`) - Ensures no TypeScript errors
2. **Linting** (`npm run lint`) - Checks code quality
3. **Format Check** (`npm run format:check`) - Ensures code is properly formatted
4. **Build** (`npm run build`) - Compiles TypeScript to ensure no build errors

If any check fails, the push will be aborted. This matches the GitHub CI checks.

### Running Checks Manually

You can run these checks manually at any time:

```bash
# Run all CI checks (same as pre-push)
npm run ci:check

# Individual checks
npm run type-check    # TypeScript type checking
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run format:check  # Check Prettier formatting
npm run format        # Auto-format with Prettier
npm run build         # Build TypeScript
npm run test          # Run tests
npm run test:coverage # Run tests with coverage
```

### Skipping Hooks (Not Recommended)

In rare cases where you need to skip hooks:

```bash
# Skip pre-commit hook
git commit --no-verify -m "message"

# Skip pre-push hook
git push --no-verify
```

**Warning:** Only use `--no-verify` when absolutely necessary. The CI will still run these checks on GitHub, and your PR will fail if there are issues.

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in `tsconfig.json`
- Avoid using `any` unless absolutely necessary (use `unknown` instead)
- Document public APIs with JSDoc comments
- Use meaningful variable and function names

### Naming Conventions

- **Files**: `camelCase.ts` for modules, `PascalCase.tsx` for React components
- **Variables/Functions**: `camelCase`
- **Classes/Interfaces/Types**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private properties**: prefix with underscore `_privateProperty`

### Code Organization

```
src/
├── auth/          # Authentication logic
├── config/        # Configuration
├── database/      # Database connections
├── middleware/    # Express middleware
├── routes/        # API routes
├── services/      # Business logic services
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Testing

### Writing Tests

- Write tests for all new features
- Place tests next to the code they test: `myModule.test.ts`
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example:
```typescript
describe('JWT Token Generation', () => {
  it('should generate a valid access token', () => {
    // Arrange
    const userId = 'test-user-id';
    const email = 'test@example.com';

    // Act
    const token = generateAccessToken(userId, email);

    // Assert
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

## Database Migrations

### Creating a Migration

```bash
# Create a new migration
npm run db:migrate

# Reset database (caution: deletes all data)
npm run db:reset

# Open Prisma Studio to view/edit data
npm run db:studio
```

### Migration Best Practices

- Write reversible migrations when possible
- Test migrations on a copy of production data
- Include both up and down migrations
- Document breaking changes

## Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes** with clear, logical commits

3. **Run checks locally**:
   ```bash
   npm run ci:check
   ```

4. **Push your branch**:
   ```bash
   git push origin feature/my-feature
   ```

5. **Create a Pull Request** on GitHub

6. **Address review feedback** if needed

7. **Merge** once approved and CI passes

### Pull Request Guidelines

- Write a clear PR description explaining what and why
- Reference related issues: `Fixes #123` or `Relates to #456`
- Keep PRs focused and reasonably sized
- Update documentation if needed
- Add tests for new features
- Ensure CI passes before requesting review

## Common Issues

### "Pre-commit hook failed"

The pre-commit hook ran checks and found issues. Fix them:

```bash
# Auto-fix what can be fixed
npm run lint:fix
npm run format

# Check for remaining issues
npm run type-check
```

### "Pre-push hook failed"

Run the full CI check suite to see all errors:

```bash
npm run ci:check
```

Then fix the reported issues.

### TypeScript Errors

```bash
# Check types
npm run type-check

# Build to see compilation errors
npm run build
```

### Formatting Issues

```bash
# Auto-format all files
npm run format

# Check what would be formatted
npm run format:check
```

## Getting Help

- Check existing [Issues](https://github.com/MickTheLinuxGeek/dits/issues)
- Read the [Documentation](./README.md)
- Ask in the GitHub Discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
