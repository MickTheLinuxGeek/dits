import { Calendar } from 'lucide-react';
import type { Issue } from '../../../mocks/types';
import { Label } from '../../ui/Label';
import { PriorityIndicator } from '../../ui/PriorityIndicator';
import { StatusBadge } from '../../ui/StatusBadge';
import styles from './IssueItem.module.css';

export interface IssueItemProps {
  issue: Issue;
  onToggleComplete?: (id: string) => void;
}

/**
 * Individual issue item component
 * Displays issue with checkbox, title, metadata, and status
 */
export function IssueItem({ issue, onToggleComplete }: IssueItemProps) {
  const isCompleted = issue.status === 'Done';

  const formatDate = (date: Date) => {
    const now = new Date();
    const issueDate = new Date(date);
    const diffTime = issueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

    return issueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`${styles.issueItem} ${isCompleted ? styles.completed : ''}`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={isCompleted}
        onChange={() => onToggleComplete?.(issue.id)}
        aria-label={`Mark ${issue.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
      />

      {/* Content */}
      <div className={styles.content}>
        {/* Title */}
        <h3 className={styles.title}>{issue.title}</h3>

        {/* Metadata */}
        <div className={styles.metadata}>
          {/* Issue ID */}
          <span className={styles.issueId}>{issue.id}</span>

          {/* Labels */}
          {issue.labels.length > 0 && (
            <div className={styles.labels}>
              {issue.labels.map((label) => (
                <Label key={label.id} name={label.name} color={label.color} />
              ))}
            </div>
          )}

          {/* Priority */}
          <PriorityIndicator priority={issue.priority} />

          {/* Due Date */}
          {issue.dueDate && (
            <span className={styles.dueDate}>
              <Calendar size={12} />
              {formatDate(issue.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      <div className={styles.statusContainer}>
        <StatusBadge status={issue.status} />
      </div>
    </div>
  );
}
