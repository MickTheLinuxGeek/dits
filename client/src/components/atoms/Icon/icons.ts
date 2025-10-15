/**
 * Commonly used icon names in DITS
 * Provides type-safe constants for frequently used icons
 */

import type { IconName } from './Icon';

/**
 * Common icons used throughout the application
 */
export const ICONS = {
  // Navigation
  MENU: 'Menu' as IconName,
  CLOSE: 'X' as IconName,
  CHEVRON_LEFT: 'ChevronLeft' as IconName,
  CHEVRON_RIGHT: 'ChevronRight' as IconName,
  CHEVRON_DOWN: 'ChevronDown' as IconName,
  CHEVRON_UP: 'ChevronUp' as IconName,
  ARROW_LEFT: 'ArrowLeft' as IconName,
  ARROW_RIGHT: 'ArrowRight' as IconName,

  // Actions
  PLUS: 'Plus' as IconName,
  EDIT: 'Pencil' as IconName,
  DELETE: 'Trash2' as IconName,
  SAVE: 'Save' as IconName,
  COPY: 'Copy' as IconName,
  CHECK: 'Check' as IconName,
  SEARCH: 'Search' as IconName,
  FILTER: 'Filter' as IconName,
  SORT: 'ArrowUpDown' as IconName,
  REFRESH: 'RefreshCw' as IconName,
  DOWNLOAD: 'Download' as IconName,
  UPLOAD: 'Upload' as IconName,

  // Status
  INFO: 'Info' as IconName,
  WARNING: 'AlertTriangle' as IconName,
  ERROR: 'AlertCircle' as IconName,
  SUCCESS: 'CheckCircle2' as IconName,
  LOADING: 'Loader2' as IconName,

  // Issue Management
  ISSUE: 'Circle' as IconName,
  ISSUE_OPEN: 'CircleDot' as IconName,
  ISSUE_CLOSED: 'CheckCircle2' as IconName,
  BUG: 'Bug' as IconName,
  FEATURE: 'Lightbulb' as IconName,
  TASK: 'ListTodo' as IconName,

  // Views
  INBOX: 'Inbox' as IconName,
  TODAY: 'Calendar' as IconName,
  UPCOMING: 'CalendarDays' as IconName,
  LOGBOOK: 'BookOpen' as IconName,
  LIST: 'List' as IconName,
  BOARD: 'LayoutGrid' as IconName,
  CALENDAR_VIEW: 'CalendarRange' as IconName,

  // Organization
  PROJECT: 'Folder' as IconName,
  AREA: 'Tag' as IconName,
  LABEL: 'Tags' as IconName,

  // Attributes
  PRIORITY_HIGH: 'ArrowUp' as IconName,
  PRIORITY_MEDIUM: 'Minus' as IconName,
  PRIORITY_LOW: 'ArrowDown' as IconName,
  DUE_DATE: 'Calendar' as IconName,
  START_DATE: 'CalendarClock' as IconName,

  // Git Integration
  GIT_BRANCH: 'GitBranch' as IconName,
  GIT_COMMIT: 'GitCommit' as IconName,
  GIT_MERGE: 'GitMerge' as IconName,
  GIT_PULL_REQUEST: 'GitPullRequest' as IconName,
  GITHUB: 'Github' as IconName,

  // Settings & Config
  SETTINGS: 'Settings' as IconName,
  USER: 'User' as IconName,
  THEME: 'Palette' as IconName,
  KEYBOARD: 'Keyboard' as IconName,

  // Misc
  LINK: 'Link' as IconName,
  EXTERNAL_LINK: 'ExternalLink' as IconName,
  MORE_VERTICAL: 'MoreVertical' as IconName,
  MORE_HORIZONTAL: 'MoreHorizontal' as IconName,
  STAR: 'Star' as IconName,
  STAR_FILLED: 'Star' as IconName, // Use fill prop
  CLOCK: 'Clock' as IconName,
  BELL: 'Bell' as IconName,
  COMMAND: 'Command' as IconName,
} as const;

/**
 * Priority level icons
 */
export const PRIORITY_ICONS: Record<'high' | 'medium' | 'low' | 'none', IconName> = {
  high: ICONS.PRIORITY_HIGH,
  medium: ICONS.PRIORITY_MEDIUM,
  low: ICONS.PRIORITY_LOW,
  none: 'Minus' as IconName,
};

/**
 * Status icons
 */
export const STATUS_ICONS: Record<'todo' | 'inProgress' | 'done' | 'canceled', IconName> = {
  todo: ICONS.ISSUE,
  inProgress: ICONS.ISSUE_OPEN,
  done: ICONS.ISSUE_CLOSED,
  canceled: ICONS.CLOSE,
};
