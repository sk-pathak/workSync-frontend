import axios from 'axios';
import { ErrorHandler } from './errorHandler';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  Notification,
  ProjectFilters,
  PagedResponse,
  GithubAnalyticsDTO,
  Message,
} from '@/types';

import { config } from './config';

const API_BASE_URL = config.api.baseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (config.method === 'get') {
    config.headers['Cache-Control'] = 'max-age=300';
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = response.config.url;
      if (cacheKey) {
        sessionStorage.setItem(`cache_${cacheKey}`, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error;
      if (errorMessage === 'TOKEN_EXPIRED') {
        import('@/stores/authStore').then(async ({ useAuthStore }) => {
          const logout = useAuthStore.getState().logout;
          await logout();
          window.location.href = '/login';
        });
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    ErrorHandler.handleApiError(error, 'API Request');
    return Promise.reject(error);
  }
);

const getCachedResponse = (url: string) => {
  const cached = sessionStorage.getItem(`cache_${url}`);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    if (now - timestamp < 5 * 60 * 1000) {
      return data;
    }
    sessionStorage.removeItem(`cache_${url}`);
  }
  return null;
};

const clearCache = (pattern?: string) => {
  if (pattern) {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('cache_') && key.includes(pattern)) {
        sessionStorage.removeItem(key);
      }
    });
  } else {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post('/api/auth/login', data);
    return res.data;
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post('/api/auth/register', data);
    return res.data;
  },
  
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
  },
  
  getCurrentUser: async (): Promise<User> => {
    const res = await api.get('/api/users/me');
    return res.data;
  },
};

export const userApi = {
  getCurrentUser: async (): Promise<User> => {
    const cached = getCachedResponse('/api/users/me');
    if (cached) return cached;
    const res = await api.get('/api/users/me');
    return res.data;
  },
  
  updateCurrentUser: async (data: Partial<User>): Promise<User> => {
    clearCache('/api/users/me');
    const res = await api.put('/api/users/me', data);
    return res.data;
  },
  
  getOwnedProjects: async (): Promise<PagedResponse<Project>> => {
    const cached = getCachedResponse('/api/users/me/projects/owned');
    if (cached) return cached;
    const res = await api.get('/api/users/me/projects/owned');
    return res.data;
  },
  
  getJoinedProjects: async (): Promise<PagedResponse<Project>> => {
    const cached = getCachedResponse('/api/users/me/projects/joined');
    if (cached) return cached;
    const res = await api.get('/api/users/me/projects/joined');
    return res.data;
  },
  
  getStarredProjects: async (): Promise<PagedResponse<Project>> => {
    const cached = getCachedResponse('/api/users/me/projects/starred');
    if (cached) return cached;
    const res = await api.get('/api/users/me/projects/starred');
    return res.data;
  },
};

