import styles from './KeyboardShortcut.module.css';

export interface KeyboardShortcutProps {
  keys: string | string[];
}

/**
 * Keyboard shortcut badge component
 * Displays keyboard shortcut keys in a styled badge
 */
export function KeyboardShortcut({ keys }: KeyboardShortcutProps) {
  const keyArray = Array.isArray(keys) ? keys : [keys];

  return (
    <span className={styles.shortcut}>
      {keyArray.map((key, index) => (
        <kbd key={index} className={styles.key}>
          {key}
        </kbd>
      ))}
    </span>
  );
}
