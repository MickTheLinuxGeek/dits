import { Inbox } from 'lucide-react';
import type { Issue } from '../../../mocks/types';
import { IssueItem } from '../IssueItem';
import styles from './IssueList.module.css';

export interface IssueListProps {
  issues: Issue[];
  onToggleComplete?: (id: string) => void;
}

/**
 * Scrollable container for issue list
 * Displays issues in a white container with vertical scrolling
 */
export function IssueList({ issues, onToggleComplete }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Inbox className={styles.emptyIcon} size={48} />
        <h3 className={styles.emptyHeading}>No issues found</h3>
        <p className={styles.emptyDescription}>
          Create a new issue to get started
        </p>
      </div>
    );
  }

  return (
    <div className={styles.issueList}>
      {issues.map((issue) => (
        <IssueItem
          key={issue.id}
          issue={issue}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  );
}
