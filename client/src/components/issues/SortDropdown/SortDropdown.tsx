import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type {
  SortField,
  SortDirection,
} from '../IssueListContainer/IssueListContainer';
import { Button } from '../../atoms/Button';
import styles from './SortDropdown.module.css';

export interface SortDropdownProps {
  currentField: SortField;
  currentDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
}

interface SortOption {
  field: SortField;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { field: 'title', label: 'Title' },
  { field: 'status', label: 'Status' },
  { field: 'priority', label: 'Priority' },
  { field: 'dueDate', label: 'Due Date' },
  { field: 'createdAt', label: 'Created' },
  { field: 'updatedAt', label: 'Updated' },
];

/**
 * Dropdown component for sorting options.
 */
export function SortDropdown({
  currentField,
  currentDirection,
  onSortChange,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = SORT_OPTIONS.find((opt) => opt.field === currentField);

  const handleSortChange = (field: SortField) => {
    // If clicking the same field, toggle direction
    if (field === currentField) {
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      onSortChange(field, newDirection);
    } else {
      // New field, default to descending
      onSortChange(field, 'desc');
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      <Button
        variant="outline"
        size="md"
        leftIcon="ArrowUpDown"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Sort options"
        aria-expanded={isOpen}
      >
        Sort
      </Button>

      {isOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.dropdown}>
            <div className={styles.header}>
              <span className={styles.title}>Sort by</span>
              {currentOption && (
                <span className={styles.current}>
                  {currentOption.label}{' '}
                  {currentDirection === 'asc' ? (
                    <ArrowUp size={12} />
                  ) : (
                    <ArrowDown size={12} />
                  )}
                </span>
              )}
            </div>
            <div className={styles.options}>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.field}
                  type="button"
                  className={[
                    styles.option,
                    option.field === currentField && styles.active,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleSortChange(option.field)}
                >
                  <span>{option.label}</span>
                  {option.field === currentField && (
                    <span className={styles.directionIcon}>
                      {currentDirection === 'asc' ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
