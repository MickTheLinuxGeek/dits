# Testing Guide

This document describes the testing approach, conventions, and guidelines for the DITS project.

## Overview

The DITS project follows a comprehensive testing strategy with three main layers:

- **Unit Tests (70%)**: Test individual components in isolation
- **Integration Tests (20%)**: Test interactions between components
- **End-to-End Tests (10%)**: Test complete user workflows

Current testing coverage focuses on the backend API services and middleware.

## Test Framework

- **Test Runner**: Jest
- **TypeScript Support**: ts-jest
- **Assertions**: Jest built-in matchers
- **Mocking**: Jest mocks

## Project Structure

```
src/
├── services/
│   ├── __tests__/
│   │   └── issueService.test.ts    # Service layer tests
│   └── issueService.ts
├── middleware/
│   ├── __tests__/
│   │   └── auth.test.ts            # Middleware tests
│   └── auth.ts
└── routes/
    ├── __tests__/                  # Future: API route tests
    └── issues.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/services/__tests__/issueService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create issue"
```

## Testing Conventions

### File Naming

- Test files use `.test.ts` suffix
- Test files are located in `__tests__` directories adjacent to the code they test
- Test file names mirror the source file names (e.g., `issueService.ts` → `issueService.test.ts`)

### Test Structure

Tests follow the Arrange-Act-Assert (AAA) pattern:

```typescript
it('should perform expected behavior', () => {
  // Arrange - Set up test data and mocks
  const mockData = { /* ... */ };
  mockFunction.mockResolvedValue(mockData);
  
  // Act - Execute the function under test
  const result = await functionUnderTest(input);
  
  // Assert - Verify expected outcomes
  expect(result).toEqual(expectedOutput);
  expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
});
```

### Describe Blocks

Use nested `describe` blocks to organize tests logically:

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should handle success case', () => { /* ... */ });
    it('should handle error case', () => { /* ... */ });
  });
});
```

## Current Test Coverage

### 1. Issue Service Tests (`src/services/__tests__/issueService.test.ts`)

**Coverage:**
- ✅ Creating issues with validation
- ✅ Creating issues with labels
- ✅ Fetching issues by ID
- ✅ Fetching non-existent issues
- ✅ Listing issues with filters (status, priority, project)
- ✅ Listing issues with pagination
- ✅ Updating issues
- ✅ Deleting issues
- ✅ Counting issues with filters

**Key Testing Patterns:**
- Mocking Prisma client methods
- Testing validation logic
- Testing error handling
- Testing filtering and pagination
- Verifying database queries

**Example:**
```typescript
describe('createIssue', () => {
  it('should create issue with labels', async () => {
    const issueData = {
      title: 'Test Issue',
      userId: 'user-123',
      labelIds: ['label-1', 'label-2'],
    };
    
    prismaMock.issue.create.mockResolvedValue(mockIssue);
    
    const result = await createIssue(issueData);
    
    expect(result).toEqual(mockIssue);
    expect(prismaMock.issue.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Test Issue',
        labels: {
          connect: [{ id: 'label-1' }, { id: 'label-2' }],
        },
      }),
      include: expect.any(Object),
    });
  });
});
```

### 2. Authentication Middleware Tests (`src/middleware/__tests__/auth.test.ts`)

**Coverage:**
- ✅ `requireAuth` middleware
  - Valid JWT token authentication
  - Missing authorization header
  - Invalid header format
  - Token verification failures
  - Expired tokens
- ✅ `optionalAuth` middleware
  - Valid token with user data attached
  - No token (continues without user)
  - Invalid token (continues without user)
- ✅ `getUserId` helper function

**Key Testing Patterns:**
- Mocking Express Request/Response objects
- Mocking JWT verification
- Testing middleware flow (next() calls)
- Testing error responses (401 Unauthorized)
- Testing request augmentation (userId, userEmail)

**Example:**
```typescript
describe('requireAuth', () => {
  it('should call next() with valid token', () => {
    const mockPayload = {
      userId: 'user-123',
      email: 'test@example.com',
      type: 'access' as const,
      iat: Date.now(),
      exp: Date.now() + 3600,
    };

    mockRequest.headers = {
      authorization: 'Bearer valid-token',
    };

    (verifyAccessToken as jest.Mock).mockReturnValue(mockPayload);

    requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(verifyAccessToken).toHaveBeenCalledWith('valid-token');
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest).toHaveProperty('userId', 'user-123');
  });
});
```

## Mocking Strategies

### Prisma Client Mocking

We use a singleton mock pattern for Prisma:

```typescript
// src/__mocks__/prismaClient.ts
const prismaMock = {
  issue: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  // ... other models
} as unknown as PrismaClient;

