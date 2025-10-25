import axios from 'axios';
import { ErrorHandler } from './errorHandler';
import type {
  AuthResponse,
  RegisterResponse,
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
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
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

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post('/api/auth/login', data);
    return res.data;
  },
  
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
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
    const res = await api.get('/api/users/me');
    return res.data;
  },
  
  updateCurrentUser: async (data: Partial<User>): Promise<User> => {
    const res = await api.put('/api/users/me', data);
    return res.data;
  },
  
  getOwnedProjects: async (): Promise<PagedResponse<Project>> => {
    const res = await api.get('/api/users/me/projects/owned');
    return res.data;
  },
  
  getJoinedProjects: async (): Promise<PagedResponse<Project>> => {
    const res = await api.get('/api/users/me/projects/joined');
    return res.data;
  },
  
  getStarredProjects: async (): Promise<PagedResponse<Project>> => {
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
    
    // Removed caching for real-time updates
    if (Object.keys(apiParams).length === 0) {
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
    
    // Removed caching for filtered queries
    try {
      const res = await api.get('/api/projects/filtered', { params: apiParams });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string): Promise<Project> => {
    // Removed caching for real-time updates
    const res = await api.get(`/api/projects/${id}`);
    return res.data;
  },
  
  create: async (data: CreateProjectRequest): Promise<Project> => {
    const res = await api.post('/api/projects', data);
    return res.data;
  },
  
  update: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    const res = await api.put(`/api/projects/${id}`, data);
    return res.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/projects/${id}`);
  },
  
  star: async (id: string): Promise<void> => {
    await api.post(`/api/projects/${id}/star`);
  },
  
  unstar: async (id: string): Promise<void> => {
    await api.post(`/api/projects/${id}/unstar`);
  },
  
  join: async (id: string): Promise<void> => {
    await api.post(`/api/projects/${id}/join`);
  },
  
  leave: async (id: string): Promise<void> => {
    const res = await api.post(`/api/projects/${id}/leave`);
    return res.data;
  },
  
  getMembers: async (id: string): Promise<PagedResponse<User>> => {
    const res = await api.get(`/api/projects/${id}/members`);
    return res.data;
  },
  
  approveMember: async (projectId: string, userId: string): Promise<void> => {
    await api.post(`/api/projects/${projectId}/members/${userId}/approve`);
  },
  
  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await api.delete(`/api/projects/${projectId}/members/${userId}/remove`);
  },
  
  getGithubAnalytics: async (projectId: string, repoUrl?: string): Promise<GithubAnalyticsDTO> => {
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
    return res.data.isStarred || false;
  },
};

export const tasksApi = {
  getByProject: async (projectId: string): Promise<PagedResponse<Task>> => {
    const res = await api.get(`/api/projects/${projectId}/tasks`);
    return res.data;
  },
  
  create: async (projectId: string, data: CreateTaskRequest): Promise<Task> => {
    const res = await api.post(`/api/projects/${projectId}/tasks`, data);
    return res.data;
  },
  
  update: async (projectId: string, taskId: string, data: UpdateTaskRequest): Promise<Task> => {
    const res = await api.put(`/api/projects/${projectId}/tasks/${taskId}`, data);
    return res.data;
  },
  
  delete: async (projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
  },

  assignTask: async (projectId: string, taskId: string, userId: string): Promise<Task> => {
    const res = await api.post(`/api/projects/${projectId}/tasks/${taskId}/assign/${userId}`);
    return res.data;
  },

  updateTaskStatus: async (projectId: string, taskId: string, status: string): Promise<Task> => {
    const res = await api.post(`/api/projects/${projectId}/tasks/${taskId}/status`, null, { 
      params: { status } 
    });
    return res.data;
  },
};

export const notificationsApi = {
  getAll: async (): Promise<PagedResponse<Notification>> => {
    const res = await api.get('/api/notifications');
    return res.data;
  },

  getDismissed: async (): Promise<PagedResponse<Notification>> => {
    const res = await api.get('/api/notifications/dismissed');
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get('/api/notifications/unread-count');
    return res.data.count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.post(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/api/notifications/mark-all-read');
  },

  dismiss: async (id: string): Promise<void> => {
    await api.post(`/api/notifications/${id}/dismiss`);
  },

  dismissAll: async (): Promise<void> => {
    await api.post('/api/notifications/dismiss-all');
  },

  respondToJoinRequest: async (notificationId: string, accept: boolean): Promise<void> => {
    const res = await api.get(`/api/notifications`);
    const notification = res.data.content?.find((n: any) => n.id === notificationId);
    if (!notification) throw new Error('Notification not found');
    
    // Extract projectId and userId from payload
    const projectId = notification.payload?.projectId;
    const userId = notification.payload?.userId || notification.payload?.senderId;
    
    if (!projectId || !userId) throw new Error('Invalid join request notification');
    
    if (accept) {
      await api.post(`/api/projects/${projectId}/members/${userId}/approve`);
    } else {
      await api.delete(`/api/projects/${projectId}/members/${userId}/remove`);
    }
  },
};

export const chatApi = {
  getMessages: async (chatId: string, page: number = 0, size: number = 20): Promise<PagedResponse<Message>> => {
    const res = await api.get(`/api/chats/${chatId}/messages`, { params: { page, size } });
    return res.data;
  },
  
  sendMessage: async (chatId: string, content: string): Promise<Message> => {
    const res = await api.post(`/api/chats/${chatId}/messages`, { content });
    return res.data;
  },
};

export const analyticsApi = {
  getProjectAnalytics: async (projectId: string, repoUrl?: string): Promise<any> => {
    const res = await api.get(`/api/projects/${projectId}/github-analytics`, { 
      params: repoUrl ? { repoUrl } : {} 
    });
    return res.data;
  },
  getGeneralAnalytics: async (): Promise<any> => {
    const res = await api.get('/api/analytics/overview');
    return res.data;
  },
};

export const cacheUtils = {
};

export default api;