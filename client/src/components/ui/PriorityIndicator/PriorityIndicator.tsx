import type { IssuePriority } from '../../../mocks/types';
import styles from './PriorityIndicator.module.css';

export interface PriorityIndicatorProps {
  priority: IssuePriority;
}

/**
 * Priority indicator component with colored dot and label
 * Shows issue priority level (Urgent, High, Medium, Low)
 */
export function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  return (
    <span className={`${styles.priority} ${styles[priority.toLowerCase()]}`}>
      <span className={styles.dot}></span>
      <span className={styles.label}>{priority}</span>
    </span>
  );
}
