import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterForm } from '../RegisterForm';
import { authService } from '../../../services/auth.service';

// Mock the auth service
vi.mock('../../../services/auth.service', () => ({
  authService: {
    register: vi.fn(),
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

describe('RegisterForm - Validation Logic', () => {
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

  const renderRegisterForm = (props = {}) => {
    return render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <RegisterForm {...props} />
        </QueryClientProvider>
      </BrowserRouter>,
    );
  };

  it('should render registration form with all fields', () => {
    renderRegisterForm();

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('should display error when submitting empty form', async () => {
    renderRegisterForm();

    const form = screen
      .getByRole('button', { name: /create account/i })
      .closest('form')!;
    // Use fireEvent to bypass HTML5 validation
    fireEvent.submit(form);

    // Error is set synchronously in the submit handler
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please fill in all fields');
  });

  it('should display error when name is missing', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');

    const form = screen
      .getByRole('button', { name: /create account/i })
      .closest('form')!;
    // Use fireEvent to bypass HTML5 validation
    fireEvent.submit(form);

    // Error is set synchronously in the submit handler
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please fill in all fields');
  });

  it('should display error when password is less than 8 characters', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const nameInput = screen.getByLabelText(/^name$/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Pass1!');
    await user.type(confirmPasswordInput, 'Pass1!');

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Password must be at least 8 characters long',
      );
    });
  });

  it('should display error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const nameInput = screen.getByLabelText(/^name$/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'DifferentPassword123!');

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Passwords do not match',
      );
    });
  });

  it('should call authService.register with correct data', async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(authService.register).mockResolvedValue(mockAuthResponse);

    renderRegisterForm();

    const nameInput = screen.getByLabelText(/^name$/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });
    });
  });

  it('should navigate to verify-email after successful registration', async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(authService.register).mockResolvedValue(mockAuthResponse);

    renderRegisterForm();

    const nameInput = screen.getByLabelText(/^name$/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/verify-email');
    });
  });

  it('should display error message when registration fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'An account with this email already exists.';

    vi.mocked(authService.register).mockRejectedValue(new Error(errorMessage));

    renderRegisterForm();

    const nameInput = screen.getByLabelText(/^name$/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  it('should disable form inputs while submitting', async () => {
    const user = userEvent.setup();

    // Mock a delayed response
    vi.mocked(authService.register).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                user: {
                  id: '1',
                  email: 'test@example.com',
                  name: 'Test User',
                  emailVerified: false,
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

    renderRegisterForm();

    const nameInput = screen.getByLabelText(/^name$/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    await user.click(submitButton);

    // Check that inputs are disabled during submission
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Creating account...');
  });

  it('should call onSuccess callback when provided', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const mockAuthResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(authService.register).mockResolvedValue(mockAuthResponse);

    renderRegisterForm({ onSuccess });

    const nameInput = screen.getByLabelText(/^name$/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
