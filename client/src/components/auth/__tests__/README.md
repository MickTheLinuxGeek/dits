# Auth Component Tests

This directory contains comprehensive unit tests for the authentication components.

## Test Files

### LoginForm.test.tsx
Tests for the LoginForm component including:
- **Form Rendering**: Verifies all form fields are rendered correctly
- **Validation Logic**: Tests empty form, missing email, and missing password validation
- **API Integration**: Tests successful login with correct credentials
- **Remember Me**: Tests token storage behavior based on rememberMe checkbox
- **Error Handling**: Tests display of error messages for various failure scenarios
- **Loading States**: Tests form disabling during submission
- **Navigation**: Tests redirect to /inbox after successful login
- **Callbacks**: Tests custom onSuccess callback when provided

**Coverage**: 100% statements, 94.44% branches, 100% functions, 100% lines

### RegisterForm.test.tsx
Tests for the RegisterForm component including:
- **Form Rendering**: Verifies all registration fields are present
- **Validation Logic**: 
  - Tests empty form validation
  - Tests missing name validation
  - Tests password length validation (minimum 8 characters)
  - Tests password match validation
- **API Integration**: Tests successful registration with correct data
- **Error Handling**: Tests error messages for duplicate emails and invalid data
- **Loading States**: Tests form disabling during submission
- **Navigation**: Tests redirect to verify-email page after successful registration
- **Callbacks**: Tests custom onSuccess callback when provided

**Coverage**: 100% statements, 96% branches, 100% functions, 100% lines

### ProtectedRoute.test.tsx
Tests for the ProtectedRoute component including:
- **Unauthenticated Access**: Tests redirect to login page when user is not authenticated
- **Authenticated Access**: Tests rendering of protected content when authenticated
- **Loading States**: Tests loading indicator during authentication initialization
- **State Transitions**: 
  - Tests transition from initializing to authenticated
  - Tests transition from initializing to unauthenticated
- **Nested Routes**: Tests handling of nested protected routes
- **Multiple Children**: Tests rendering of multiple child components

**Coverage**: 100% statements, 100% branches, 100% functions, 100% lines

## Service Tests

### auth.service.test.ts
Tests for the AuthService including:

#### Login Tests
- Successful login with rememberMe enabled (localStorage)
- Successful login with rememberMe disabled (sessionStorage)
- Error handling for 401 (invalid credentials)
- Error handling for 429 (rate limiting)
- Error handling for 500+ (server errors)
- Custom error message handling
- Network error handling

#### Register Tests
- Successful registration and token storage
- Error handling for 409 (email already exists)
- Error handling for 400 (invalid data)

#### Logout Tests
- Successful logout and token clearing
- Token clearing even when API call fails
- SessionStorage token clearing

#### Other Methods
- getCurrentUser - fetching current user data
- requestPasswordReset - sending password reset request
- confirmPasswordReset - confirming password reset with token
- verifyEmail - verifying email with token
- resendVerificationEmail - resending verification email
- refreshToken - refreshing access token

**Coverage**: 84.66% statements, 81.81% branches, 100% functions, 84.66% lines

## Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Setup

The tests use the following testing libraries:
- **Vitest**: Test runner
- **@testing-library/react**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom jest matchers for DOM

Test setup is configured in `client/vitest.setup.ts` which includes:
- Automatic cleanup after each test
- Mock implementations for browser APIs (matchMedia, IntersectionObserver, ResizeObserver)

## Mock Strategy

### Store Mocking
The Zustand store is mocked using a selector function pattern to properly handle the `useAppStore((state) => state.property)` syntax:

```typescript
const mockStore = {
  setUser: mockSetUser,
  isAuthenticated: false,
  user: null,
};

vi.mock('../../../store', () => ({
  useAppStore: vi.fn((selector) => {
    if (selector) {
      return selector(mockStore);
    }
    return mockStore;
  }),
}));
```

### API Client Mocking
The axios-based API client is fully mocked to avoid actual HTTP requests:

```typescript
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}));
```

### Router Mocking
React Router's navigation is mocked to verify redirects:

```typescript
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
```

## Key Testing Patterns

### Form Validation Testing
Form validation tests use `fireEvent.submit()` to bypass HTML5 validation and directly test JavaScript validation logic:

```typescript
const form = screen.getByRole('button', { name: /login/i }).closest('form')!;
fireEvent.submit(form);
const alert = await screen.findByRole('alert');
expect(alert).toHaveTextContent('Please fill in all fields');
```

### Async Operation Testing
Async operations are tested using `waitFor` or `findBy` queries:

```typescript
await user.type(emailInput, 'test@example.com');
await user.click(submitButton);
await waitFor(() => {
  expect(mockNavigate).toHaveBeenCalledWith('/inbox');
});
```

### Error State Testing
Error states from API failures are tested by mocking rejected promises:

```typescript
vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));
await user.click(submitButton);
const alert = await screen.findByRole('alert');
expect(alert).toHaveTextContent('Invalid credentials');
```

## Future Improvements

Potential areas for additional test coverage:
- ForgotPasswordForm component tests
- ResetPasswordForm component tests
- VerifyEmail component tests
- api-client interceptor tests (token refresh logic)
- useAuthInit hook tests
- useLogout hook tests
