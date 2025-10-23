import { NavLink } from 'react-router-dom';
import styles from './NavItem.module.css';

export interface NavItemProps {
  to: string;
  icon?: string;
  label: string;
  count?: number;
}

/**
 * Navigation item component with active state detection
 * Shows icon, label, and optional count badge
 */
export function NavItem({ to, icon, label, count }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.navItem} ${isActive ? styles.active : ''}`
      }
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={styles.count}>{count}</span>
      )}
    </NavLink>
  );
}
