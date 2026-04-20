import { useEffect, useCallback, useRef, useState } from 'react';
import io from 'socket.io-client';

interface SocketIO {
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback?: (...args: unknown[]) => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
  disconnect: () => void;
  connected: boolean;
}

interface UseRealtimeOptions {
  userId: number | null;
  enabled?: boolean;
}

interface UseRealtimeReturn {
  isConnected: boolean;
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  onNewMessage: (
    callback: (data: { message?: { content?: string; sender?: { name?: string } }; conversationId?: number }) => void
  ) => () => void;
  onConversationUpdated: (
    callback: (data: { conversationId: number }) => void
  ) => () => void;
  disconnect: () => void;
}

export const useRealtime = ({
  userId,
  enabled = true,
}: UseRealtimeOptions): UseRealtimeReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<SocketIO | null>(null);
  const listenersRef = useRef<{
    newMessage: Set<
      (data: { message?: { content?: string; sender?: { name?: string } }; conversationId?: number }) => void
    >;
    conversationUpdated: Set<(data: { conversationId: number }) => void>;
  }>({
    newMessage: new Set(),
    conversationUpdated: new Set(),
  });

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    } as any);

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('newMessage', (data: unknown) => {
      const typedData = data as { message?: { content?: string; sender?: { name?: string } }; conversationId?: number };
      listenersRef.current.newMessage.forEach(callback => callback(typedData));
    });

    socket.on('conversationUpdated', (data: unknown) => {
      const typedData = data as { conversationId: number };
      listenersRef.current.conversationUpdated.forEach(callback =>
        callback(typedData)
      );
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [enabled, userId]);

  const joinConversation = useCallback((conversationId: number) => {
    socketRef.current?.emit('joinConversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: number) => {
    socketRef.current?.emit('leaveConversation', conversationId);
  }, []);

  const onNewMessage = useCallback(
    (
      callback: (data: { message?: { content?: string; sender?: { name?: string } }; conversationId?: number }) => void
    ) => {
      listenersRef.current.newMessage.add(callback);
      return () => {
        listenersRef.current.newMessage.delete(callback);
      };
    },
    []
  );

  const onConversationUpdated = useCallback(
    (callback: (data: { conversationId: number }) => void) => {
      listenersRef.current.conversationUpdated.add(callback);
      return () => {
        listenersRef.current.conversationUpdated.delete(callback);
      };
    },
    []
  );

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  return {
    isConnected,
    joinConversation,
    leaveConversation,
    onNewMessage,
    onConversationUpdated,
    disconnect,
  };
};
