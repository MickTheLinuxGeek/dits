import { useState } from 'react';
import { Save, Trash2, X, Star } from 'lucide-react';
import type { FilterPreset } from '../../../hooks/useFilterPresets';
import type { IssueFilters } from '../IssueListContainer/IssueListContainer';
import styles from './FilterPresetManager.module.css';

export interface FilterPresetManagerProps {
  /** All saved presets */
  presets: FilterPreset[];
  /** Current filters (to save as preset) */
  currentFilters: IssueFilters;
  /** Callback to save a new preset */
  onSave: (name: string) => void;
  /** Callback to load a preset */
  onLoad: (id: string) => void;
  /** Callback to delete a preset */
  onDelete: (id: string) => void;
  /** Callback when user closes the manager */
  onClose: () => void;
  /** Check if a preset name already exists */
  presetNameExists: (name: string) => boolean;
}

/**
 * FilterPresetManager component for managing saved filter configurations.
 *
 * Provides UI for:
 * - Saving current filters as a new preset
 * - Loading existing presets
 * - Deleting presets
 *
 * @example
 * ```tsx
 * <FilterPresetManager
 *   presets={presets}
 *   currentFilters={filters}
 *   onSave={handleSave}
 *   onLoad={handleLoad}
 *   onDelete={handleDelete}
 *   onClose={handleClose}
 *   presetNameExists={presetNameExists}
 * />
 * ```
 */
export function FilterPresetManager({
  presets,
  currentFilters,
  onSave,
  onLoad,
  onDelete,
  onClose,
  presetNameExists,
}: FilterPresetManagerProps) {
  const [presetName, setPresetName] = useState('');
  const [error, setError] = useState('');

  // Check if current filters have any active filters
  const hasActiveFilters =
    currentFilters.search !== '' ||
    currentFilters.status !== 'all' ||
    currentFilters.priority !== 'all' ||
    currentFilters.labels.length > 0 ||
    currentFilters.hasDate !== null;

  const handleSave = () => {
    const trimmed = presetName.trim();

    if (!trimmed) {
      setError('Please enter a preset name');
      return;
    }

    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (presetNameExists(trimmed)) {
      setError('A preset with this name already exists');
      return;
    }

    onSave(trimmed);
    setPresetName('');
    setError('');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete preset "${name}"?`)) {
      onDelete(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFilterDescription = (filters: IssueFilters): string => {
    const parts: string[] = [];

    if (filters.search) {
      parts.push(`Search: "${filters.search}"`);
    }
    if (filters.status !== 'all') {
      parts.push(`Status: ${filters.status}`);
    }
    if (filters.priority !== 'all') {
      parts.push(`Priority: ${filters.priority}`);
    }
    if (filters.labels.length > 0) {
      parts.push(
        `${filters.labels.length} label${filters.labels.length > 1 ? 's' : ''}`,
      );
    }
    if (filters.hasDate === true) {
      parts.push('With due date');
    } else if (filters.hasDate === false) {
      parts.push('Without due date');
    }

    return parts.length > 0 ? parts.join(' • ') : 'No filters';
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Star className={styles.titleIcon} />
            <h2>Filter Presets</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Save new preset section */}
        <div className={styles.saveSection}>
          <h3>Save Current Filters</h3>
          {hasActiveFilters ? (
            <div className={styles.saveForm}>
              <div className={styles.currentFilters}>
                <span className={styles.currentFiltersLabel}>
                  Active filters:
                </span>
                <span className={styles.currentFiltersDesc}>
                  {getFilterDescription(currentFilters)}
                </span>
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => {
                    setPresetName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter preset name..."
                  className={styles.input}
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSave}
                  className={styles.saveButton}
                  disabled={!presetName.trim()}
                >
                  <Save size={16} />
                  Save Preset
                </button>
              </div>
              {error && <div className={styles.error}>{error}</div>}
            </div>
          ) : (
            <div className={styles.noFilters}>
              No active filters. Apply some filters before saving a preset.
            </div>
          )}
        </div>

        {/* Presets list */}
        <div className={styles.presetsSection}>
          <h3>Saved Presets ({presets.length})</h3>
          {presets.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No saved presets yet.</p>
              <p className={styles.emptyHint}>
                Save your current filters to quickly access them later.
              </p>
            </div>
          ) : (
            <div className={styles.presetsList}>
              {presets.map((preset) => (
                <div key={preset.id} className={styles.presetItem}>
                  <div className={styles.presetInfo}>
                    <div className={styles.presetName}>{preset.name}</div>
                    <div className={styles.presetMeta}>
                      {getFilterDescription(preset.filters)}
                    </div>
                    <div className={styles.presetDate}>
                      Saved {formatDate(preset.createdAt)}
                    </div>
                  </div>
                  <div className={styles.presetActions}>
                    <button
                      type="button"
                      onClick={() => {
                        onLoad(preset.id);
                        onClose();
                      }}
                      className={styles.loadButton}
                      title="Load preset"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(preset.id, preset.name)}
                      className={styles.deleteButton}
                      title="Delete preset"
                      aria-label={`Delete ${preset.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
