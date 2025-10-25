import { Client } from '@stomp/stompjs';
import { ErrorHandler } from './errorHandler';
import type { Message } from '@/types';
import { config } from './config';

interface WebSocketConfig {
  onMessageReceived: (message: Message) => void;
  onConnectionEstablished?: () => void;
  onConnectionError?: (error: any) => void;
  onConnectionLost?: () => void;
  onReconnecting?: () => void;
}

class WebSocketService {
  private client: Client | null = null;
  private chatId: string | null = null;
  private config: WebSocketConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;

  async connect(chatId: string, wsConfig: WebSocketConfig) {
    this.chatId = chatId;
    this.config = wsConfig;
    this.isManualDisconnect = false;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      wsConfig.onConnectionError?.(new Error('No authentication token'));
      return;
    }

    // Disconnect existing client if any
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        // Ignore deactivation errors
      }
      this.client = null;
    }

    try {      
      const SockJS = (await import('sockjs-client')).default;
      const wsUrl = `${config.websocket.baseUrl}/ws?access_token=${token}`;
      
      this.client = new Client({
        webSocketFactory: () => {
          const socket = new SockJS(wsUrl);
          
          socket.onerror = (err: any) => {
            console.error('SockJS error:', err);
          };
          
          return socket;
        },
        reconnectDelay: 0, // We'll handle reconnection manually
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      });

      this.client.onConnect = () => {
        this.reconnectAttempts = 0;
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
        this.subscribeToChat();
        ErrorHandler.showWebSocketConnected();
        this.config?.onConnectionEstablished?.();
      };

      this.client.onDisconnect = () => {
        this.config?.onConnectionLost?.();
        
        // Only attempt reconnect if not manually disconnected
        if (!this.isManualDisconnect) {
          this.attemptReconnect();
        }
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP Error:', frame);
        ErrorHandler.handleWebSocketError(frame);
        this.config?.onConnectionError?.(frame);
        
        // Don't call attemptReconnect here - onDisconnect will handle it
      };

      this.client.onWebSocketError = (event) => {
        console.error('WebSocket Error:', event);
        this.config?.onConnectionError?.(event);
        
        // Don't call attemptReconnect here - onDisconnect will handle it
      };

      this.client.activate();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.config?.onConnectionError?.(error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      ErrorHandler.handleApiError(new Error('Failed to reconnect to chat after multiple attempts'));
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    this.config?.onReconnecting?.();
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);    
    this.reconnectTimeout = setTimeout(() => {
      if (this.chatId && this.config) {
        this.connect(this.chatId, this.config);
      }
    }, delay);
  }

  private subscribeToChat() {
    if (!this.client || !this.chatId) return;
    
    this.client.subscribe(`/topic/chat/${this.chatId}`, (message) => {
      try {
        const rawMessageData = JSON.parse(message.body);
        
        // Transform WebSocket message to match our Message type
        const messageData: Message = {
          id: rawMessageData.id || `temp_${Date.now()}_${Math.random()}`,
          chatId: rawMessageData.chatId,
          senderId: rawMessageData.senderId,
          content: rawMessageData.content,
          sentAt: rawMessageData.sentAt,
          sender: {
            id: rawMessageData.senderId,
            username: rawMessageData.senderUsername || '',
            email: '',
            name: rawMessageData.senderName || rawMessageData.senderUsername || '',
            avatarUrl: rawMessageData.senderAvatarUrl,
            role: 'USER',
            createdAt: '',
            updatedAt: ''
          }
        };
        
        if (!messageData.content || !messageData.senderId) {
          return;
        }
        
        this.config?.onMessageReceived(messageData);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  }

  sendMessage(content: string) {
    if (!this.client || !this.chatId || !this.client.connected) {
      return;
    }

    const message = {
      content: content,
    };
    
    this.client.publish({
      destination: `/app/chat.send/${this.chatId}`,
      body: JSON.stringify(message),
    });
  }

  disconnect() {
    this.isManualDisconnect = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        console.error('Error deactivating client:', e);
      }
      this.client = null;
    }
    
    this.chatId = null;
    this.config = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;