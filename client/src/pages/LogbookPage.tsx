import { useState } from 'react';
import { MainHeader } from '../components/layout/MainHeader';
import { IssueList } from '../components/issues';
import { mockIssues } from '../mocks';
import type { Issue } from '../mocks/types';

/**
 * Logbook page - shows completed issues
 * Archive of completed issues
 */
export function LogbookPage() {
  const [issues, setIssues] = useState<Issue[]>(() =>
    mockIssues.filter((issue) => issue.status === 'Done'),
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
      <MainHeader title="Logbook" />
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
