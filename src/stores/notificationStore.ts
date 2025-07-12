import { create } from 'zustand';
import type { Notification, PagedResponse } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
  };
  setNotifications: (notifications: Notification[]) => void;
  setNotificationsFromPagedResponse: (response: PagedResponse<Notification>) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  removeNotification: (notificationId: string) => void;
  getUnreadCount: () => number;
  setPagination: (pagination: { totalElements: number; totalPages: number; currentPage: number }) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
  },
  
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => n.status === 'PENDING').length;
    set({ notifications, unreadCount });
  },
  
  setNotificationsFromPagedResponse: (response) => {
    const unreadCount = response.content.filter(n => n.status === 'PENDING').length;
    set({ 
      notifications: response.content, 
      unreadCount,
      pagination: {
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
      }
    });
  },
  
  addNotification: (notification) => {
    const { notifications } = get();
    const newNotifications = [notification, ...notifications];
    const unreadCount = newNotifications.filter(n => n.status === 'PENDING').length;
    set({ notifications: newNotifications, unreadCount });
  },
  
  markAsRead: (notificationId) => {
    const { notifications } = get();
    const newNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, status: 'READ' as const } : n
    );
    const unreadCount = newNotifications.filter(n => n.status === 'PENDING').length;
    set({ notifications: newNotifications, unreadCount });
  },
  
  removeNotification: (notificationId) => {
    const { notifications } = get();
    const newNotifications = notifications.filter(n => n.id !== notificationId);
    const unreadCount = newNotifications.filter(n => n.status === 'PENDING').length;
    set({ notifications: newNotifications, unreadCount });
  },
  
  getUnreadCount: () => get().unreadCount,
  
  setPagination: (pagination) => set({ pagination }),
}));