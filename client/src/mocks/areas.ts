import type { Area } from './types';

/**
 * Mock areas for testing and development
 * Areas represent ongoing spheres of responsibility
 */
export const mockAreas: Area[] = [
  {
    id: 'area-1',
    name: 'Work',
    icon: '💼',
    issueCount: 15,
  },
  {
    id: 'area-2',
    name: 'Personal',
    icon: '🏠',
    issueCount: 7,
  },
  {
    id: 'area-3',
    name: 'Learning',
    icon: '📚',
    issueCount: 3,
  },
];
