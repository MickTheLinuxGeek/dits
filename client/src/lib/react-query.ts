import { QueryClient } from '@tanstack/react-query';

/**
 * React Query configuration
 * Optimized for sub-100ms performance requirements
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests once
      retry: 1,
      
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      
      // Cache data for 5 minutes
      gcTime: 5 * 60 * 1000,
      
      // Consider data stale after 1 minute
      staleTime: 60 * 1000,
      
      // Error handling
      throwOnError: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      
      // Error handling
      throwOnError: false,
    },
  },
});

/**
 * Query key factory for consistent cache key generation
 */
export const queryKeys = {
  // Issues
  issues: {
    all: ['issues'] as const,
    lists: () => [...queryKeys.issues.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.issues.lists(), { filters }] as const,
    details: () => [...queryKeys.issues.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.issues.details(), id] as const,
  },
  
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.projects.lists(), { filters }] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  
  // Areas
  areas: {
    all: ['areas'] as const,
    lists: () => [...queryKeys.areas.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.areas.lists(), { filters }] as const,
    details: () => [...queryKeys.areas.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.areas.details(), id] as const,
  },
  
  // User
  user: {
    current: ['user', 'current'] as const,
    profile: ['user', 'profile'] as const,
  },
};
