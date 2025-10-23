import { useState } from 'react';
import { MainHeader } from '../components/layout/MainHeader';
import { IssueList } from '../components/issues';
import { mockIssues } from '../mocks';
import type { Issue } from '../mocks/types';

/**
 * Helper function to check if a date is in the future (after today)
 */
function isFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
}

/**
 * Upcoming page - shows issues with future due dates
 * Chronological view with scheduled dates, sorted by due date
 */
export function UpcomingPage() {
  const [issues, setIssues] = useState<Issue[]>(() => {
    const upcomingIssues = mockIssues.filter(
      (issue) =>
        issue.dueDate && isFuture(issue.dueDate) && issue.status !== 'Done',
    );

    // Sort by due date ascending (earliest first)
    return upcomingIssues.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  });

  const handleToggleComplete = (id: string) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === id
          ? { ...issue, status: issue.status === 'Done' ? 'Todo' : 'Done' }
          : issue,
      ),
    );
  };

  return (
    <>
      <MainHeader title="Upcoming" />
      <div
        style={{
          padding: '1.5rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <IssueList issues={issues} onToggleComplete={handleToggleComplete} />
      </div>
    </>
  );
}