export default prismaMock;
```

### Module Mocking

Use `jest.mock()` to mock dependencies:

```typescript
jest.mock('../prismaClient');
jest.mock('../../auth/jwt');

// In tests:
(verifyAccessToken as jest.Mock).mockReturnValue(mockData);
```

### Request/Response Mocking

Mock Express objects for middleware tests:

```typescript
let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
let nextFunction: jest.Mock;

beforeEach(() => {
  mockRequest = { headers: {} };
  mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  nextFunction = jest.fn();
});
```

## Best Practices

### 1. Clear Test Names

Use descriptive test names that explain what is being tested:

```typescript
// ✅ Good
it('should return 401 when authorization header is missing', () => { /* ... */ });

// ❌ Bad
it('test auth', () => { /* ... */ });
```

### 2. Test One Thing at a Time

Each test should verify a single behavior:

```typescript
// ✅ Good
it('should create issue with title', async () => { /* ... */ });
it('should create issue with labels', async () => { /* ... */ });

// ❌ Bad
it('should create issue', async () => {
  // Tests multiple things: title, labels, validation, etc.
});
```

### 3. Use beforeEach for Setup

Reset mocks and setup common test data in `beforeEach`:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  // Setup common test data
});
```

### 4. Test Error Cases

Always test error handling:

```typescript
it('should throw error when issue not found', async () => {
  prismaMock.issue.findUnique.mockResolvedValue(null);
  
  await expect(getIssueById('non-existent')).rejects.toThrow('Issue not found');
});
```

### 5. Verify Mock Calls

Check that mocked functions are called with correct arguments:

```typescript
expect(prismaMock.issue.create).toHaveBeenCalledWith({
  data: expect.objectContaining({
    title: 'Expected Title',
  }),
});
```

## TypeScript Considerations

### Type Casting in Tests

When mocking partial objects, use type assertions carefully:

```typescript
// For simple objects
const req = { userId: 'user-123' } as unknown as Request;

// For complex mocks
const mockRequest: Partial<Request> = {
  headers: { authorization: 'Bearer token' },
};
```

### Mock Typing

Type mocks appropriately to get IDE support:

```typescript
import { mocked } from 'jest-mock';

const mockFunction = mocked(originalFunction);
mockFunction.mockReturnValue(/* ... */);
```

## Future Testing Scope

### Planned Test Coverage

1. **API Routes** (Integration Tests)
   - Request/response validation
   - Authentication flow
   - Error handling
   - Response formatting

2. **Additional Services**
   - projectService.ts
   - areaService.ts
   - labelService.ts
   - workflowService.ts

3. **E2E Tests**
   - Complete user workflows
   - API contract testing
   - Database state verification

### CI/CD Integration

Tests will be integrated into the CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm test -- --coverage --ci
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Coverage Goals

- **Overall Coverage**: 80%+
- **Unit Tests**: 70%
- **Integration Tests**: 20%
- **E2E Tests**: 10%

Current status: Foundation tests in place for services and middleware layers.

## Troubleshooting

### Common Issues

**Issue**: "Cannot find module" errors
**Solution**: Ensure `moduleNameMapper` is configured in `jest.config.js`

**Issue**: Prisma client not mocked
**Solution**: Check that `src/__mocks__/prismaClient.ts` exists and exports the mock

**Issue**: TypeScript type errors in tests
**Solution**: Use `as unknown as Type` for complex type assertions

**Issue**: Tests timing out
**Solution**: Ensure async operations use `await` and promises are resolved

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing TypeScript](https://jestjs.io/docs/getting-started#using-typescript)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing/unit-testing)

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before committing
3. Maintain or improve coverage percentage
4. Follow existing test patterns and conventions
5. Update this documentation for new testing patterns
