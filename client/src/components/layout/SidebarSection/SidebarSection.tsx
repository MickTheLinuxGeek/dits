import type { ReactNode } from 'react';
import styles from './SidebarSection.module.css';

export interface SidebarSectionProps {
  title: string;
  children: ReactNode;
}

/**
 * Section container for sidebar navigation groups
 * Displays uppercase title with padding and children below
 */
export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
