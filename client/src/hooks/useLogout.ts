import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAppStore } from '../store';

/**
 * Custom hook for logout functionality
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAppStore((state) => state.logout);

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all queries to ensure fresh state on next login
      queryClient.clear();
      logout();
      navigate('/auth/login');
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      // Still log out locally even if API call fails
      queryClient.clear();
      logout();
      navigate('/auth/login');
    },
  });

  return {
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
};
