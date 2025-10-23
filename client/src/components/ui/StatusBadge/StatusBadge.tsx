import type { IssueStatus } from '../../../mocks/types';
import styles from './StatusBadge.module.css';

export interface StatusBadgeProps {
  status: IssueStatus;
}

/**
 * Status badge component with dot and status text
 * Shows issue status (Todo, In Progress, Review, Done)
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const statusKey = status.toLowerCase().replace(/\s+/g, '-');

  return (
    <span className={`${styles.status} ${styles[statusKey]}`}>
      <span className={styles.dot}></span>
      <span className={styles.label}>{status}</span>
    </span>
  );
}
