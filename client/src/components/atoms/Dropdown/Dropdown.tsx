import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon, type IconName } from '@/components/atoms/Icon';
import styles from './Dropdown.module.css';

export interface DropdownItem {
  /** Unique identifier for the item */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon name */
  icon?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Optional description */
  description?: string;
  /** Optional divider after this item */
  divider?: boolean;
}

export interface DropdownProps {
  /** Array of items to display in the dropdown */
  items: DropdownItem[];
  /** Current selected item ID */
  selectedId?: string;
  /** Placeholder text when no item is selected */
  placeholder?: string;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Whether to show search input */
  searchable?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Dropdown size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width dropdown */
  fullWidth?: boolean;
  /** Error state */
  error?: boolean;
  /** Callback when an item is selected */
  onSelect?: (item: DropdownItem) => void;
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * Dropdown component with keyboard navigation, search, and accessibility features.
 * Supports single selection with optional icons and descriptions.
 */
export const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
  (
    {
      items,
      selectedId,
      placeholder = 'Select an option',
      disabled = false,
      searchable = false,
      searchPlaceholder = 'Search...',
      size = 'md',
      fullWidth = false,
      error = false,
      onSelect,
      onSearchChange,
      className,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Find selected item
    const selectedItem = items.find((item) => item.id === selectedId);

    // Filter items based on search
    const filteredItems = searchable
      ? items.filter(
          (item) =>
            item.label.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchValue.toLowerCase()),
        )
      : items;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchValue('');
          setFocusedIndex(-1);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
          document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Handle keyboard navigation
    const handleItemSelect = useCallback(
      (item: DropdownItem) => {
        if (item.disabled) return;
        onSelect?.(item);
        setIsOpen(false);
        setSearchValue('');
        setFocusedIndex(-1);
      },
      [onSelect],
    );

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen) return;

        switch (event.key) {
          case 'Escape':
            setIsOpen(false);
            setSearchValue('');
            setFocusedIndex(-1);
            break;
          case 'ArrowDown':
            event.preventDefault();
            setFocusedIndex((prev) => {
              const enabledItems = filteredItems.filter(
                (item) => !item.disabled,
              );
              const currentIndex = enabledItems.findIndex((_, i) => i === prev);
              return currentIndex < enabledItems.length - 1 ? prev + 1 : 0;
            });
            break;
          case 'ArrowUp':
            event.preventDefault();
            setFocusedIndex((prev) => {
              const enabledItems = filteredItems.filter(
                (item) => !item.disabled,
              );
              const currentIndex = enabledItems.findIndex((_, i) => i === prev);
              return currentIndex > 0 ? prev - 1 : enabledItems.length - 1;
            });
            break;
          case 'Enter':
            event.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
              const item = filteredItems[focusedIndex];
              if (!item.disabled) {
                handleItemSelect(item);
              }
            }
            break;
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    }, [isOpen, filteredItems, focusedIndex, handleItemSelect]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchRef.current) {
        searchRef.current.focus();
      }
    }, [isOpen, searchable]);

    const handleToggle = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      setSearchValue('');
      setFocusedIndex(-1);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchValue(value);
      onSearchChange?.(value);
      setFocusedIndex(-1);
    };

    const triggerClasses = [
      styles.trigger,
      styles[size],
      error && styles.error,
      fullWidth && styles.fullWidth,
      isOpen && styles.open,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const dropdownClasses = [
      styles.dropdown,
      isOpen && styles.open,
      fullWidth && styles.fullWidth,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={dropdownRef} className={dropdownClasses}>
        <button
          ref={ref}
          type="button"
          className={triggerClasses}
          onClick={handleToggle}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby="dropdown-label"
          {...props}
        >
          <span className={styles.selectedContent}>
            {selectedItem?.icon && (
              <Icon
                name={selectedItem.icon as IconName}
                className={styles.selectedIcon}
                aria-hidden="true"
              />
            )}
            <span className={styles.selectedText}>
              {selectedItem?.label || placeholder}
            </span>
          </span>
          <Icon
            name={isOpen ? 'ChevronUp' : 'ChevronDown'}
            className={styles.chevron}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div className={styles.menu}>
            {searchable && (
              <div className={styles.searchContainer}>
                <Icon
                  name="Search"
                  className={styles.searchIcon}
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder={searchPlaceholder}
                  className={styles.searchInput}
                  aria-label="Search options"
                />
              </div>
            )}

            <ul
              ref={listRef}
              className={styles.list}
              role="listbox"
              aria-label="Options"
            >
              {filteredItems.length === 0 ? (
                <li className={styles.emptyState}>
                  <span className={styles.emptyText}>
                    {searchValue ? 'No matches found' : 'No options available'}
                  </span>
                </li>
              ) : (
                filteredItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <li
                      className={[
                        styles.item,
                        item.disabled && styles.itemDisabled,
                        selectedId === item.id && styles.itemSelected,
                        index === focusedIndex && styles.itemFocused,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      role="option"
                      aria-selected={selectedId === item.id}
                      aria-disabled={item.disabled}
                      onClick={() => handleItemSelect(item)}
                    >
                      <div className={styles.itemContent}>
                        {item.icon && (
                          <Icon
                            name={item.icon as IconName}
                            className={styles.itemIcon}
                            aria-hidden="true"
                          />
                        )}
                        <div className={styles.itemText}>
                          <span className={styles.itemLabel}>{item.label}</span>
                          {item.description && (
                            <span className={styles.itemDescription}>
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedId === item.id && (
                        <Icon
                          name="Check"
                          className={styles.checkIcon}
                          aria-hidden="true"
                        />
                      )}
                    </li>
                    {item.divider && (
                      <li className={styles.divider} role="separator" />
                    )}
                  </React.Fragment>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    );
  },
);

Dropdown.displayName = 'Dropdown';
