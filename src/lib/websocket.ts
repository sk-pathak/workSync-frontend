import './polyfills';
import { Client } from '@stomp/stompjs';
import { ErrorHandler } from './errorHandler';
import type { Message } from '@/types';
import { config } from './config';

interface WebSocketConfig {
  onMessageReceived: (message: Message) => void;
  onConnectionEstablished?: () => void;
  onConnectionError?: (error: any) => void;
  onConnectionLost?: () => void;
}

class WebSocketService {
  private client: Client | null = null;
  private chatId: string | null = null;
  private config: WebSocketConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(chatId: string, wsConfig: WebSocketConfig) {
    this.chatId = chatId;
    this.config = wsConfig;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    try {
      const SockJS = (await import('sockjs-client')).default;
      const socket = new SockJS(`${config.websocket.baseUrl}/ws?access_token=${token}`);
      
      this.client = new Client({
        webSocketFactory: () => socket,
        debug: () => {
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        this.reconnectAttempts = 0;
        this.subscribeToChat();
        ErrorHandler.showWebSocketConnected();
        this.config?.onConnectionEstablished?.();
      };

      this.client.onDisconnect = () => {
        console.log('WebSocket disconnected');
        this.config?.onConnectionLost?.();
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP Error:', frame);
        ErrorHandler.handleWebSocketError(frame);
        this.config?.onConnectionError?.(frame);
        
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
      };

      this.client.activate();
    } catch (error) {
      console.error('Failed to load SockJS:', error);
    }
  }

  private subscribeToChat() {
    if (!this.client || !this.chatId) return;
    
    this.client.subscribe(`/topic/chat/${this.chatId}`, (message) => {
      try {
        const rawMessageData = JSON.parse(message.body);
        
        const messageData: Message = {
          id: rawMessageData.id || `temp_${Date.now()}_${Math.random()}`,
          chatId: rawMessageData.chatId,
          senderId: rawMessageData.senderId,
          content: rawMessageData.content,
          sentAt: rawMessageData.sentAt,
          sender: rawMessageData.senderName ? {
            id: rawMessageData.senderId,
            username: rawMessageData.senderUsername || '',
            email: '',
            name: rawMessageData.senderName,
            avatarUrl: rawMessageData.senderAvatarUrl,
            role: 'USER',
            createdAt: '',
            updatedAt: ''
          } : undefined
        };
        
        if (!messageData.content || !messageData.senderId) {
          return;
        }
        
        this.config?.onMessageReceived(messageData);
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
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
    if (this.client) {
      this.client.deactivate();
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