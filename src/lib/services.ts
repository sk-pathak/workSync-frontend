import { chatApi } from './api';
import { webSocketService } from './websocket';
import type { Message, PagedResponse } from '@/types';

interface ChatConnectionCallbacks {
  onConnectionEstablished?: () => void;
  onConnectionLost?: () => void;
  onConnectionError?: (error: any) => void;
  onReconnecting?: () => void;
}

export class ChatService {
  static async getChatMessages(chatId: string, page: number = 0, size: number = 20): Promise<PagedResponse<Message>> {
    try {
      return await chatApi.getMessages(chatId, page, size);
    } catch (error) {
      throw error;
    }
  }

  static connectToChat(
    chatId: string, 
    onMessageReceived: (message: Message) => void,
    callbacks?: ChatConnectionCallbacks
  ) {
    webSocketService.connect(chatId, {
      onMessageReceived,
      onConnectionEstablished: callbacks?.onConnectionEstablished || (() => {}),
      onConnectionLost: callbacks?.onConnectionLost || (() => {}),
      onConnectionError: callbacks?.onConnectionError || ((error) => {
        console.error('WebSocket connection error', error);
      }),
      onReconnecting: callbacks?.onReconnecting || (() => {}),
    });
  }

  static sendMessage(content: string) {
    webSocketService.sendMessage(content);
  }

  static disconnect() {
    webSocketService.disconnect();
  }

  static isConnected(): boolean {
    return webSocketService.isConnected();
  }
}