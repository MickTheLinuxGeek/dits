import { forwardRef } from 'react';
import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
}

/**
 * Search input component with icon overlay
 * Features focus styles with blue border and shadow
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ placeholder = 'Search issues...', value, onChange, onFocus }, ref) => {
    return (
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={16} />
        <input
          ref={ref}
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={onFocus}
        />
      </div>
    );
  },
);

SearchBar.displayName = 'SearchBar';
