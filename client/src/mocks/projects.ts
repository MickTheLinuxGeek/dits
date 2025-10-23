import type { Project } from './types';

/**
 * Mock projects for testing and development
 * These match the projects shown in the mockup sidebar
 */
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'DITS v1.0',
    icon: '🎯',
    issueCount: 12,
  },
  {
    id: 'proj-2',
    name: 'Portfolio Redesign',
    icon: '🎨',
    issueCount: 8,
  },
  {
    id: 'proj-3',
    name: 'Mobile App',
    icon: '📱',
    issueCount: 5,
  },
];
