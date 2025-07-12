import { chatApi } from './api';
import { webSocketService } from './websocket';
import type { Message, PagedResponse } from '@/types';

export class ChatService {
  static async getChatMessages(chatId: string, page: number = 0, size: number = 20): Promise<PagedResponse<Message>> {
    try {
      return await chatApi.getMessages(chatId, page, size);
    } catch (error) {
      console.error('Failed to get chat messages:', error);
      throw error;
    }
  }

  static connectToChat(chatId: string, onMessageReceived: (message: Message) => void) {
    webSocketService.connect(chatId, {
      onMessageReceived,
      onConnectionEstablished: () => {
    
      },
      onConnectionError: (error) => {
        console.error('Chat connection error:', error);
      },
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