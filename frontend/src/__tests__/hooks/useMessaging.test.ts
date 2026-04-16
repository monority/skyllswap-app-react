import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMessaging } from '../../hooks/useMessaging';

const mockApiFetch = vi.fn();
const mockCurrentUser = { id: 1, name: 'Test User', email: 'test@test.com' };
const mockOnNewMessage = vi.fn();
const mockOnConversationUpdated = vi.fn();

vi.mock('../../hooks/useRealtime', () => ({
  useRealtime: vi.fn(() => ({
    isConnected: false,
    subscribeToConversation: vi.fn(),
    unsubscribeFromConversation: vi.fn(),
    onNewMessage: mockOnNewMessage,
    onConversationUpdated: mockOnConversationUpdated,
  })),
}));

describe('useMessaging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty conversations', () => {
    const { result } = renderHook(() =>
      useMessaging(mockCurrentUser as never, true, mockApiFetch)
    );

    expect(result.current.conversations).toEqual([]);
    expect(result.current.activeConvId).toBeNull();
  });

  it('initializes without user', () => {
    const { result } = renderHook(() =>
      useMessaging(null, true, mockApiFetch)
    );

    expect(result.current.conversations).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  describe('newMessage state', () => {
    it('updates newMessage state', () => {
      const { result } = renderHook(() =>
        useMessaging(mockCurrentUser as never, true, mockApiFetch)
      );

      act(() => {
        result.current.setNewMessage('Hello');
      });

      expect(result.current.newMessage).toBe('Hello');
    });
  });

  describe('isUnread', () => {
    it('returns function for checking unread', () => {
      const { result } = renderHook(() =>
        useMessaging(mockCurrentUser as never, true, mockApiFetch)
      );

      expect(typeof result.current.isUnread).toBe('function');
    });
  });
});
