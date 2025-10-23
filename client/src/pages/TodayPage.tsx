import { useState } from 'react';
import { MainHeader } from '../components/layout/MainHeader';
import { IssueList } from '../components/issues';
import { mockIssues } from '../mocks';
import type { Issue } from '../mocks/types';

/**
 * Helper function to check if a date is today
 */
function isToday(date: Date): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Today page - shows issues due today
 * Curated list for current day
 */
export function TodayPage() {
  const [issues, setIssues] = useState<Issue[]>(() =>
    mockIssues.filter(
      (issue) =>
        issue.dueDate && isToday(issue.dueDate) && issue.status !== 'Done',
    ),
  );

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
      <MainHeader title="Today" />
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
