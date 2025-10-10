import {
  GitIntegration as PrismaGitIntegration,
  GitProvider,
} from '@prisma/client';
import { GitIntegrationMetadata, ValidationResult } from './types';

/**
 * GitIntegration model class for Git provider integrations
 *
 * Represents the link between an issue and version control artifacts
 * (branches, PRs, commits) across different Git providers.
 */
export class GitIntegration {
  id: string;
  userId: string;
  issueId: string;
  provider: GitProvider;
  repository: string;
  branchName: string | null;
  prUrl: string | null;
  commitHash: string | null;
  metadata: GitIntegrationMetadata;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PrismaGitIntegration) {
    this.id = data.id;
    this.userId = data.userId;
    this.issueId = data.issueId;
    this.provider = data.provider;
    this.repository = data.repository;
    this.branchName = data.branchName;
    this.prUrl = data.prUrl;
    this.commitHash = data.commitHash;
    this.metadata = this.parseMetadata(data.metadata);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Parse and validate Git integration metadata from JSON
   */
  private parseMetadata(metadata: unknown): GitIntegrationMetadata {
    if (typeof metadata !== 'object' || metadata === null) {
      return {};
    }
    return metadata as GitIntegrationMetadata;
  }

  /**
   * Get a specific metadata value with type safety
   */
  getMetadata<K extends keyof GitIntegrationMetadata>(
    key: K,
  ): GitIntegrationMetadata[K] | undefined {
    return this.metadata[key];
  }

  /**
   * Set a specific metadata value
   */
  setMetadata<K extends keyof GitIntegrationMetadata>(
    key: K,
    value: GitIntegrationMetadata[K],
  ): void {
    this.metadata[key] = value;
  }

  /**
   * Update multiple metadata fields at once
   */
  updateMetadata(newMetadata: Partial<GitIntegrationMetadata>): void {
    this.metadata = {
      ...this.metadata,
      ...newMetadata,
    };
  }

  /**
   * Check if integration has a branch
   */
  hasBranch(): boolean {
    return this.branchName !== null && this.branchName.length > 0;
  }

  /**
   * Check if integration has a PR/MR
   */
  hasPullRequest(): boolean {
    return this.prUrl !== null && this.prUrl.length > 0;
  }

  /**
   * Check if integration has commits
   */
  hasCommits(): boolean {
    return this.commitHash !== null && this.commitHash.length > 0;
  }

  /**
   * Get PR status
   */
  getPrStatus(): 'open' | 'closed' | 'merged' | null {
    return this.metadata.prStatus || null;
  }

  /**
   * Check if PR is open
   */
  isPrOpen(): boolean {
    return this.getPrStatus() === 'open';
  }

  /**
   * Check if PR is merged
   */
  isPrMerged(): boolean {
    return this.getPrStatus() === 'merged';
  }

  /**
   * Check if PR is closed
   */
  isPrClosed(): boolean {
    return this.getPrStatus() === 'closed';
  }

  /**
   * Get commit count
   */
  getCommitCount(): number {
    return this.metadata.commitCount || 0;
  }

  /**
   * Get code statistics
   */
  getCodeStats(): { additions: number; deletions: number } | null {
    const additions = this.metadata.additions;
    const deletions = this.metadata.deletions;

    if (additions !== undefined && deletions !== undefined) {
      return { additions, deletions };
    }

    return null;
  }

  /**
   * Generate branch name from issue title and priority
   */
  static generateBranchName(
    issueId: string,
    issueTitle: string,
    priority?: string,
  ): string {
    // Normalize title for branch name
    const normalizedTitle = issueTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
      .replace(/-+$/, '');

    // Determine branch prefix based on priority
    let prefix = 'feature';
    if (priority === 'URGENT') {
      prefix = 'hotfix';
    } else if (priority === 'HIGH') {
      prefix = 'bugfix';
    }

    // Use short ID (first 8 characters)
    const shortId = issueId.substring(0, 8);

    return `${prefix}/${shortId}-${normalizedTitle}`;
  }

  /**
   * Validate Git provider
   */
  static validateProvider(provider: GitProvider): ValidationResult {
    const errors: string[] = [];
    const validProviders = Object.values(GitProvider);

    if (!validProviders.includes(provider)) {
      errors.push(
        `Invalid Git provider. Must be one of: ${validProviders.join(', ')}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate repository format
   */
  static validateRepository(repository: string): ValidationResult {
    const errors: string[] = [];

    if (!repository || repository.trim().length === 0) {
      errors.push('Repository is required');
    }

    // Check for basic format: owner/repo
    const repoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
    if (repository && !repoRegex.test(repository)) {
      errors.push('Repository must be in format: owner/repo');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate branch name
   */
  static validateBranchName(branchName: string): ValidationResult {
    const errors: string[] = [];

    if (!branchName || branchName.trim().length === 0) {
      errors.push('Branch name is required');
    }

    // Check for invalid characters
    const invalidChars = /[~^:?*\[\]\\\s]/;
    if (branchName && invalidChars.test(branchName)) {
      errors.push('Branch name contains invalid characters');
    }

    // Check for invalid patterns
    if (
      branchName &&
      (branchName.startsWith('/') || branchName.endsWith('/'))
    ) {
      errors.push('Branch name cannot start or end with a slash');
    }

    if (branchName && branchName.includes('..')) {
      errors.push('Branch name cannot contain ".."');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate PR URL
   */
  static validatePrUrl(prUrl: string, provider: GitProvider): ValidationResult {
    const errors: string[] = [];

    if (!prUrl || prUrl.trim().length === 0) {
      errors.push('PR URL is required');
    }

    // Basic URL validation
    try {
      const url = new URL(prUrl);

      // Provider-specific validation
      if (
        provider === GitProvider.GITHUB &&
        !url.hostname.includes('github.com')
      ) {
        errors.push('PR URL must be from github.com');
      } else if (
        provider === GitProvider.GITLAB &&
        !url.hostname.includes('gitlab.com')
      ) {
        errors.push('PR URL must be from gitlab.com');
      } else if (
        provider === GitProvider.BITBUCKET &&
        !url.hostname.includes('bitbucket.org')
      ) {
        errors.push('PR URL must be from bitbucket.org');
      }
    } catch {
      errors.push('Invalid PR URL format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate commit hash
   */
  static validateCommitHash(commitHash: string): ValidationResult {
    const errors: string[] = [];

    if (!commitHash || commitHash.trim().length === 0) {
      errors.push('Commit hash is required');
    }

    // Check for valid Git SHA-1 hash format (40 hex characters or 7+ for short hash)
    const hashRegex = /^[a-f0-9]{7,40}$/i;
    if (commitHash && !hashRegex.test(commitHash)) {
      errors.push('Invalid commit hash format');
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
      issueId: this.issueId,
      provider: this.provider,
      repository: this.repository,
      branchName: this.branchName,
      prUrl: this.prUrl,
      commitHash: this.commitHash,
      metadata: this.metadata,
      prStatus: this.getPrStatus(),
      commitCount: this.getCommitCount(),
      codeStats: this.getCodeStats(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
