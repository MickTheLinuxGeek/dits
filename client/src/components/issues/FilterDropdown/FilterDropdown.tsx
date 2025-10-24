import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './FilterDropdown.module.css';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

/**
 * Dropdown component for filtering options.
 */
export function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.label}>{label}:</span>
        <span className={styles.value}>{selectedOption?.label || 'All'}</span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.dropdown} role="listbox">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={[
                  styles.option,
                  option.value === value && styles.selected,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
