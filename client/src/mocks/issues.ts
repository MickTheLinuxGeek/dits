import type { Issue, Label } from './types';

/**
 * Mock labels used across issues
 */
export const mockLabels: Label[] = [
  { id: 'lbl-1', name: 'bug', color: 'bug' },
  { id: 'lbl-2', name: 'feature', color: 'feature' },
  { id: 'lbl-3', name: 'enhancement', color: 'enhancement' },
  { id: 'lbl-4', name: 'security', color: 'security' },
  { id: 'lbl-5', name: 'database', color: 'database' },
  { id: 'lbl-6', name: 'devops', color: 'devops' },
  { id: 'lbl-7', name: 'design', color: 'design' },
];

/**
 * Mock issues for testing and development
 * Includes issues for Inbox, Today, Upcoming, and Logbook views
 */
export const mockIssues: Issue[] = [
  // Inbox issues (3 items matching mockup)
  {
    id: 'DITS-123',
    title: 'Implement user authentication flow',
    description:
      'Add JWT-based authentication with OAuth2 support for GitHub, GitLab, and Bitbucket',
    status: 'Todo',
    priority: 'High',
    labels: [mockLabels[1], mockLabels[3]], // feature, security
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    projectId: 'proj-1', // DITS v1.0
  },
  {
    id: 'DITS-124',
    title: 'Fix issue list pagination bug',
    description: 'The pagination breaks when filtering by multiple labels',
    status: 'In Progress',
    priority: 'Urgent',
    labels: [mockLabels[0]], // bug
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    projectId: 'proj-1', // DITS v1.0
  },
  {
    id: 'DITS-125',
    title: 'Design mobile app navigation patterns',
    description: 'Create wireframes and prototypes for mobile navigation',
    status: 'Review',
    priority: 'Medium',
    labels: [mockLabels[6], mockLabels[1]], // design, feature
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    projectId: 'proj-3', // Mobile App
  },

  // Today issues (5 items with due date = today)
  {
    id: 'DITS-126',
    title: 'Set up CI/CD pipeline',
    description:
      'Configure GitHub Actions for automated testing and deployment',
    status: 'Todo',
    priority: 'High',
    labels: [mockLabels[5]], // devops
    dueDate: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    projectId: 'proj-1', // DITS v1.0
  },
  {
    id: 'DITS-127',
    title: 'Optimize database queries',
    description: 'Add indexes and optimize slow queries for issue search',
    status: 'In Progress',
    priority: 'Medium',
    labels: [mockLabels[4], mockLabels[2]], // database, enhancement
    dueDate: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    projectId: 'proj-1', // DITS v1.0
  },
  {
    id: 'PORT-45',
    title: 'Update portfolio homepage hero section',
    description: 'Refresh hero section with new messaging and visuals',
    status: 'Todo',
    priority: 'Low',
    labels: [mockLabels[6]], // design
    dueDate: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    projectId: 'proj-2', // Portfolio Redesign
  },
  {
    id: 'PORT-46',
    title: 'Fix responsive layout on tablet devices',
    description: 'Portfolio looks broken on iPad Pro and similar devices',
    status: 'Todo',
    priority: 'High',
    labels: [mockLabels[0], mockLabels[6]], // bug, design
    dueDate: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    projectId: 'proj-2', // Portfolio Redesign
  },
  {
    id: 'MOB-12',
    title: 'Implement offline mode for mobile app',
    description: 'Enable users to view and edit issues while offline',
    status: 'In Progress',
    priority: 'High',
    labels: [mockLabels[1]], // feature
    dueDate: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    projectId: 'proj-3', // Mobile App
  },

  // Upcoming issues (various future dates)
  {
    id: 'DITS-128',
    title: 'Add keyboard shortcuts documentation',
    description: 'Create help modal with all keyboard shortcuts',
    status: 'Todo',
    priority: 'Low',
    labels: [mockLabels[2]], // enhancement
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    projectId: 'proj-1', // DITS v1.0
  },
  {
    id: 'DITS-129',
    title: 'Implement dark theme',
    description: 'Add dark mode support with theme toggle',
    status: 'Todo',
    priority: 'Medium',
    labels: [mockLabels[1], mockLabels[6]], // feature, design
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    projectId: 'proj-1', // DITS v1.0
  },
  {
    id: 'PORT-47',
    title: 'Add case studies section',
    description: 'Create detailed case studies for 3 key projects',
    status: 'Todo',
    priority: 'Medium',
    labels: [mockLabels[1]], // feature
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    projectId: 'proj-2', // Portfolio Redesign
  },

  // Logbook issues (completed)
  {
    id: 'DITS-120',
    title: 'Set up project repository',
    description: 'Initialize Git repository with proper structure',
    status: 'Done',
    priority: 'High',
    labels: [mockLabels[5]], // devops
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    projectId: 'proj-1', // DITS v1.0
  },
  {
    id: 'DITS-121',
    title: 'Configure ESLint and Prettier',
    description: 'Set up code quality tools and pre-commit hooks',
    status: 'Done',
    priority: 'Medium',
    labels: [mockLabels[5]], // devops
    dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    projectId: 'proj-1', // DITS v1.0
  },
  {
    id: 'DITS-122',
    title: 'Design initial mockups',
    description: 'Create mockups for main dashboard and issue views',
    status: 'Done',
    priority: 'High',
    labels: [mockLabels[6]], // design
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    projectId: 'proj-1', // DITS v1.0
  },
  {
    id: 'PORT-40',
    title: 'Research design inspiration',
    description: 'Collect examples and create mood board',
    status: 'Done',
    priority: 'Low',
    labels: [mockLabels[6]], // design
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    projectId: 'proj-2', // Portfolio Redesign
  },
];