export const projectsApi = {
  getAll: async (filters?: ProjectFilters): Promise<PagedResponse<Project>> => {
    const apiParams: any = {};
    
    if (filters?.status) {
      apiParams.status = filters.status;
    }
    if (filters?.owned !== undefined) {
      apiParams.ownedByMe = filters.owned;
    }
    if (filters?.member !== undefined) {
      apiParams.memberOf = filters.member;
    }
    if (filters?.starred !== undefined) {
      apiParams.starred = filters.starred;
    }
    if (filters?.page !== undefined) {
      apiParams.page = filters.page;
    }
    if (filters?.size !== undefined) {
      apiParams.size = filters.size;
    }
    
    if (Object.keys(apiParams).length === 0) {
      const cached = getCachedResponse('/api/projects');
      if (cached) {
        return cached;
      }
      
      try {
        const res = await api.get('/api/projects');
        return res.data;
      } catch (error) {
        try {
          const res = await api.get('/api/projects/filtered');
          return res.data;
        } catch (filteredError) {
          throw filteredError;
        }
      }
    }
    
    const queryString = `?${new URLSearchParams(apiParams).toString()}`;
    const cached = getCachedResponse(`/api/projects/filtered${queryString}`);
    if (cached) {
      return cached;
    }
    
    try {
      const res = await api.get('/api/projects/filtered', { params: apiParams });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string): Promise<Project> => {
    const cached = getCachedResponse(`/api/projects/${id}`);
    if (cached) return cached;
    const res = await api.get(`/api/projects/${id}`);
    return res.data;
  },
  
  create: async (data: CreateProjectRequest): Promise<Project> => {
    clearCache('/api/projects');
    clearCache('/api/projects/filtered');
    clearCache('/api/users/me/projects');
    const res = await api.post('/api/projects', data);
    return res.data;
  },
  
  update: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    clearCache(`/api/projects/${id}`);
    clearCache('/api/projects');
    clearCache('/api/projects/filtered');
    clearCache('/api/users/me/projects');
    const res = await api.put(`/api/projects/${id}`, data);
    return res.data;
  },
  
  delete: async (id: string): Promise<void> => {
    clearCache(`/api/projects/${id}`);
    clearCache('/api/projects');
    clearCache('/api/projects/filtered');
    clearCache('/api/users/me/projects');
    await api.delete(`/api/projects/${id}`);
  },
  
  star: async (id: string): Promise<void> => {
    clearCache('/api/projects');
    clearCache('/api/projects/filtered');
    clearCache('/api/users/me/projects');
    clearCache(`/api/projects/${id}/starred`);
    await api.post(`/api/projects/${id}/star`);
  },
  
  unstar: async (id: string): Promise<void> => {
    clearCache('/api/projects');
    clearCache('/api/projects/filtered');
    clearCache('/api/users/me/projects');
    clearCache(`/api/projects/${id}/starred`);
    await api.post(`/api/projects/${id}/unstar`);
  },
  
  join: async (id: string): Promise<void> => {
    clearCache('/api/projects');
    clearCache('/api/projects/filtered');
    clearCache('/api/users/me/projects');
    await api.post(`/api/projects/${id}/join`);
  },
  
  leave: async (id: string): Promise<void> => {
    clearCache('/api/projects');
    clearCache('/api/projects/filtered');
    clearCache('/api/users/me/projects');
    const res = await api.post(`/api/projects/${id}/leave`);
    return res.data;
  },
  
  getMembers: async (id: string): Promise<PagedResponse<User>> => {
    const res = await api.get(`/api/projects/${id}/members`);
    return res.data;
  },
  
  approveMember: async (projectId: string, userId: string): Promise<void> => {
    clearCache(`/api/projects/${projectId}/members`);
    await api.post(`/api/projects/${projectId}/members/${userId}/approve`);
  },
  
  removeMember: async (projectId: string, userId: string): Promise<void> => {
    clearCache(`/api/projects/${projectId}/members`);
    await api.delete(`/api/projects/${projectId}/members/${userId}/remove`);
  },
  
  getGithubAnalytics: async (projectId: string, repoUrl?: string): Promise<GithubAnalyticsDTO> => {
    const queryString = repoUrl ? `?repoUrl=${encodeURIComponent(repoUrl)}` : '';
    const cached = getCachedResponse(`/api/projects/${projectId}/github-analytics${queryString}`);
    if (cached) return cached;
    const res = await api.get(`/api/projects/${projectId}/github-analytics`, { 
      params: repoUrl ? { repoUrl } : {} 
    });
    return res.data;
  },

  getMembership: async (id: string): Promise<{ isMember: boolean; isOwner: boolean; canJoin: boolean; canLeave: boolean }> => {
    const res = await api.get(`/api/projects/${id}/membership`);
    return res.data;
  },

  isStarred: async (id: string): Promise<boolean> => {
    const res = await api.get(`/api/projects/${id}/starred`);
    const starred = res.data.starred || false;
    return starred;
  },
};

