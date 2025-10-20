import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';
import { useAuthInit } from '../../hooks/useAuthInit';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component that redirects to login if not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppStore();
  const location = useLocation();
  const { isInitializing } = useAuthInit();

  console.log('[ProtectedRoute] State:', { isAuthenticated, isInitializing });

  // Show loading state while checking authentication
  if (isInitializing) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};
