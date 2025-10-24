import { renderHook, act } from '@testing-library/react';
import { useFilterPresets } from './useFilterPresets';
import type { IssueFilters } from '../components/issues/IssueListContainer/IssueListContainer';

describe('useFilterPresets', () => {
  const STORAGE_KEY = 'dits_filter_presets';

  const mockFilters: IssueFilters = {
    search: 'test',
    status: 'todo',
    priority: 'high',
    labels: ['label1'],
    hasDate: true,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with empty presets array', () => {
    const { result } = renderHook(() => useFilterPresets());
    expect(result.current.presets).toEqual([]);
  });

  it('loads presets from localStorage on mount', () => {
    const savedPresets = [
      {
        id: 'preset1',
        name: 'My Preset',
        filters: mockFilters,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPresets));

    const { result } = renderHook(() => useFilterPresets());
    expect(result.current.presets).toEqual(savedPresets);
  });

  it('saves a new preset', () => {
    const { result } = renderHook(() => useFilterPresets());

    let preset;
    act(() => {
      preset = result.current.savePreset('Test Preset', mockFilters);
    });

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('Test Preset');
    expect(result.current.presets[0].filters).toEqual(mockFilters);
    expect(preset).toBeDefined();
    expect(preset?.id).toBeDefined();
    expect(preset?.createdAt).toBeDefined();
    expect(preset?.updatedAt).toBeDefined();
  });

  it('trims preset name when saving', () => {
    const { result } = renderHook(() => useFilterPresets());

    act(() => {
      result.current.savePreset('  Test Preset  ', mockFilters);
    });

    expect(result.current.presets[0].name).toBe('Test Preset');
  });

  it('persists presets to localStorage when saved', () => {
    const { result } = renderHook(() => useFilterPresets());

    act(() => {
      result.current.savePreset('Test Preset', mockFilters);
    });

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Test Preset');
  });

  it('updates an existing preset', () => {
    const { result } = renderHook(() => useFilterPresets());

    let presetId: string;
    act(() => {
      const preset = result.current.savePreset('Test Preset', mockFilters);
      presetId = preset.id;
    });

    const newFilters: IssueFilters = {
      search: 'updated',
      status: 'in-progress',
      priority: 'low',
      labels: [],
      hasDate: null,
    };

    act(() => {
      result.current.updatePreset(presetId, 'Updated Preset', newFilters);
    });

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('Updated Preset');
    expect(result.current.presets[0].filters).toEqual(newFilters);
  });

  it('deletes a preset', () => {
    const { result } = renderHook(() => useFilterPresets());

    let presetId: string;
    act(() => {
      const preset = result.current.savePreset('Test Preset', mockFilters);
      presetId = preset.id;
    });

    expect(result.current.presets).toHaveLength(1);

    act(() => {
      result.current.deletePreset(presetId);
    });

    expect(result.current.presets).toHaveLength(0);
  });

  it('loads a preset by ID', () => {
    const { result } = renderHook(() => useFilterPresets());

    let presetId: string;
    act(() => {
      const preset = result.current.savePreset('Test Preset', mockFilters);
      presetId = preset.id;
    });

    const loaded = result.current.loadPreset(presetId);
    expect(loaded).toEqual(mockFilters);
  });

  it('returns null when loading non-existent preset', () => {
    const { result } = renderHook(() => useFilterPresets());

    const loaded = result.current.loadPreset('non-existent-id');
    expect(loaded).toBeNull();
  });

  it('gets a specific preset by ID', () => {
    const { result } = renderHook(() => useFilterPresets());

    let presetId: string;
    act(() => {
      const preset = result.current.savePreset('Test Preset', mockFilters);
      presetId = preset.id;
    });

    const preset = result.current.getPreset(presetId);
    expect(preset).toBeDefined();
    expect(preset?.name).toBe('Test Preset');
  });

  it('returns undefined when getting non-existent preset', () => {
    const { result } = renderHook(() => useFilterPresets());

    const preset = result.current.getPreset('non-existent-id');
    expect(preset).toBeUndefined();
  });

  it('checks if preset name exists (case-insensitive)', () => {
    const { result } = renderHook(() => useFilterPresets());

    act(() => {
      result.current.savePreset('Test Preset', mockFilters);
    });

    expect(result.current.presetNameExists('Test Preset')).toBe(true);
    expect(result.current.presetNameExists('test preset')).toBe(true);
    expect(result.current.presetNameExists('TEST PRESET')).toBe(true);
    expect(result.current.presetNameExists('Other Preset')).toBe(false);
  });

  it('handles multiple presets', () => {
    const { result } = renderHook(() => useFilterPresets());

    act(() => {
      result.current.savePreset('Preset 1', mockFilters);
      result.current.savePreset('Preset 2', {
        ...mockFilters,
        search: 'test2',
      });
      result.current.savePreset('Preset 3', {
        ...mockFilters,
        search: 'test3',
      });
    });

    expect(result.current.presets).toHaveLength(3);
    expect(result.current.presets[0].name).toBe('Preset 1');
    expect(result.current.presets[1].name).toBe('Preset 2');
    expect(result.current.presets[2].name).toBe('Preset 3');
  });

  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid json{{{');

    const { result } = renderHook(() => useFilterPresets());
    expect(result.current.presets).toEqual([]);
  });

  it('handles non-array data in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));

    const { result } = renderHook(() => useFilterPresets());
    expect(result.current.presets).toEqual([]);
  });
});
