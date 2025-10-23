import { List, LayoutGrid, Calendar } from 'lucide-react';
import styles from './ViewToggle.module.css';

export type ViewType = 'list' | 'board' | 'calendar';

export interface ViewToggleProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

/**
 * Segmented control for switching between List, Board, and Calendar views
 * Active view has white background with shadow
 */
export function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  const views: { type: ViewType; icon: typeof List; label: string }[] = [
    { type: 'list', icon: List, label: 'List' },
    { type: 'board', icon: LayoutGrid, label: 'Board' },
    { type: 'calendar', icon: Calendar, label: 'Calendar' },
  ];

  return (
    <div className={styles.viewToggle}>
      {views.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          className={`${styles.viewButton} ${activeView === type ? styles.active : ''}`}
          onClick={() => onViewChange(type)}
          aria-label={`${label} view`}
          aria-pressed={activeView === type}
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
