import type { NavigationCounts } from './types';
import { mockIssues } from './issues';

/**
 * Calculate navigation counts dynamically from mock issues
 */
function calculateNavigationCounts(): NavigationCounts {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    inbox: mockIssues.filter((issue) => issue.status !== 'Done').length,
    today: mockIssues.filter((issue) => {
      if (!issue.dueDate) return false;
      const dueDate = new Date(issue.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && issue.status !== 'Done';
    }).length,
    upcoming: mockIssues.filter((issue) => {
      if (!issue.dueDate) return false;
      const dueDate = new Date(issue.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= tomorrow && issue.status !== 'Done';
    }).length,
    logbook: mockIssues.filter((issue) => issue.status === 'Done').length,
  };
}

/**
 * Mock navigation counts for Smart Views
 * These are calculated dynamically from mock issues
 */
export const mockNavigationCounts: NavigationCounts =
  calculateNavigationCounts();
