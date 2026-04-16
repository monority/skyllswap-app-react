import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
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
  });

  describe('logout', () => {
    it('clears current user on logout', async () => {
      mockApiFetch.mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() => useAuth(mockApiFetch));

      result.current.logout();

      await waitFor(() => {
        expect(result.current.currentUser).toBeNull();
      });
    });

    it('calls logout endpoint', async () => {
      mockApiFetch.mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() => useAuth(mockApiFetch));

      await result.current.logout();

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
