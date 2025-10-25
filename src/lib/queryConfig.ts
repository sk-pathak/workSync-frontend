import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds - reduced for better real-time updates
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true, // Changed to true for better updates
      refetchOnReconnect: true,
      refetchOnMount: true, // Always refetch on mount
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export const queryKeys = {
  user: {
    me: ['user', 'me'] as const,
    ownedProjects: ['user', 'owned-projects'] as const,
    joinedProjects: ['user', 'joined-projects'] as const,
    starredProjects: ['user', 'starred-projects'] as const,
  },
  
  projects: {
    all: (filters?: any) => ['projects', filters] as const,
    byId: (id: string) => ['project', id] as const,
    members: (id: string) => ['project-members', id] as const,
    dashboard: ['projects', 'dashboard'] as const,
    starred: ['projects', 'starred'] as const,
  },
  
  tasks: {
    byProject: (projectId: string) => ['tasks', projectId] as const,
  },
  
  notifications: {
    all: ['notifications'] as const,
  },
  
  chat: {
    messages: (chatId: string) => ['chat-messages', chatId] as const,
  },
  
  analytics: {
    project: (projectId: string, repoUrl?: string) => 
      ['project-analytics', projectId, repoUrl] as const,
  },
};

export const queryConfigs = {
  user: {
    me: {
      staleTime: 2 * 60 * 1000, // 2 minutes - reduced
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    projects: {
      staleTime: 30 * 1000, // 30 seconds - much more aggressive
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  },
  
  projects: {
    list: {
      staleTime: 30 * 1000, // 30 seconds - reduced from 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: true, // Always refetch when component mounts
      refetchOnWindowFocus: true, // Refetch when window regains focus
    },
    detail: {
      staleTime: 1 * 60 * 1000, // 1 minute - reduced from 5 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: true,
    },
    members: {
      staleTime: 30 * 1000, // 30 seconds - reduced from 3 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: true,
    },
  },
  
  tasks: {
    staleTime: 30 * 1000, // 30 seconds - reduced from 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchOnMount: true,
  },
  
  notifications: {
    staleTime: 15 * 1000, // 15 seconds - reduced from 30 seconds
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchOnMount: true,
  },
  
  chat: {
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 1 * 60 * 1000, // 1 minute
  },
  
  analytics: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
};

export const cacheUtils = {
  invalidateProjects: () => {
    // Force refetch of active queries
    queryClient.invalidateQueries({ 
      queryKey: ['projects'],
      refetchType: 'active' 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['project'],
      refetchType: 'active'
    });
    queryClient.invalidateQueries({ 
      queryKey: ['user', 'owned-projects'],
      refetchType: 'active'
    });
    queryClient.invalidateQueries({ 
      queryKey: ['user', 'joined-projects'],
      refetchType: 'active'
    });
    queryClient.invalidateQueries({ 
      queryKey: ['user', 'starred-projects'],
      refetchType: 'active'
    });
  },
  
  invalidateProject: (projectId: string) => {
    queryClient.invalidateQueries({ 
      queryKey: ['project', projectId],
      refetchType: 'active'
    });
    queryClient.invalidateQueries({ 
      queryKey: ['project-members', projectId],
      refetchType: 'active'
    });
    queryClient.invalidateQueries({ 
      queryKey: ['tasks', projectId],
      refetchType: 'active'
    });
  },
  
  invalidateProjectTasks: (projectId: string) => {
    queryClient.invalidateQueries({ 
      queryKey: ['tasks', projectId],
      refetchType: 'active'
    });
  },
  
  invalidateUser: () => {
    queryClient.invalidateQueries({ 
      queryKey: ['user'],
      refetchType: 'active'
    });
  },
  
  invalidateNotifications: () => {
    queryClient.invalidateQueries({ 
      queryKey: ['notifications'],
      refetchType: 'active'
    });
  },
  
  prefetchProject: async (projectId: string, fetchFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: ['project', projectId],
      queryFn: fetchFn,
      staleTime: queryConfigs.projects.detail.staleTime,
    });
  },
  
  prefetchProjectTasks: async (projectId: string, fetchFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: ['tasks', projectId],
      queryFn: fetchFn,
      staleTime: queryConfigs.tasks.staleTime,
    });
  },
  
  optimisticUpdate: {
    project: (projectId: string, updater: (old: any) => any) => {
      queryClient.setQueryData(['project', projectId], updater);
    },
    
    projectList: (updater: (old: any) => any) => {
      queryClient.setQueriesData({ queryKey: ['projects'] }, updater);
    },
    
    task: (projectId: string, taskId: string, updater: (old: any) => any) => {
      queryClient.setQueryData(['tasks', projectId], (old: any) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.map((task: any) => 
            task.id === taskId ? updater(task) : task
          ),
        };
      });
    },
  },
};

export const performanceUtils = {
  trackQueryPerformance: () => {
    // No-op for now
  },
  
  trackMutationPerformance: () => {
    // No-op for now
  },
  
  getCacheStats: () => {
    const queries = queryClient.getQueryCache().getAll();
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.isActive()).length,
      staleQueries: queries.filter(q => q.isStale()).length,
    };
  },
};