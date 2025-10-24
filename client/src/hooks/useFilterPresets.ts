import { useState, useCallback, useEffect } from 'react';
import type { IssueFilters } from '../components/issues/IssueListContainer/IssueListContainer';

export interface FilterPreset {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Filter configuration */
  filters: IssueFilters;
  /** When the preset was created */
  createdAt: string;
  /** When the preset was last updated */
  updatedAt: string;
}

export interface UseFilterPresetsReturn {
  /** All saved presets */
  presets: FilterPreset[];
  /** Save a new preset */
  savePreset: (name: string, filters: IssueFilters) => FilterPreset;
  /** Update an existing preset */
  updatePreset: (id: string, name: string, filters: IssueFilters) => void;
  /** Delete a preset */
  deletePreset: (id: string) => void;
  /** Load a preset (returns the filters) */
  loadPreset: (id: string) => IssueFilters | null;
  /** Get a specific preset */
  getPreset: (id: string) => FilterPreset | undefined;
  /** Check if a preset name exists */
  presetNameExists: (name: string) => boolean;
}

const STORAGE_KEY = 'dits_filter_presets';

/**
 * Custom hook for managing filter presets with localStorage persistence.
 *
 * Allows users to save, load, update, and delete filter configurations
 * for quick access to commonly used filter combinations.
 *
 * @example
 * ```tsx
 * const { presets, savePreset, loadPreset, deletePreset } = useFilterPresets();
 *
 * // Save current filters as a preset
 * const preset = savePreset('My Filters', currentFilters);
 *
 * // Load a preset
 * const filters = loadPreset(preset.id);
 * if (filters) {
 *   setFilters(filters);
 * }
 *
 * // Delete a preset
 * deletePreset(preset.id);
 * ```
 */
export function useFilterPresets(): UseFilterPresetsReturn {
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    // Load presets from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error);
    }
    return [];
  });

  // Save presets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error('Failed to save filter presets:', error);
    }
  }, [presets]);

  // Generate a unique ID
  const generateId = useCallback(() => {
    return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Save a new preset
  const savePreset = useCallback(
    (name: string, filters: IssueFilters): FilterPreset => {
      const now = new Date().toISOString();
      const newPreset: FilterPreset = {
        id: generateId(),
        name: name.trim(),
        filters: { ...filters },
        createdAt: now,
        updatedAt: now,
      };

      setPresets((prev) => [...prev, newPreset]);
      return newPreset;
    },
    [generateId],
  );

  // Update an existing preset
  const updatePreset = useCallback(
    (id: string, name: string, filters: IssueFilters) => {
      setPresets((prev) =>
        prev.map((preset) =>
          preset.id === id
            ? {
                ...preset,
                name: name.trim(),
                filters: { ...filters },
                updatedAt: new Date().toISOString(),
              }
            : preset,
        ),
      );
    },
    [],
  );

  // Delete a preset
  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((preset) => preset.id !== id));
  }, []);

  // Load a preset (returns the filters)
  const loadPreset = useCallback(
    (id: string): IssueFilters | null => {
      const preset = presets.find((p) => p.id === id);
      return preset ? { ...preset.filters } : null;
    },
    [presets],
  );

  // Get a specific preset
  const getPreset = useCallback(
    (id: string): FilterPreset | undefined => {
      return presets.find((p) => p.id === id);
    },
    [presets],
  );

  // Check if a preset name exists
  const presetNameExists = useCallback(
    (name: string): boolean => {
      return presets.some(
        (p) => p.name.toLowerCase() === name.toLowerCase().trim(),
      );
    },
    [presets],
  );

  return {
    presets,
    savePreset,
    updatePreset,
    deletePreset,
    loadPreset,
    getPreset,
    presetNameExists,
  };
}
