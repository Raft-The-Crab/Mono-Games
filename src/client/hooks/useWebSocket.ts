import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * Custom hook for WebSocket connection management
 * Handles connection, reconnection, message sending, and cleanup
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const { token } = useAuthStore();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = import.meta.env.VITE_WS_URL || 'localhost:5000';
      const wsUrl = `${protocol}//${host}/ws`;

      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
      setConnectionState('connecting');
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttempts.current = 0;

        // Authenticate with token
        if (token && ws.current) {
          ws.current.send(JSON.stringify({
            type: 'authenticate',
            token
          }));
        }

        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionState('error');
        onError?.(error);
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        setConnectionState('disconnected');
        ws.current = null;
        onDisconnect?.();

        // Attempt reconnection
        if (reconnect && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttempts.current - 1), 30000);
          console.log(`🔄 Reconnecting in ${delay}ms (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimer.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
          setConnectionState('error');
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [token, onMessage, onConnect, onDisconnect, onError, reconnect, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return {
    connectionState,
    reconnectAttempts: reconnectAttempts.current,
    isConnected,
    send,
    connect,
    disconnect
  };
}

/**
 * Hook for receiving real-time leaderboard updates
 */
export function useLeaderboardUpdates(
  gameId: string | null,
  onUpdate: (data: any) => void
) {
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'leaderboard_update' && message.gameId === gameId) {
      onUpdate(message.data);
    }
  }, [gameId, onUpdate]);

  const { isConnected, send } = useWebSocket({
    onMessage: handleMessage,
    onConnect: () => {
      if (gameId) {
        send({ type: 'subscribe', channel: `leaderboard:${gameId}` });
      }
    }
  });

  useEffect(() => {
    if (isConnected && gameId) {
      send({ type: 'subscribe', channel: `leaderboard:${gameId}` });

      return () => {
        send({ type: 'unsubscribe', channel: `leaderboard:${gameId}` });
      };
    }
  }, [isConnected, gameId, send]);

  return { isConnected };
}

/**
 * Hook for receiving system notifications
 */
export function useNotifications(
  onNotification: (notification: any) => void
) {
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'notification') {
      onNotification(message.data);
    }
  }, [onNotification]);

  const { isConnected } = useWebSocket({
    onMessage: handleMessage
  });

  return { isConnected };
}
