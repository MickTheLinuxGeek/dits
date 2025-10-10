import { Project as PrismaProject, ProjectStatus } from '@prisma/client';
import { ProjectSettings, ValidationResult } from './types';

/**
 * Project model class with type-safe settings handling
 *
 * Represents a finite body of work with a clear endpoint.
 * Projects are distinct from Areas (ongoing spheres of responsibility).
 */
export class Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  settings: ProjectSettings;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PrismaProject) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.description = data.description;
    this.status = data.status;
    this.settings = this.parseSettings(data.settings);
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Parse and validate project settings from JSON
   */
  private parseSettings(settings: unknown): ProjectSettings {
    if (typeof settings !== 'object' || settings === null) {
      return {};
    }
    return settings as ProjectSettings;
  }

  /**
   * Get a specific setting value with type safety
   */
  getSetting<K extends keyof ProjectSettings>(
    key: K,
  ): ProjectSettings[K] | undefined {
    return this.settings[key];
  }

  /**
   * Set a specific setting value
   */
  setSetting<K extends keyof ProjectSettings>(
    key: K,
    value: ProjectSettings[K],
  ): void {
    this.settings[key] = value;
  }

  /**
   * Update multiple settings at once
   */
  updateSettings(newSettings: Partial<ProjectSettings>): void {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };
  }

  /**
   * Check if project is active
   */
  isActive(): boolean {
    return this.status === ProjectStatus.ACTIVE;
  }

  /**
   * Check if project is completed
   */
  isCompleted(): boolean {
    return this.status === ProjectStatus.COMPLETED;
  }

  /**
   * Check if project is archived
   */
  isArchived(): boolean {
    return this.status === ProjectStatus.ARCHIVED;
  }

  /**
   * Check if project is on hold
   */
  isOnHold(): boolean {
    return this.status === ProjectStatus.ON_HOLD;
  }

  /**
   * Check if project has a deadline
   */
  hasDeadline(): boolean {
    return this.endDate !== null;
  }

  /**
   * Check if project is overdue
   */
  isOverdue(): boolean {
    if (!this.endDate || this.isCompleted() || this.isArchived()) {
      return false;
    }
    return new Date() > this.endDate;
  }

  /**
   * Get project duration in days
   */
  getDuration(): number | null {
    if (!this.startDate || !this.endDate) {
      return null;
    }
    const diff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Validate project name
   */
  static validateName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Project name is required');
    } else if (name.length < 2) {
      errors.push('Project name must be at least 2 characters long');
    } else if (name.length > 200) {
      errors.push('Project name must not exceed 200 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate project dates
   */
  static validateDates(
    startDate: Date | null,
    endDate: Date | null,
  ): ValidationResult {
    const errors: string[] = [];

    if (startDate && endDate && startDate > endDate) {
      errors.push('Start date must be before end date');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate project status transition
   */
  static validateStatusTransition(
    currentStatus: ProjectStatus,
    newStatus: ProjectStatus,
  ): ValidationResult {
    const errors: string[] = [];

    // Define allowed transitions
    const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      [ProjectStatus.ACTIVE]: [
        ProjectStatus.ON_HOLD,
        ProjectStatus.COMPLETED,
        ProjectStatus.ARCHIVED,
      ],
      [ProjectStatus.ON_HOLD]: [
        ProjectStatus.ACTIVE,
        ProjectStatus.COMPLETED,
        ProjectStatus.ARCHIVED,
      ],
      [ProjectStatus.COMPLETED]: [ProjectStatus.ARCHIVED, ProjectStatus.ACTIVE],
      [ProjectStatus.ARCHIVED]: [ProjectStatus.ACTIVE],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      errors.push(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to plain object for JSON serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      description: this.description,
      status: this.status,
      settings: this.settings,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
