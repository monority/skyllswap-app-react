import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useApi, useApiInitialization } from '../../hooks/useApi';

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('apiFetch', () => {
    it('returns a function', () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useApi());

      expect(typeof result.current.apiFetch).toBe('function');
    });

    it('apiFetch returns Response object', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useApi());
      const response = await result.current.apiFetch('/test');

      expect(response).toHaveProperty('ok', true);
      expect(response).toHaveProperty('status', 200);
    });

    it('apiFetch handles errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useApi());

      await expect(result.current.apiFetch('/test')).rejects.toThrow('Network error');
    });
  });
});

describe('useApiInitialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    global.fetch = vi.fn().mockImplementation(
      () => new Promise(() => {})
    );

    const { result } = renderHook(() => useApiInitialization());

    expect(result.current.isLoading).toBe(true);
  });

  it('initializes with empty skills array', () => {
    global.fetch = vi.fn().mockImplementation(
      () => new Promise(() => {})
    );

    const { result } = renderHook(() => useApiInitialization());

    expect(result.current.skills).toEqual([]);
  });

  it('sets apiStatus to checking initially', () => {
    global.fetch = vi.fn().mockImplementation(
      () => new Promise(() => {})
    );

    const { result } = renderHook(() => useApiInitialization());

    expect(result.current.apiStatus).toBe('checking');
  });
});
