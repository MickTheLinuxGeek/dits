# Authentication Usage Guide

Quick reference for using the authentication system in DITS.

## For Developers

### Protecting Routes

Wrap any component that requires authentication with `ProtectedRoute`:

```tsx
import { ProtectedRoute } from './components/auth';

<Route 
  path="/protected" 
  element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  } 
/>
```

### Using Auth State

Access authentication state using the Zustand store:

```tsx
import { useAppStore } from './store';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAppStore();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Welcome, {user?.name}!</div>;
}
```

### Logout Functionality

Use the `useLogout` hook:

```tsx
import { useLogout } from './hooks/useLogout';

function LogoutButton() {
  const { logout, isLoggingOut } = useLogout();
  
  return (
    <button onClick={logout} disabled={isLoggingOut}>
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

### Making Authenticated API Calls

Use the configured `apiClient`:

```tsx
import { apiClient } from './lib/api-client';

// Tokens are automatically attached to requests
const response = await apiClient.get('/api/issues');
const issues = response.data;

// Token refresh is handled automatically on 401 errors
```

### Using Auth Service Methods

```tsx
import { authService } from './services/auth.service';
import { useAppStore } from './store';

// Login
const handleLogin = async () => {
  try {
    const result = await authService.login({
      email: 'user@example.com',
      password: 'password',
      rememberMe: true
    });
    useAppStore.getState().setUser(result.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Register
const handleRegister = async () => {
  try {
    const result = await authService.register({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'password'
    });
    useAppStore.getState().setUser(result.user);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Get current user
const getCurrentUser = async () => {
  try {
    const user = await authService.getCurrentUser();
    useAppStore.getState().setUser(user);
  } catch (error) {
    console.error('Failed to get user:', error);
  }
};

// Request password reset
const requestReset = async () => {
  try {
    await authService.requestPasswordReset({
      email: 'user@example.com'
    });
    console.log('Reset email sent');
  } catch (error) {
    console.error('Failed to request reset:', error);
  }
};

// Confirm password reset
const confirmReset = async (token: string) => {
  try {
    await authService.confirmPasswordReset({
      token,
      password: 'newPassword'
    });
    console.log('Password reset successful');
  } catch (error) {
    console.error('Failed to reset password:', error);
  }
};

// Verify email
const verifyEmail = async (token: string) => {
  try {
    const result = await authService.verifyEmail({ token });
    useAppStore.getState().setUser(result.user);
  } catch (error) {
    console.error('Failed to verify email:', error);
  }
};

// Resend verification email
const resendVerification = async () => {
  try {
    await authService.resendVerificationEmail();
    console.log('Verification email sent');
  } catch (error) {
    console.error('Failed to resend verification:', error);
  }
};
```

## Routes

### Public Routes
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Request password reset
- `/auth/reset-password?token=XXX` - Confirm password reset
- `/auth/verify-email?token=XXX` - Verify email address

### Protected Routes
All routes under `/` (inbox, today, upcoming, etc.) are protected and require authentication.

## Environment Variables

Set in `.env.development` or `.env.production`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Token Storage

### Persistent Sessions (Remember Me)
When user checks "Remember Me":
- Tokens stored in `localStorage`
- Session persists across browser restarts

### Non-Persistent Sessions
When user doesn't check "Remember Me":
- Tokens stored in `sessionStorage`
- Session cleared when browser is closed

## Error Handling

All auth operations return proper error messages:

```tsx
import { useMutation } from '@tanstack/react-query';
import { authService } from './services/auth.service';

const loginMutation = useMutation({
  mutationFn: authService.login,
  onError: (error: Error) => {
    // Error object contains message
    console.error(error.message);
  }
});
```

## Security Best Practices

1. **Never log or expose tokens** - They're automatically managed
2. **Use HTTPS in production** - Set proper VITE_API_URL
3. **Validate forms** - Client-side validation is implemented
4. **Handle errors gracefully** - Show user-friendly messages
5. **Clear tokens on logout** - Handled automatically

## TypeScript Types

All types are exported from `services/auth.service.ts`:

```tsx
import type { 
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerification
} from './services/auth.service';
```

## Testing

When testing authentication:

1. Mock the `authService`:
```tsx
jest.mock('./services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    // ... other methods
  }
}));
```

2. Mock the Zustand store:
```tsx
import { useAppStore } from './store';

// Set test state
useAppStore.setState({ 
  isAuthenticated: true, 
  user: { id: '1', email: 'test@example.com', name: 'Test User' } 
});
```

## Troubleshooting

### Infinite redirect loops
- Check if `ProtectedRoute` is properly wrapping components
- Verify tokens are being stored correctly
- Check browser console for errors

### Token not being sent
- Verify `apiClient` is being used (not plain axios)
- Check that API URL is correctly configured
- Inspect network requests in browser DevTools

### 401 errors not triggering refresh
- Check that response interceptor is registered
- Verify refresh token exists in storage
- Check backend `/auth/refresh` endpoint

### User state not persisting
- Verify `useAuthInit` hook is called in App.tsx
- Check browser localStorage/sessionStorage
- Ensure tokens haven't expired
