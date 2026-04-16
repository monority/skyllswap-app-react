import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMatches } from '../../hooks/useMatches';

const mockApiFetch = vi.fn();
const mockCurrentUser = { id: 1, name: 'Test User', email: 'test@test.com' };

describe('useMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default filters', () => {
    const { result } = renderHook(() =>
      useMatches(mockCurrentUser as never, true, mockApiFetch)
    );

    expect(result.current.matchFilters).toEqual({
      city: '',
      availability: '',
    });
  });

  it('initializes without user', () => {
    const mockFetchPreview = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: 'Preview', bestMatch: null }),
    });

    const { result } = renderHook(() =>
      useMatches(null, true, mockFetchPreview)
    );

    expect(result.current.matchPreview).toBeNull();
  });

  describe('updateFilters', () => {
    it('updates city filter', () => {
      const { result } = renderHook(() =>
        useMatches(mockCurrentUser as never, true, mockApiFetch)
      );

      act(() => {
        result.current.updateFilters({ city: 'Paris', availability: '' });
      });

      expect(result.current.matchFilters.city).toBe('Paris');
    });

    it('updates availability filter', () => {
      const { result } = renderHook(() =>
        useMatches(mockCurrentUser as never, true, mockApiFetch)
      );

      act(() => {
        result.current.updateFilters({ city: '', availability: 'soir' });
      });

      expect(result.current.matchFilters.availability).toBe('soir');
    });

    it('merges with existing filters', () => {
      const { result } = renderHook(() =>
        useMatches(mockCurrentUser as never, true, mockApiFetch)
      );

      act(() => {
        result.current.updateFilters({ city: 'Lyon', availability: '' });
      });

      act(() => {
        result.current.updateFilters({ city: 'Paris', availability: 'matin' });
      });

      expect(result.current.matchFilters.city).toBe('Paris');
      expect(result.current.matchFilters.availability).toBe('matin');
    });
  });

  describe('hintMessage', () => {
    it('shows hint when no user', async () => {
      const mockFetchPreview = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: 'Preview', bestMatch: null }),
      });

      const { result } = renderHook(() =>
        useMatches(null, true, mockFetchPreview)
      );

      await waitFor(() => {
        expect(result.current.matchHintMessage).toBeTruthy();
      });
    });
  });
});
