import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
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
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
    projects: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
    },
  },
  
  projects: {
    list: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    detail: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
    },
    members: {
      staleTime: 3 * 60 * 1000, // 3 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
  
  tasks: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  notifications: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
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
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project'] });
    queryClient.invalidateQueries({ queryKey: ['user', 'owned-projects'] });
    queryClient.invalidateQueries({ queryKey: ['user', 'joined-projects'] });
    queryClient.invalidateQueries({ queryKey: ['user', 'starred-projects'] });
  },
  
  invalidateProject: (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
  },
  
  invalidateProjectTasks: (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
  },
  
  invalidateUser: () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
  },
  
  invalidateNotifications: () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
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