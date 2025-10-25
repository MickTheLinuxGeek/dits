import { useMemo } from 'react';
import type { Issue } from '../../mocks/types';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  issues: Issue[];
}

type StatusType = 'Backlog' | 'Todo' | 'In Progress' | 'Review' | 'Done';

const COLUMNS: { id: StatusType; label: string; className: string }[] = [
  { id: 'Backlog', label: 'Backlog', className: styles.statusBacklog },
  { id: 'Todo', label: 'To Do', className: styles.statusTodo },
  {
    id: 'In Progress',
    label: 'In Progress',
    className: styles.statusInProgress,
  },
  { id: 'Review', label: 'Review', className: styles.statusReview },
  { id: 'Done', label: 'Done', className: styles.statusDone },
];

function getPriorityClass(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return styles.priorityUrgent;
    case 'high':
      return styles.priorityHigh;
    case 'medium':
      return styles.priorityMedium;
    case 'low':
      return styles.priorityLow;
    default:
      return styles.priorityNone;
  }
}

function getLabelClass(color: string): string {
  switch (color.toLowerCase()) {
    case 'bug':
      return styles.labelBug;
    case 'feature':
      return styles.labelFeature;
    case 'enhancement':
      return styles.labelEnhancement;
    case 'security':
      return styles.labelSecurity;
    case 'devops':
      return styles.labelDevops;
    case 'database':
      return styles.labelDatabase;
    case 'design':
      return styles.labelDesign;
    default:
      return styles.labelFeature;
  }
}

function formatDueDate(dueDate: Date | undefined): {
  text: string;
  className: string;
} {
  if (!dueDate) {
    return { text: '', className: '' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: '📅 Overdue', className: styles.dueDateOverdue };
  } else if (diffDays === 0) {
    return { text: '📅 Today', className: styles.dueDateToday };
  } else {
    const month = due.toLocaleString('default', { month: 'short' });
    const day = due.getDate();
    return { text: `📅 ${month} ${day}`, className: '' };
  }
}

export function KanbanBoard({ issues }: KanbanBoardProps) {
  const issuesByStatus = useMemo(() => {
    const grouped: Record<StatusType, Issue[]> = {
      Backlog: [],
      Todo: [],
      'In Progress': [],
      Review: [],
      Done: [],
    };

    issues.forEach((issue) => {
      const status = issue.status as StatusType;
      if (grouped[status]) {
        grouped[status].push(issue);
      }
    });

    return grouped;
  }, [issues]);

  return (
    <div className={styles.kanbanBoard}>
      <div className={styles.boardContainer}>
        {COLUMNS.map((column) => {
          const columnIssues = issuesByStatus[column.id] || [];

          return (
            <div key={column.id} className={styles.boardColumn}>
              <div className={styles.columnHeader}>
                <div className={`${styles.columnTitle} ${column.className}`}>
                  <span className={styles.statusDot}></span>
                  {column.label}
                </div>
                <span className={styles.columnCount}>
                  {columnIssues.length}
                </span>
              </div>

              <div className={styles.columnBody}>
                {columnIssues.map((issue) => {
                  const dueDate = formatDueDate(issue.dueDate);

                  return (
                    <div key={issue.id} className={styles.issueCard}>
                      <div className={styles.cardHeader}>
                        <span className={styles.issueId}>#{issue.id}</span>
                        <span
                          className={`${styles.priorityIndicator} ${getPriorityClass(issue.priority)}`}
                        ></span>
                      </div>

                      <div className={styles.cardTitle}>{issue.title}</div>

                      {issue.labels && issue.labels.length > 0 && (
                        <div className={styles.cardLabels}>
                          {issue.labels.map((label) => (
                            <span
                              key={label.id}
                              className={`${styles.label} ${getLabelClass(label.color)}`}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={styles.cardFooter}>
                        <div className={styles.cardMeta}>
                          {issue.status === 'Done' ? (
                            <span>✅ Completed</span>
                          ) : dueDate.text ? (
                            <span
                              className={`${styles.dueDate} ${dueDate.className}`}
                            >
                              {dueDate.text}
                            </span>
                          ) : null}
                        </div>
                        <div className={styles.assigneeAvatar}>MB</div>
                      </div>
                    </div>
                  );
                })}

                <button className={styles.addCardBtn}>+ Add Issue</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
