import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../LoginForm';
import { authService } from '../../../services/auth.service';

// Mock the auth service
vi.mock('../../../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock the store
const mockSetUser = vi.fn();
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

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginForm - Validation Logic', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    mockSetUser.mockClear();
    mockNavigate.mockClear();
  });

  const renderLoginForm = (props = {}) => {
    return render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <LoginForm {...props} />
        </QueryClientProvider>
      </BrowserRouter>,
    );
  };

  it('should render login form with all fields', () => {
    renderLoginForm();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /remember me/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should display error when submitting empty form', async () => {
    renderLoginForm();

    const form = screen
      .getByRole('button', { name: /login/i })
      .closest('form')!;
    // Use fireEvent to bypass HTML5 validation
    fireEvent.submit(form);

    // Error is set synchronously in the submit handler
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please fill in all fields');
  });

  it('should display error when email is missing', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'password123');

    const form = screen
      .getByRole('button', { name: /login/i })
      .closest('form')!;
    // Use fireEvent to bypass HTML5 validation
    fireEvent.submit(form);

    // Error is set synchronously in the submit handler
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please fill in all fields');
  });

  it('should display error when password is missing', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    const form = screen
      .getByRole('button', { name: /login/i })
      .closest('form')!;
    // Use fireEvent to bypass HTML5 validation
    fireEvent.submit(form);

    // Error is set synchronously in the submit handler
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please fill in all fields');
  });

  it('should call authService.login with correct credentials', async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });
  });

  it('should include rememberMe when checkbox is checked', async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByRole('checkbox', {
      name: /remember me/i,
    });
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(rememberMeCheckbox);
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });
  });

  it('should display error message when login fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid email or password. Please try again.';

    vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage));

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  it('should disable form inputs while submitting', async () => {
    const user = userEvent.setup();

    // Mock a delayed response
    vi.mocked(authService.login).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                user: {
                  id: '1',
                  email: 'test@example.com',
                  name: 'Test User',
                  emailVerified: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
              }),
            100,
          ),
        ),
    );

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByRole('checkbox', {
      name: /remember me/i,
    });
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Check that inputs are disabled during submission
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(rememberMeCheckbox).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Logging in...');
  });

  it('should navigate to /inbox after successful login', async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/inbox');
    });
  });

  it('should call onSuccess callback when provided', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const mockAuthResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);

    renderLoginForm({ onSuccess });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
