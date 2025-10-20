import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAppStore } from '../store';
import { getAccessToken, getRefreshToken } from '../lib/api-client';

/**
 * Custom hook to initialize authentication state on app load
 */
export const useAuthInit = () => {
  const { setUser, setLoading, user } = useAppStore();

  // Check if we have tokens
  const hasToken = !!(
    getAccessToken() || sessionStorage.getItem('dits_access_token')
  );

  const hasRefreshToken = !!(
    getRefreshToken() || sessionStorage.getItem('dits_refresh_token')
  );

  // Fetch current user if tokens exist
  const { isLoading, isError, data } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: hasToken && hasRefreshToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Update user state when data or error changes
  useEffect(() => {
    console.log('[useAuthInit] Auth state:', {
      hasToken,
      hasRefreshToken,
      isLoading,
      isError,
      hasData: !!data,
    });

    if (data) {
      console.log('[useAuthInit] Setting user data:', data);
      setUser(data);
      setLoading(false);
    } else if (isError) {
      console.log('[useAuthInit] Auth error, clearing user');
      setUser(null);
      setLoading(false);
    } else if (!hasToken || !hasRefreshToken) {
      // No tokens present, not authenticated
      console.log('[useAuthInit] No tokens, clearing user');
      setUser(null);
      setLoading(false);
    }
  }, [
    data,
    isError,
    hasToken,
    hasRefreshToken,
    setUser,
    setLoading,
    isLoading,
  ]);

  // Calculate if we're initializing:
  // - True if we have tokens and query is loading
  // - OR if query finished successfully but user hasn't been set yet
  const isInitializing =
    hasToken && hasRefreshToken && (isLoading || (data && !user));

  return {
    isInitializing,
    hasAuthError: isError,
  };
};
