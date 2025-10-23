import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '../services/auth.service';
import { getAccessToken, getRefreshToken } from '../lib/api-client';

/**
 * Global application state interface
 */
interface AppState {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  // UI state
  theme: 'light' | 'dark';

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  initializeAuth: () => void;
}

/**
 * Main application store using Zustand
 * Includes devtools for debugging and persistence for select values
 */
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        isAuthenticated: false,
        user: null,
        isLoading: true,
        theme: 'light',

        // Actions
        setUser: (user) => {
          console.log('[Store] setUser called:', user);
          set({ user, isAuthenticated: !!user, isLoading: false });
        },
        setLoading: (isLoading) => {
          console.log('[Store] setLoading called:', isLoading);
          set({ isLoading });
        },
        logout: () => set({ user: null, isAuthenticated: false }),
        setTheme: (theme) => set({ theme }),

        // Initialize authentication state from stored tokens
        initializeAuth: () => {
          const token =
            getAccessToken() || sessionStorage.getItem('dits_access_token');
          const refreshToken =
            getRefreshToken() || sessionStorage.getItem('dits_refresh_token');

          if (token && refreshToken) {
            // Token exists, but we need to validate it by fetching user data
            // This will be done in the App component with React Query
            set({ isLoading: true });
          } else {
            set({ isAuthenticated: false, user: null, isLoading: false });
          }
        },
      }),
      {
        name: 'dits-storage',
        partialize: (state) => ({
          theme: state.theme,
        }),
        // Ensure non-persisted state is not overridden by persisted state
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...(persistedState as Partial<AppState>),
          // Never persist authentication state
          isAuthenticated: currentState.isAuthenticated,
          isLoading: currentState.isLoading,
          user: currentState.user,
        }),
      },
    ),
  ),
);
