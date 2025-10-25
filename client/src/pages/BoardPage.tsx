import { useState } from 'react';
import { MainHeader } from '../components/layout/MainHeader';
import { KanbanBoard } from '../components/board';
import { mockIssues } from '../mocks';
import type { Issue } from '../mocks/types';

/**
 * Board page - shows issues in a kanban board view
 * Displays issues grouped by status in columns
 */
export function BoardPage() {
  const [issues] = useState<Issue[]>(() =>
    // Show all issues in the board view
    mockIssues.filter((issue) => issue.projectId === 'proj-1'),
  );

  return (
    <>
      <MainHeader title="DITS v1.0" />
      <KanbanBoard issues={issues} />
    </>
  );
}
