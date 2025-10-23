import type { LabelColor } from '../../../mocks/types';
import styles from './Label.module.css';

export interface LabelProps {
  name: string;
  color: LabelColor;
}

/**
 * Colored label badge component
 * Displays issue labels as colored pills with uppercase text
 */
export function Label({ name, color }: LabelProps) {
  return <span className={`${styles.label} ${styles[color]}`}>{name}</span>;
}
