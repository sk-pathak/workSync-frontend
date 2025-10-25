import { create } from 'zustand';
import type { Message, PagedResponse } from '@/types';

interface ChatState {
  messages: Message[];
  loading: boolean;
  renderKey: number;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
  };
  setMessages: (messages: Message[]) => void;
  setMessagesFromPagedResponse: (response: PagedResponse<Message>) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: { totalElements: number; totalPages: number; currentPage: number }) => void;
  prependMessagesFromPagedResponse: (response: PagedResponse<Message>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  loading: false,
  renderKey: 0,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
  },
  
  setMessages: (messages) => set({ messages }),
  
  setMessagesFromPagedResponse: (response) => set((state) => {
    const content = response.content ? [...response.content].reverse() : [];
    const existingIds = new Set(state.messages.map(m => m.id));
    const newMessages = content.filter(m => !existingIds.has(m.id));
    const allMessages = [...state.messages, ...newMessages];
    
    return {
      messages: allMessages,
      pagination: {
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        currentPage: response.number || 0,
      }
    };
  }),
  
  addMessage: (message) => {
    set((state) => {
      if (message.id && !message.id.startsWith('temp_')) {
        if (state.messages.some((m) => m.id === message.id)) {
          return state;
        }
      } else {
        const recentMessages = state.messages.slice(-10);
        const isDuplicate = recentMessages.some((m) => 
          m.senderId === message.senderId && 
          m.content === message.content &&
          Math.abs(new Date(m.sentAt).getTime() - new Date(message.sentAt).getTime()) < 1000
        );
        
        if (isDuplicate) {
          return state;
        }
      }
      
      return { 
        messages: [...state.messages, message],
        renderKey: state.renderKey + 1
      };
    });
  },
  
  clearMessages: () => set({ messages: [] }),
  
  setLoading: (loading) => set({ loading }),
  
  setPagination: (pagination) => set({ pagination }),

  prependMessagesFromPagedResponse: (response) => set((state) => {
    const content = response.content ? [...response.content].reverse() : [];
    const existingIds = new Set(state.messages.map(m => m.id));
    const newMessages = content.filter(m => !existingIds.has(m.id));
    const allMessages = [...newMessages, ...state.messages];
    
    return {
      messages: allMessages,
      pagination: {
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        currentPage: response.number || 0,
      }
    };
  }),
}));