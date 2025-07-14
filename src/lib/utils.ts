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

  try {
    const { useProjectStore } = require('@/stores/projectStore');
    useProjectStore.getState().setProjects([]);
  } catch (error) {
    console.warn('Failed to clear project store:', error);
  }

  try {
    const { useTaskStore } = require('@/stores/taskStore');
    useTaskStore.getState().clearTasks();
  } catch (error) {
    console.warn('Failed to clear task store:', error);
  }
};
