/**
 * Core type definitions and enums for DITS data models
 */

// Re-export Prisma enums for consistency
export {
  Priority,
  ProjectStatus,
  RelationType,
  GitProvider,
} from '@prisma/client';

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  defaultView?: 'list' | 'board' | 'calendar';
  keyboardShortcuts?: Record<string, string>;
  notifications?: {
    email?: boolean;
    desktop?: boolean;
    dueDateReminders?: boolean;
  };
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
}

/**
 * Project settings interface
 */
export interface ProjectSettings {
  defaultStatus?: string;
  autoAssignLabels?: string[];
  branchNamingTemplate?: string;
  prTemplate?: string;
  estimationUnit?: 'hours' | 'points' | 'days';
  allowSubTasks?: boolean;
}

/**
 * Area settings interface
 */
export interface AreaSettings {
  icon?: string;
  sortOrder?: number;
  archived?: boolean;
}

/**
 * Issue metadata interface
 */
export interface IssueMetadata {
  estimatedTime?: number;
  actualTime?: number;
  tags?: string[];
  customFields?: Record<string, unknown>;
  externalLinks?: Array<{
    title: string;
    url: string;
  }>;
}

/**
 * Workflow transition interface
 */
export interface WorkflowTransition {
  from: string; // Status ID
  to: string; // Status ID
  label?: string;
  conditions?: string[];
}

/**
 * Git integration metadata interface
 */
export interface GitIntegrationMetadata {
  prStatus?: 'open' | 'closed' | 'merged';
  prNumber?: number;
  lastSyncedAt?: Date;
  commitCount?: number;
  additions?: number;
  deletions?: number;
}

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Color validation regex (hex color)
 */
export const COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
