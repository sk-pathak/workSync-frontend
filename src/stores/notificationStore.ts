import { create } from 'zustand';
import type { Notification, PagedResponse } from '@/types';

interface NotificationState {
  notifications: Notification[];
  dismissedNotifications: Notification[];
  unreadCount: number;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
  };
  setNotifications: (notifications: Notification[]) => void;
  setNotificationsFromPagedResponse: (response: PagedResponse<Notification>) => void;
  setDismissedNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  dismissAll: () => void;
  getUnreadCount: () => number;
  setUnreadCount: (count: number) => void;
  setPagination: (pagination: { totalElements: number; totalPages: number; currentPage: number }) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  dismissedNotifications: [],
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

  setDismissedNotifications: (notifications) => {
    set({ dismissedNotifications: notifications });
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

  markAllAsRead: () => {
    const { notifications } = get();
    const newNotifications = notifications.map(n => ({ ...n, status: 'READ' as const }));
    set({ notifications: newNotifications, unreadCount: 0 });
  },

  removeNotification: (notificationId) => {
    const { notifications } = get();
    const newNotifications = notifications.filter(n => n.id !== notificationId);
    const unreadCount = newNotifications.filter(n => n.status === 'PENDING').length;
    set({ notifications: newNotifications, unreadCount });
  },

  dismissAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  getUnreadCount: () => get().unreadCount,

  setUnreadCount: (count) => set({ unreadCount: count }),

  setPagination: (pagination) => set({ pagination }),
}));