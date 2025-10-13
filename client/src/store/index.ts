import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Global application state interface
 */
interface AppState {
  // Authentication state
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  setUser: (user: AppState['user']) => void;
  logout: () => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
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
        sidebarOpen: true,
        theme: 'light',
        
        // Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        logout: () => set({ user: null, isAuthenticated: false }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'dits-storage',
        partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
      }
    )
  )
);
