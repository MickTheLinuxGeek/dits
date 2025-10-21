import { apiClient, setTokens, clearTokens } from '../lib/api-client';
import { AxiosError } from 'axios';

/**
 * User interface matching backend response
 */
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data interface
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

/**
 * Password reset request interface
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation interface
 */
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

/**
 * Email verification interface
 */
export interface EmailVerification {
  token: string;
}

/**
 * Authentication service providing all auth-related API methods
 */
export const authService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials,
      );
      const { accessToken, refreshToken } = response.data;

      // Store tokens in appropriate storage based on rememberMe
      if (credentials.rememberMe) {
        setTokens(accessToken, refreshToken);
      } else {
        // Use sessionStorage for non-persistent sessions
        sessionStorage.setItem('dits_access_token', accessToken);
        sessionStorage.setItem('dits_refresh_token', refreshToken);
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        // Handle specific HTTP status codes with user-friendly messages
        const status = error.response.status;
        if (status === 401) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        } else if (status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (error.response.data?.message) {
          // Use server-provided error message if available
          throw new Error(error.response.data.message);
        }
      }
      // For network errors or unexpected errors
      throw new Error(
        'Unable to connect. Please check your internet connection.',
      );
    }
  },

  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        data,
      );
      const { accessToken, refreshToken } = response.data;
      console.log('[AuthService] Registration response:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      });
      setTokens(accessToken, refreshToken);
      console.log('[AuthService] Tokens saved to localStorage');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        // Handle specific HTTP status codes with user-friendly messages
        const status = error.response.status;
        if (status === 400) {
          const message =
            error.response.data?.message ||
            'Invalid registration data. Please check your inputs.';
          throw new Error(message);
        } else if (status === 409) {
          throw new Error('An account with this email already exists.');
        } else if (status === 429) {
          throw new Error(
            'Too many registration attempts. Please try again later.',
          );
        } else if (status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (error.response.data?.message) {
          // Use server-provided error message if available
          throw new Error(error.response.data.message);
        }
      }
      // For network errors or unexpected errors
      throw new Error(
        'Unable to connect. Please check your internet connection.',
      );
    }
  },

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Always clear tokens, even if API call fails
      clearTokens();
      sessionStorage.removeItem('dits_access_token');
      sessionStorage.removeItem('dits_refresh_token');
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Request password reset email
   */
  async requestPasswordReset(
    data: PasswordResetRequest,
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/auth/request-password-reset',
      data,
    );
    return response.data;
  },

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(
    data: PasswordResetConfirm,
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        '/auth/reset-password',
        data,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        if (status === 400) {
          const message =
            error.response.data?.message || 'Invalid password or token';
          throw new Error(message);
        } else if (status === 401) {
          throw new Error(
            'Invalid or expired reset token. Please request a new password reset.',
          );
        } else if (status === 429) {
          throw new Error('Too many attempts. Please try again later.');
        } else if (status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (error.response.data?.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw new Error(
        'Unable to reset password. Please check your internet connection.',
      );
    }
  },

  /**
   * Verify email with token
   */
  async verifyEmail(
    data: EmailVerification,
  ): Promise<{ message: string; user: User }> {
    const response = await apiClient.post<{ message: string; user: User }>(
      '/auth/verify-email',
      data,
    );
    return response.data;
  },

  /**
   * Resend email verification
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/auth/verify-email/resend',
    );
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setTokens(accessToken, newRefreshToken);
    return response.data;
  },
};
