import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';

const mockApiFetch = vi.fn();

vi.mock('../../services/api', () => ({
  apiService: {
    postJson: vi.fn(),
    setCsrfToken: vi.fn(),
    clearCsrfToken: vi.fn(),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({}),
    });
  });

  describe('logout', () => {
    it('clears current user on logout', async () => {
      mockApiFetch.mockImplementationOnce(() => new Promise(() => {}));
      mockApiFetch.mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() => useAuth(mockApiFetch));

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.currentUser).toBeNull();
      });
    });

    it('calls logout endpoint', async () => {
      mockApiFetch.mockImplementationOnce(() => new Promise(() => {}));
      mockApiFetch.mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() => useAuth(mockApiFetch));

      await act(async () => {
        await result.current.logout();
      });

      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
      });
    });
  });

  describe('authResolved', () => {
    it('starts as false', () => {
      mockApiFetch.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useAuth(mockApiFetch));

      expect(result.current.authResolved).toBe(false);
    });
  });
});