export const tasksApi = {
  getByProject: async (projectId: string): Promise<PagedResponse<Task>> => {
    const cached = getCachedResponse(`/api/projects/${projectId}/tasks`);
    if (cached) return cached;
    const res = await api.get(`/api/projects/${projectId}/tasks`);
    return res.data;
  },
  
  create: async (projectId: string, data: CreateTaskRequest): Promise<Task> => {
    clearCache(`/api/projects/${projectId}/tasks`);
    const res = await api.post(`/api/projects/${projectId}/tasks`, data);
    return res.data;
  },
  
  update: async (projectId: string, taskId: string, data: UpdateTaskRequest): Promise<Task> => {
    clearCache(`/api/projects/${projectId}/tasks`);
    const res = await api.put(`/api/projects/${projectId}/tasks/${taskId}`, data);
    return res.data;
  },
  
  delete: async (projectId: string, taskId: string): Promise<void> => {
    clearCache(`/api/projects/${projectId}/tasks`);
    await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
  },

  assignTask: async (projectId: string, taskId: string, userId: string): Promise<Task> => {
    clearCache(`/api/projects/${projectId}/tasks`);
    const res = await api.post(`/api/projects/${projectId}/tasks/${taskId}/assign/${userId}`);
    return res.data;
  },

  updateTaskStatus: async (projectId: string, taskId: string, status: string): Promise<Task> => {
    clearCache(`/api/projects/${projectId}/tasks`);
    const res = await api.post(`/api/projects/${projectId}/tasks/${taskId}/status`, null, { 
      params: { status } 
    });
    return res.data;
  },
};

export const notificationsApi = {
  getAll: async (): Promise<PagedResponse<Notification>> => {
    const cached = getCachedResponse('/api/notifications');
    if (cached) return cached;
    const res = await api.get('/api/notifications');
    return res.data;
  },

  getDismissed: async (): Promise<PagedResponse<Notification>> => {
    const res = await api.get('/api/notifications/dismissed');
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get('/api/notifications/unread-count');
    return res.data.unreadCount;
  },

  markAsRead: async (id: string): Promise<void> => {
    clearCache('/api/notifications');
    await api.post(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    clearCache('/api/notifications');
    await api.post('/api/notifications/mark-all-read');
  },

  dismiss: async (id: string): Promise<void> => {
    clearCache('/api/notifications');
    await api.post(`/api/notifications/${id}/dismiss`);
  },

  dismissAll: async (): Promise<void> => {
    clearCache('/api/notifications');
    await api.post('/api/notifications/dismiss-all');
  },

  respondToJoinRequest: async (notificationId: string, accept: boolean): Promise<void> => {
    const res = await api.get(`/api/notifications`);
    const notification = res.data.content?.find((n: any) => n.id === notificationId);
    if (!notification) throw new Error('Notification not found');
    const { projectId, senderId } = notification;
    if (!projectId || !senderId) throw new Error('Invalid join request notification');
    if (accept) {
      await api.post(`/api/projects/${projectId}/members/${senderId}/approve`);
    } else {
      await api.delete(`/api/projects/${projectId}/members/${senderId}/remove`);
    }
  },
};

export const chatApi = {
  getMessages: async (chatId: string, page: number = 0, size: number = 20): Promise<PagedResponse<Message>> => {
    const cacheKey = `/api/chats/${chatId}/messages?page=${page}&size=${size}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;
    const res = await api.get(`/api/chats/${chatId}/messages`, { params: { page, size } });
    return res.data;
  },
  
  sendMessage: async (chatId: string, content: string): Promise<Message> => {
    clearCache(`/api/chats/${chatId}/messages`);
    const res = await api.post(`/api/chats/${chatId}/messages`, { content });
    return res.data;
  },
};

export const analyticsApi = {
  getProjectAnalytics: async (projectId: string, repoUrl?: string): Promise<any> => {
    const queryString = repoUrl ? `?repoUrl=${encodeURIComponent(repoUrl)}` : '';
    const cached = getCachedResponse(`/api/projects/${projectId}/github-analytics${queryString}`);
    if (cached) return cached;
    const res = await api.get(`/api/projects/${projectId}/github-analytics`, { 
      params: repoUrl ? { repoUrl } : {} 
    });
    return res.data;
  },
  getGeneralAnalytics: async (): Promise<any> => {
    const cached = getCachedResponse('/api/analytics/overview');
    if (cached) return cached;
    const res = await api.get('/api/analytics/overview');
    return res.data;
  },
};

export const cacheUtils = {
  clearCache,
  getCachedResponse,
};

export default api;