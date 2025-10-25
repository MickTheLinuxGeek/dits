import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SearchBar } from '../../ui/SearchBar';
import { ViewToggle } from '../../ui/ViewToggle';
import type { ViewType } from '../../ui/ViewToggle';
import { KeyboardShortcut } from '../../ui/KeyboardShortcut';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';
import styles from './MainHeader.module.css';

export interface MainHeaderProps {
  title?: string;
  onNewIssue?: () => void;
}

/**
 * Main header component for content area
 * Contains view title, search bar, view toggle, and new issue button
 */
export function MainHeader({ title, onNewIssue }: MainHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [activeView, setActiveView] = useState<ViewType>('list');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Derive title from route if not provided
  const displayTitle = title || getPageTitle(location.pathname);

  // Sync activeView with current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/board')) {
      setActiveView('board');
    } else if (path.includes('/calendar')) {
      setActiveView('calendar');
    } else {
      setActiveView('list');
    }
  }, [location.pathname]);

  // Handle view change
  const handleViewChange = useCallback(
    (view: ViewType) => {
      setActiveView(view);
      // Navigate to the appropriate route based on view
      if (view === 'board') {
        navigate('/board');
      } else if (view === 'calendar') {
        // Calendar view not yet implemented, stay on current route
        console.log('Calendar view not yet implemented');
      } else {
        // For list view, navigate back to inbox (or current list view)
        const currentPath = location.pathname;
        if (
          currentPath.includes('/board') ||
          currentPath.includes('/calendar')
        ) {
          navigate('/inbox');
        }
      }
    },
    [navigate, location.pathname],
  );

  // Keyboard shortcut handlers
  const handleNewIssue = useCallback(() => {
    if (onNewIssue) {
      onNewIssue();
    }
  }, [onNewIssue]);

  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  // Register keyboard shortcuts
  // C for new issue
  useKeyboardShortcut({
    key: 'c',
    callback: handleNewIssue,
  });

  // Cmd/Ctrl+K for search focus
  useKeyboardShortcut({
    key: 'k',
    ctrlKey: true,
    callback: handleFocusSearch,
  });

  useKeyboardShortcut({
    key: 'k',
    metaKey: true,
    callback: handleFocusSearch,
  });

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Left section - Title */}
        <h1 className={styles.title}>{displayTitle}</h1>

        {/* Center section - Search and View Toggle */}
        <div className={styles.centerSection}>
          <SearchBar
            ref={searchInputRef}
            value={searchValue}
            onChange={setSearchValue}
          />
          <ViewToggle activeView={activeView} onViewChange={handleViewChange} />
        </div>

        {/* Right section - Actions */}
        <div className={styles.actions}>
          <button className={styles.newIssueButton} onClick={onNewIssue}>
            <Plus size={16} />
            <span>New Issue</span>
            <KeyboardShortcut keys="C" />
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Helper function to derive page title from pathname
 */
function getPageTitle(pathname: string): string {
  const pathMap: Record<string, string> = {
    '/inbox': 'Inbox',
    '/today': 'Today',
    '/upcoming': 'Upcoming',
    '/logbook': 'Logbook',
    '/projects': 'Projects',
    '/areas': 'Areas',
  };

  // Check for exact match
  if (pathMap[pathname]) {
    return pathMap[pathname];
  }

  // Check for dynamic routes
  if (pathname.startsWith('/projects/')) {
    return 'Project';
  }
  if (pathname.startsWith('/areas/')) {
    return 'Area';
  }

  return 'DITS';
}
