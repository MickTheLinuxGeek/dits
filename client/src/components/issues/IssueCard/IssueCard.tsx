import type { Issue, IssueStatus, IssuePriority } from '../../../mocks/types';
import { Badge } from '../../atoms/Badge';
import styles from './IssueCard.module.css';

export interface IssueCardProps {
  /**
   * Issue to display
   */
  issue: Issue;

  /**
   * Whether the card is selected
   */
  isSelected?: boolean;

  /**
   * Click handler for the card
   */
  onClick?: (issue: Issue) => void;

  /**
   * Selection change handler
   */
  onSelectionChange?: (issueId: string, selected: boolean) => void;

  /**
   * Whether to show the checkbox
   */
  showCheckbox?: boolean;
}

/**
 * IssueCard - Compact card view of an issue for list display
 *
 * Features:
 * - Compact layout optimized for scrolling
 * - Visual priority indicators
 * - Status and label badges
 * - Due date with overdue indicators
 * - Optional checkbox for selection
 * - Click to open/activate issue
 *
 * Usage:
 * ```tsx
 * <IssueCard
 *   issue={issue}
 *   isSelected={selectedIds.has(issue.id)}
 *   onClick={handleIssueClick}
 *   onSelectionChange={handleSelectionChange}
 *   showCheckbox={true}
 * />
 * ```
 */
export function IssueCard({
  issue,
  isSelected = false,
  onClick,
  onSelectionChange,
  showCheckbox = false,
}: IssueCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(issue);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelectionChange) {
      onSelectionChange(issue.id, e.target.checked);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Format due date
  const formatDueDate = (date: Date) => {
    const dueDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Today', isToday: true };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', isUpcoming: true };
    } else if (diffDays <= 7) {
      return { text: `${diffDays}d`, isUpcoming: true };
    }
    return { text: dueDate.toLocaleDateString(), isNormal: true };
  };

  const dueDateInfo = issue.dueDate ? formatDueDate(issue.dueDate) : null;

  // Priority colors
  const priorityColorMap: Record<IssuePriority, string> = {
    Urgent: '#ef4444',
    High: '#f59e0b',
    Medium: '#3b82f6',
    Low: '#6b7280',
  };

  const priorityColor = priorityColorMap[issue.priority];

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Priority indicator bar */}
      <div
        className={styles.priorityBar}
        style={{ backgroundColor: priorityColor }}
        aria-label={`Priority: ${issue.priority}`}
      />

      <div className={styles.content}>
        {/* Checkbox and Title */}
        <div className={styles.header}>
          {showCheckbox && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              onClick={handleCheckboxClick}
              className={styles.checkbox}
              aria-label={`Select issue ${issue.title}`}
            />
          )}
          <h3 className={styles.title}>{issue.title}</h3>
        </div>

        {/* Metadata row */}
        <div className={styles.metadata}>
          {/* Status badge */}
          <Badge variant={getBadgeVariantForStatus(issue.status)}>
            {issue.status}
          </Badge>

          {/* Priority badge */}
          <Badge variant={getBadgeVariantForPriority(issue.priority)}>
            {issue.priority}
          </Badge>

          {/* Labels */}
          {issue.labels && issue.labels.length > 0 && (
            <div className={styles.labels}>
              {issue.labels.slice(0, 3).map((label) => (
                <span
                  key={typeof label === 'string' ? label : label.id}
                  className={styles.label}
                >
                  {typeof label === 'string' ? label : label.name}
                </span>
              ))}
              {issue.labels.length > 3 && (
                <span className={styles.moreLabels}>
                  +{issue.labels.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Due date */}
          {dueDateInfo && (
            <span
              className={`${styles.dueDate} ${
                dueDateInfo.isOverdue
                  ? styles.overdue
                  : dueDateInfo.isToday
                    ? styles.today
                    : dueDateInfo.isUpcoming
                      ? styles.upcoming
                      : ''
              }`}
            >
              📅 {dueDateInfo.text}
            </span>
          )}
        </div>

        {/* Description preview */}
        {issue.description && (
          <p className={styles.description}>{issue.description}</p>
        )}
      </div>
    </div>
  );
}

// Helper functions for badge variants
function getBadgeVariantForStatus(
  status: IssueStatus,
): 'default' | 'success' | 'warning' | 'info' {
  switch (status) {
    case 'Done':
      return 'success';
    case 'In Progress':
      return 'info';
    case 'Review':
      return 'warning';
    default:
      return 'default';
  }
}

function getBadgeVariantForPriority(
  priority: IssuePriority,
): 'default' | 'success' | 'warning' | 'info' {
  switch (priority) {
    case 'Urgent':
      return 'warning';
    case 'High':
      return 'warning';
    case 'Medium':
      return 'info';
    default:
      return 'default';
  }
}
