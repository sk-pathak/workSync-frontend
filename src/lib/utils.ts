import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clearAllStores = () => {
  try {
    const { useNotificationStore } = require('@/stores/notificationStore');
    useNotificationStore.getState().setNotifications([]);
  } catch (error) {
    console.warn('Failed to clear notification store:', error);
  }

  try {
    const { useChatStore } = require('@/stores/chatStore');
    useChatStore.getState().clearMessages();
  } catch (error) {
    console.warn('Failed to clear chat store:', error);
  }
};
