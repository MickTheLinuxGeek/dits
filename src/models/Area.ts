import { Area as PrismaArea } from '@prisma/client';
import { AreaSettings, ValidationResult, COLOR_REGEX } from './types';

/**
 * Area model class with color and settings management
 *
 * Represents an ongoing sphere of responsibility (e.g., Work, Personal, Learning).
 * Areas are distinct from Projects (finite bodies of work with endpoints).
 */
export class Area {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  settings: AreaSettings;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PrismaArea) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.description = data.description;
    this.color = data.color;
    this.settings = this.parseSettings(data.settings);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Parse and validate area settings from JSON
   */
  private parseSettings(settings: unknown): AreaSettings {
    if (typeof settings !== 'object' || settings === null) {
      return {};
    }
    return settings as AreaSettings;
  }

  /**
   * Get a specific setting value with type safety
   */
  getSetting<K extends keyof AreaSettings>(
    key: K,
  ): AreaSettings[K] | undefined {
    return this.settings[key];
  }

  /**
   * Set a specific setting value
   */
  setSetting<K extends keyof AreaSettings>(
    key: K,
    value: AreaSettings[K],
  ): void {
    this.settings[key] = value;
  }

  /**
   * Update multiple settings at once
   */
  updateSettings(newSettings: Partial<AreaSettings>): void {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };
  }

  /**
   * Check if area is archived
   */
  isArchived(): boolean {
    return this.settings.archived === true;
  }

  /**
   * Archive the area
   */
  archive(): void {
    this.setSetting('archived', true);
  }

  /**
   * Unarchive the area
   */
  unarchive(): void {
    this.setSetting('archived', false);
  }

  /**
   * Get sort order (default to 0 if not set)
   */
  getSortOrder(): number {
    return this.settings.sortOrder ?? 0;
  }

  /**
   * Validate area name
   */
  static validateName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Area name is required');
    } else if (name.length < 2) {
      errors.push('Area name must be at least 2 characters long');
    } else if (name.length > 100) {
      errors.push('Area name must not exceed 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate color format (hex color)
   */
  static validateColor(color: string): ValidationResult {
    const errors: string[] = [];

    if (!color || color.trim().length === 0) {
      errors.push('Color is required');
    } else if (!COLOR_REGEX.test(color)) {
      errors.push('Color must be a valid hex color (e.g., #6366f1)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a default color based on name
   */
  static generateDefaultColor(name: string): string {
    const colors = [
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#f59e0b', // Amber
      '#10b981', // Emerald
      '#3b82f6', // Blue
      '#ef4444', // Red
      '#14b8a6', // Teal
    ];

    // Use name hash to consistently pick a color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
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
      color: this.color,
      settings: this.settings,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
