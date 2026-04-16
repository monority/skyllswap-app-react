import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMatchFilters } from '../../hooks/useMatchFilters';

describe('useMatchFilters', () => {
  it('initializes with default filters', () => {
    const { result } = renderHook(() => useMatchFilters());

    expect(result.current.filters).toEqual({
      city: '',
      availability: '',
    });
  });

  it('initializes with custom initial filters', () => {
    const { result } = renderHook(() =>
      useMatchFilters({ city: 'Paris' })
    );

    expect(result.current.filters.city).toBe('Paris');
    expect(result.current.filters.availability).toBe('');
  });

  it('updates city filter', () => {
    const { result } = renderHook(() => useMatchFilters());

    act(() => {
      result.current.updateFilters({ city: 'Lyon' });
    });

    expect(result.current.filters.city).toBe('Lyon');
  });

  it('updates availability filter', () => {
    const { result } = renderHook(() => useMatchFilters());

    act(() => {
      result.current.updateFilters({ availability: 'soir' });
    });

    expect(result.current.filters.availability).toBe('soir');
  });

  it('merges filters', () => {
    const { result } = renderHook(() => useMatchFilters());

    act(() => {
      result.current.updateFilters({ city: 'Paris' });
    });

    act(() => {
      result.current.updateFilters({ availability: 'matin' });
    });

    expect(result.current.filters.city).toBe('Paris');
    expect(result.current.filters.availability).toBe('matin');
  });

  it('resets filters', () => {
    const { result } = renderHook(() => useMatchFilters());

    act(() => {
      result.current.updateFilters({ city: 'Paris', availability: 'soir' });
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual({ city: '', availability: '' });
  });

  it('detects active filters', () => {
    const { result } = renderHook(() => useMatchFilters());

    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.updateFilters({ city: 'Paris' });
    });

    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('detects no active filters when empty', () => {
    const { result } = renderHook(() =>
      useMatchFilters({ city: '', availability: '' })
    );

    expect(result.current.hasActiveFilters).toBe(false);
  });
});
