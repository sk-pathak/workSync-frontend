import { create } from 'zustand';
import type { Message, PagedResponse } from '@/types';

interface ChatState {
  messages: Message[];
  loading: boolean;
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
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
  },
  
  setMessages: (messages) => set({ messages }),
  
  setMessagesFromPagedResponse: (response) => set((state) => {
    const content = response.content ? [...response.content].reverse() : [];
    const all = [...state.messages, ...content];
    const deduped = Array.from(new Map(all.map(m => [m.id, m])).values());
    return {
      messages: deduped,
      pagination: {
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        currentPage: response.number || 0,
      }
    };
  }),
  
  addMessage: (message) => {
    set((state) => {
      if (state.messages.some((m) => m.id === message.id)) {
        return {};
      }
      return { messages: [...state.messages, message] };
    });
  },
  
  clearMessages: () => set({ messages: [] }),
  
  setLoading: (loading) => set({ loading }),
  
  setPagination: (pagination) => set({ pagination }),

  prependMessagesFromPagedResponse: (response) => set((state) => {
    const content = response.content ? [...response.content].reverse() : [];
    const all = [...content, ...state.messages];
    const deduped = Array.from(new Map(all.map(m => [m.id, m])).values());
    return {
      messages: deduped,
      pagination: {
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        currentPage: response.number || 0,
      }
    };
  }),
}));