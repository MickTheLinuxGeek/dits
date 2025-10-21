import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../auth.service';
import { apiClient, setTokens, clearTokens } from '../../lib/api-client';
import { AxiosError } from 'axios';

// Mock the api-client
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('login', () => {
    const mockAuthResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    it('should successfully login and store tokens in localStorage when rememberMe is true', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAuthResponse });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
      expect(setTokens).toHaveBeenCalledWith(
        'mock-access-token',
        'mock-refresh-token',
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should store tokens in sessionStorage when rememberMe is false', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAuthResponse });

      await authService.login({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });

      expect(sessionStorage.getItem('dits_access_token')).toBe(
        'mock-access-token',
      );
      expect(sessionStorage.getItem('dits_refresh_token')).toBe(
        'mock-refresh-token',
      );
      expect(setTokens).not.toHaveBeenCalled();
    });

    it('should throw error with user-friendly message on 401', async () => {
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = { status: 401, data: {} } as any;
      vi.mocked(apiClient.post).mockRejectedValue(axiosError);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
          rememberMe: false,
        }),
      ).rejects.toThrow('Invalid email or password. Please try again.');
    });

    it('should throw error with user-friendly message on 429', async () => {
      const axiosError = new AxiosError('Too Many Requests');
      axiosError.response = { status: 429, data: {} } as any;
      vi.mocked(apiClient.post).mockRejectedValue(axiosError);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        }),
      ).rejects.toThrow('Too many login attempts. Please try again later.');
    });

    it('should throw error with user-friendly message on 500', async () => {
      const axiosError = new AxiosError('Internal Server Error');
      axiosError.response = { status: 500, data: {} } as any;
      vi.mocked(apiClient.post).mockRejectedValue(axiosError);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        }),
      ).rejects.toThrow('Server error. Please try again later.');
    });

    it('should throw server-provided error message when available', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'Custom error message' },
      } as any;
      vi.mocked(apiClient.post).mockRejectedValue(axiosError);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        }),
      ).rejects.toThrow('Custom error message');
    });

    it('should throw network error message on network failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network Error'));

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        }),
      ).rejects.toThrow(
        'Unable to connect. Please check your internet connection.',
      );
    });
  });

  describe('register', () => {
    const mockAuthResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    it('should successfully register and store tokens', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAuthResponse });

      const result = await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(setTokens).toHaveBeenCalledWith(
        'mock-access-token',
        'mock-refresh-token',
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error on 409 (email exists)', async () => {
      const axiosError = new AxiosError('Conflict');
      axiosError.response = { status: 409, data: {} } as any;
      vi.mocked(apiClient.post).mockRejectedValue(axiosError);

      await expect(
        authService.register({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('An account with this email already exists.');
    });

    it('should throw error on 400 (invalid data)', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'Invalid email format' },
      } as any;
      vi.mocked(apiClient.post).mockRejectedValue(axiosError);

      await expect(
        authService.register({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        }),
      ).rejects.toThrow('Invalid email format');
    });
  });

  describe('logout', () => {
    it('should call logout endpoint and clear tokens', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

      await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(clearTokens).toHaveBeenCalled();
    });

    it('should clear tokens even if API call fails', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(
        new Error('Network error'),
      );

      // The logout function will throw but tokens are still cleared in the finally block
      // We need to catch the error to prevent test failure while still checking cleanup
      try {
        await authService.logout();
      } catch (error) {
        // Expected to throw
      }

      expect(clearTokens).toHaveBeenCalled();
    });

    it('should clear sessionStorage tokens', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} });
      sessionStorage.setItem('dits_access_token', 'token');
      sessionStorage.setItem('dits_refresh_token', 'refresh-token');

      await authService.logout();

      expect(sessionStorage.getItem('dits_access_token')).toBeNull();
      expect(sessionStorage.getItem('dits_refresh_token')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should fetch current user', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset request', async () => {
      const mockResponse = { message: 'Password reset email sent' };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await authService.requestPasswordReset({
        email: 'test@example.com',
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/request-password-reset',
        {
          email: 'test@example.com',
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('confirmPasswordReset', () => {
    it('should confirm password reset with valid token', async () => {
      const mockResponse = { message: 'Password reset successful' };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await authService.confirmPasswordReset({
        token: 'valid-token',
        newPassword: 'newPassword123',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'valid-token',
        newPassword: 'newPassword123',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on invalid token (401)', async () => {
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = { status: 401, data: {} } as any;
      vi.mocked(apiClient.post).mockRejectedValue(axiosError);

      await expect(
        authService.confirmPasswordReset({
          token: 'invalid-token',
          newPassword: 'newPassword123',
        }),
      ).rejects.toThrow(
        'Invalid or expired reset token. Please request a new password reset.',
      );
    });

    it('should throw error on invalid password (400)', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'Password too weak' },
      } as any;
      vi.mocked(apiClient.post).mockRejectedValue(axiosError);

      await expect(
        authService.confirmPasswordReset({
          token: 'valid-token',
          newPassword: 'weak',
        }),
      ).rejects.toThrow('Password too weak');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const mockResponse = {
        message: 'Email verified successfully',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await authService.verifyEmail({ token: 'valid-token' });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/verify-email', {
        token: 'valid-token',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email', async () => {
      const mockResponse = { message: 'Verification email sent' };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await authService.resendVerificationEmail();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/verify-email/resend');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token and store new tokens', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await authService.refreshToken('old-refresh-token');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old-refresh-token',
      });
      expect(setTokens).toHaveBeenCalledWith(
        'new-access-token',
        'new-refresh-token',
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
