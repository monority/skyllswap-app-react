import { useState, useCallback, useEffect, useRef } from 'react';
import { useRealtime } from './useRealtime';

export interface Notification {
  id: string;
  type: 'message' | 'match' | 'system';
  title: string;
  body?: string;
  timestamp: Date;
  read: boolean;
  conversationId?: number;
}

interface UseNotificationsOptions {
  userId: number | null;
  enabled?: boolean;
}

export function useNotifications({
  userId,
  enabled = true,
}: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  const { isConnected, onNewMessage } = useRealtime({
    userId,
    enabled,
  });

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.body,
            icon: '/favicon.svg',
          });
        }
      }
    },
    []
  );

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!enabled || !userId || !onNewMessage) return;

    const unsubscribe = onNewMessage((data) => {
      addNotification({
        type: 'message',
        title: 'Nouveau message',
        body: data.message?.content
          ? `${data.message.sender?.name || "Quelqu'un"}: ${data.message.content}`
          : 'Vous avez un nouveau message',
        conversationId: data.conversationId,
      });
    });

    return unsubscribe;
  }, [enabled, userId, onNewMessage, addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    isConnected,
  };
}
