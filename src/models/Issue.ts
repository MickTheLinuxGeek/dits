import { Issue as PrismaIssue, Priority } from '@prisma/client';
import { IssueMetadata, ValidationResult } from './types';

/**
 * Issue model class with priority, status, dates, and metadata handling
 *
 * Represents the core task/bug entity in DITS. Issues are living documents
 * that support rich metadata, relationships, and Git integration.
 */
export class Issue {
  id: string;
  userId: string;
  projectId: string | null;
  areaId: string | null;
  parentIssueId: string | null;
  statusId: string;
  title: string;
  description: string | null;
  priority: Priority;
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  metadata: IssueMetadata;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PrismaIssue) {
    this.id = data.id;
    this.userId = data.userId;
    this.projectId = data.projectId;
    this.areaId = data.areaId;
    this.parentIssueId = data.parentIssueId;
    this.statusId = data.statusId;
    this.title = data.title;
    this.description = data.description;
    this.priority = data.priority;
    this.startDate = data.startDate;
    this.dueDate = data.dueDate;
    this.completedAt = data.completedAt;
    this.metadata = this.parseMetadata(data.metadata);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Parse and validate issue metadata from JSON
   */
  private parseMetadata(metadata: unknown): IssueMetadata {
    if (typeof metadata !== 'object' || metadata === null) {
      return {};
    }
    return metadata as IssueMetadata;
  }

  /**
   * Get a specific metadata value with type safety
   */
  getMetadata<K extends keyof IssueMetadata>(
    key: K,
  ): IssueMetadata[K] | undefined {
    return this.metadata[key];
  }

  /**
   * Set a specific metadata value
   */
  setMetadata<K extends keyof IssueMetadata>(
    key: K,
    value: IssueMetadata[K],
  ): void {
    this.metadata[key] = value;
  }

  /**
   * Update multiple metadata fields at once
   */
  updateMetadata(newMetadata: Partial<IssueMetadata>): void {
    this.metadata = {
      ...this.metadata,
      ...newMetadata,
    };
  }

  /**
   * Check if issue is a sub-task
   */
  isSubTask(): boolean {
    return this.parentIssueId !== null;
  }

  /**
   * Check if issue is completed
   */
  isCompleted(): boolean {
    return this.completedAt !== null;
  }

  /**
   * Check if issue is overdue
   */
  isOverdue(): boolean {
    if (!this.dueDate || this.isCompleted()) {
      return false;
    }
    return new Date() > this.dueDate;
  }

  /**
   * Check if issue is scheduled for today
   */
  isToday(): boolean {
    if (!this.startDate && !this.dueDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkDate = this.startDate || this.dueDate;
    if (!checkDate) return false;

    const date = new Date(checkDate);
    date.setHours(0, 0, 0, 0);

    return date >= today && date < tomorrow;
  }

  /**
   * Check if issue is upcoming (within next 7 days)
   */
  isUpcoming(days: number = 7): boolean {
    if (!this.startDate && !this.dueDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    const checkDate = this.startDate || this.dueDate;
    if (!checkDate) return false;

    const date = new Date(checkDate);
    date.setHours(0, 0, 0, 0);

    return date >= today && date <= futureDate;
  }

  /**
   * Get priority level as number (for sorting)
   */
  getPriorityLevel(): number {
    const levels: Record<Priority, number> = {
      [Priority.NO_PRIORITY]: 0,
      [Priority.LOW]: 1,
      [Priority.MEDIUM]: 2,
      [Priority.HIGH]: 3,
      [Priority.URGENT]: 4,
    };
    return levels[this.priority];
  }

  /**
   * Check if issue has high or urgent priority
   */
  isHighPriority(): boolean {
    return this.priority === Priority.HIGH || this.priority === Priority.URGENT;
  }

  /**
   * Add a tag to the issue
   */
  addTag(tag: string): void {
    const tags = this.metadata.tags || [];
    if (!tags.includes(tag)) {
      this.setMetadata('tags', [...tags, tag]);
    }
  }

  /**
   * Remove a tag from the issue
   */
  removeTag(tag: string): void {
    const tags = this.metadata.tags || [];
    this.setMetadata(
      'tags',
      tags.filter((t) => t !== tag),
    );
  }

  /**
   * Add an external link to the issue
   */
  addExternalLink(title: string, url: string): void {
    const links = this.metadata.externalLinks || [];
    links.push({ title, url });
    this.setMetadata('externalLinks', links);
  }

  /**
   * Get estimated time in hours
   */
  getEstimatedTime(): number | null {
    return this.metadata.estimatedTime ?? null;
  }

  /**
   * Get actual time spent in hours
   */
  getActualTime(): number | null {
    return this.metadata.actualTime ?? null;
  }

  /**
   * Calculate time variance (actual - estimated)
   */
  getTimeVariance(): number | null {
    const estimated = this.getEstimatedTime();
    const actual = this.getActualTime();

    if (estimated === null || actual === null) {
      return null;
    }

    return actual - estimated;
  }

  /**
   * Validate issue title
   */
  static validateTitle(title: string): ValidationResult {
    const errors: string[] = [];

    if (!title || title.trim().length === 0) {
      errors.push('Issue title is required');
    } else if (title.length < 3) {
      errors.push('Issue title must be at least 3 characters long');
    } else if (title.length > 500) {
      errors.push('Issue title must not exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate issue dates
   */
  static validateDates(
    startDate: Date | null,
    dueDate: Date | null,
  ): ValidationResult {
    const errors: string[] = [];

    if (startDate && dueDate && startDate > dueDate) {
      errors.push('Start date must be before due date');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate priority
   */
  static validatePriority(priority: Priority): ValidationResult {
    const errors: string[] = [];
    const validPriorities = Object.values(Priority);

    if (!validPriorities.includes(priority)) {
      errors.push(
        `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
      );
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
      projectId: this.projectId,
      areaId: this.areaId,
      parentIssueId: this.parentIssueId,
      statusId: this.statusId,
      title: this.title,
      description: this.description,
      priority: this.priority,
      startDate: this.startDate,
      dueDate: this.dueDate,
      completedAt: this.completedAt,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
