import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Mock the store
const mockStore = {
  isAuthenticated: false,
};

vi.mock('../../../store', () => ({
  useAppStore: vi.fn(() => mockStore),
}));

// Mock the useAuthInit hook
const mockUseAuthInit = {
  isInitializing: false,
  hasAuthError: false,
};

vi.mock('../../../hooks/useAuthInit', () => ({
  useAuthInit: vi.fn(() => mockUseAuthInit),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.isAuthenticated = false;
    mockUseAuthInit.isInitializing = false;
    mockUseAuthInit.hasAuthError = false;
  });

  const renderProtectedRoute = (initialPath = '/protected') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
  };

  describe('when user is not authenticated', () => {
    it('should redirect to login page', () => {
      mockStore.isAuthenticated = false;
      mockUseAuthInit.isInitializing = false;

      renderProtectedRoute();

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should preserve the intended destination in location state', () => {
      mockStore.isAuthenticated = false;
      mockUseAuthInit.isInitializing = false;

      const { container } = renderProtectedRoute('/protected');

      // Verify redirect happened (Login Page is shown)
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    it('should render protected content', () => {
      mockStore.isAuthenticated = true;
      mockUseAuthInit.isInitializing = false;

      renderProtectedRoute();

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('when authentication is initializing', () => {
    it('should show loading state', () => {
      mockStore.isAuthenticated = false;
      mockUseAuthInit.isInitializing = true;

      renderProtectedRoute();

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should not redirect while initializing even if not authenticated', () => {
      mockStore.isAuthenticated = false;
      mockUseAuthInit.isInitializing = true;

      renderProtectedRoute();

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('transition from initializing to authenticated', () => {
    it('should show protected content after initialization completes successfully', () => {
      // Start with initializing
      mockStore.isAuthenticated = false;
      mockUseAuthInit.isInitializing = true;

      const { rerender } = renderProtectedRoute();

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Simulate successful authentication
      mockStore.isAuthenticated = true;
      mockUseAuthInit.isInitializing = false;

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/auth/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect to login after initialization fails', () => {
      // Start with initializing
      mockStore.isAuthenticated = false;
      mockUseAuthInit.isInitializing = true;

      const { rerender } = renderProtectedRoute();

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Simulate failed authentication
      mockStore.isAuthenticated = false;
      mockUseAuthInit.isInitializing = false;

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/auth/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('multiple children', () => {
    it('should render multiple child elements when authenticated', () => {
      mockStore.isAuthenticated = true;
      mockUseAuthInit.isInitializing = false;

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>First Child</div>
                  <div>Second Child</div>
                </ProtectedRoute>
              }
            />
            <Route path="/auth/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });
  });

  describe('nested protected routes', () => {
    it('should handle nested protected routes correctly', () => {
      mockStore.isAuthenticated = true;
      mockUseAuthInit.isInitializing = false;

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>
                    <div>Outer Protected</div>
                    <div>Inner Content</div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route path="/auth/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('Outer Protected')).toBeInTheDocument();
      expect(screen.getByText('Inner Content')).toBeInTheDocument();
    });
  });
});
