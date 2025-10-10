import { User as PrismaUser } from '@prisma/client';
import { UserPreferences, ValidationResult } from './types';

/**
 * User model class with type-safe preferences handling
 *
 * Represents a single user in the DITS system. This is the root entity
 * for single-tenant architecture.
 */
export class User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PrismaUser) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.avatar = data.avatar;
    this.preferences = this.parsePreferences(data.preferences);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Parse and validate user preferences from JSON
   */
  private parsePreferences(preferences: unknown): UserPreferences {
    if (typeof preferences !== 'object' || preferences === null) {
      return {};
    }
    return preferences as UserPreferences;
  }

  /**
   * Get a specific preference value with type safety
   */
  getPreference<K extends keyof UserPreferences>(
    key: K,
  ): UserPreferences[K] | undefined {
    return this.preferences[key];
  }

  /**
   * Set a specific preference value
   */
  setPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ): void {
    this.preferences[key] = value;
  }

  /**
   * Update multiple preferences at once
   */
  updatePreferences(newPreferences: Partial<UserPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...newPreferences,
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate user name
   */
  static validateName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Name is required');
    } else if (name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (name.length > 100) {
      errors.push('Name must not exceed 100 characters');
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
      email: this.email,
      name: this.name,
      avatar: this.avatar,
      preferences: this.preferences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to safe object (excluding sensitive data)
   */
  toSafeJSON(): Record<string, unknown> {
    const json = this.toJSON();
    // Remove any sensitive fields if needed
    return json;
  }
}
