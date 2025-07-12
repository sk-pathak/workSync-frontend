import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, tasksApi, userApi, notificationsApi } from '@/lib/api';
import { queryKeys, queryConfigs, cacheUtils } from '@/lib/queryConfig';
import type { Project, Task, ProjectFilters, UpdateProjectRequest, ProjectStatus } from '@/types';

export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: queryKeys.projects.all(filters),
    queryFn: () => projectsApi.getAll(filters),
    ...queryConfigs.projects.list,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.projects.byId(id),
    queryFn: () => projectsApi.getById(id),
    ...queryConfigs.projects.detail,
    enabled: !!id,
  });
};

export const useProjectMembers = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.projects.members(projectId),
    queryFn: () => projectsApi.getMembers(projectId),
    ...queryConfigs.projects.members,
    enabled: !!projectId,
  });
};

export const useProjectTasks = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.byProject(projectId),
    queryFn: () => tasksApi.getByProject(projectId),
    ...queryConfigs.tasks,
    enabled: !!projectId,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.user.me,
    queryFn: () => userApi.getCurrentUser(),
    ...queryConfigs.user.me,
  });
};

export const useOwnedProjects = () => {
  return useQuery({
    queryKey: queryKeys.user.ownedProjects,
    queryFn: () => userApi.getOwnedProjects(),
    ...queryConfigs.user.projects,
  });
};

export const useJoinedProjects = () => {
  return useQuery({
    queryKey: queryKeys.user.joinedProjects,
    queryFn: () => userApi.getJoinedProjects(),
    ...queryConfigs.user.projects,
  });
};

export const useStarredProjects = () => {
  return useQuery({
    queryKey: queryKeys.user.starredProjects,
    queryFn: () => userApi.getStarredProjects(),
    ...queryConfigs.user.projects,
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => notificationsApi.getAll(),
    ...queryConfigs.notifications,
  });
};

export const useCreateProject = () => {
  
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: (newProject) => {
      cacheUtils.optimisticUpdate.projectList((old: any) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: [newProject, ...old.content],
        };
      });
      
      cacheUtils.invalidateProjects();
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) => 
      projectsApi.update(id, data),
    onSuccess: (updatedProject, { id }) => {
      cacheUtils.optimisticUpdate.project(id, () => updatedProject);
      
      cacheUtils.invalidateProject(id);
    },
    onError: (error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });
};

export const useUpdateProjectStatus = (callbacks?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, status }: { projectId: string; status: ProjectStatus }) => {
      const currentProject = queryClient.getQueryData(['project', projectId]) as Project;
      if (!currentProject) {
        throw new Error('Project not found in cache');
      }
      
      return projectsApi.update(projectId, {
        name: currentProject.name,
        description: currentProject.description,
        status: status,
        isPublic: currentProject.isPublic,
      });
    },
    onSuccess: (updatedProject, { projectId }) => {
      cacheUtils.optimisticUpdate.project(projectId, () => updatedProject);
      
      cacheUtils.invalidateProject(projectId);
      
      callbacks?.onSuccess?.();
    },
    onError: (error, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      
      callbacks?.onError?.(error);
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: (_, projectId) => {
      queryClient.setQueriesData({ queryKey: ['projects'] }, (old: any) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.filter((p: Project) => p.id !== projectId),
        };
      });
      
      cacheUtils.invalidateProjects();
    },
  });
};

export const useStarProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, starred }: { projectId: string; starred: boolean }) =>
      starred ? projectsApi.unstar(projectId) : projectsApi.star(projectId),
    onSuccess: (_, { projectId, starred }) => {
      queryClient.setQueriesData({ queryKey: ['projects'] }, (old: any) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.map((p: Project) => 
            p.id === projectId ? { ...p, isStarred: !starred } : p
          ),
        };
      });
      
      cacheUtils.invalidateProjects();
    },
  });
};

export const useJoinProject = () => {
  
  return useMutation({
    mutationFn: projectsApi.join,
    onSuccess: () => {
      cacheUtils.invalidateProjects();
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
      tasksApi.create(projectId, data),
    onSuccess: (newTask, { projectId }) => {
      queryClient.setQueryData(['tasks', projectId], (old: any) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: [newTask, ...old.content],
        };
      });
      
      cacheUtils.invalidateProjectTasks(projectId);
    },
  });
};

export const useUpdateTask = () => {
  return useMutation({
    mutationFn: ({ projectId, taskId, data }: { projectId: string; taskId: string; data: any }) =>
      tasksApi.update(projectId, taskId, data),
    onSuccess: (updatedTask, { projectId, taskId }) => {
      cacheUtils.optimisticUpdate.task(projectId, taskId, () => updatedTask);
      
      cacheUtils.invalidateProjectTasks(projectId);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, taskId }: { projectId: string; taskId: string }) =>
      tasksApi.delete(projectId, taskId),
    onSuccess: (_, { projectId, taskId }) => {
      queryClient.setQueryData(['tasks', projectId], (old: any) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.filter((t: Task) => t.id !== taskId),
        };
      });
      
      cacheUtils.invalidateProjectTasks(projectId);
    },
  });
};

export const useAssignTask = () => {
  
  return useMutation({
    mutationFn: ({ projectId, taskId, userId }: { projectId: string; taskId: string; userId: string }) =>
      tasksApi.assignTask(projectId, taskId, userId),
    onSuccess: (updatedTask, { projectId, taskId }) => {
      cacheUtils.optimisticUpdate.task(projectId, taskId, () => updatedTask);
      
      cacheUtils.invalidateProjectTasks(projectId);
    },
  });
};

export const useUpdateTaskStatus = () => {
  
  return useMutation({
    mutationFn: ({ projectId, taskId, status }: { projectId: string; taskId: string; status: string }) =>
      tasksApi.updateTaskStatus(projectId, taskId, status),
    onSuccess: (updatedTask, { projectId, taskId }) => {
      cacheUtils.optimisticUpdate.task(projectId, taskId, () => updatedTask);
      
      cacheUtils.invalidateProjectTasks(projectId);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.updateCurrentUser,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.user.me, updatedUser);
      
      cacheUtils.invalidateUser();
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(queryKeys.notifications.all, (old: any) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.map((n: any) => 
            n.id === notificationId ? { ...n, read: true } : n
          ),
        };
      });
      
      cacheUtils.invalidateNotifications();
    },
  });
};

export const useDismissNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.dismiss,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(queryKeys.notifications.all, (old: any) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.filter((n: any) => n.id !== notificationId),
        };
      });
      
      cacheUtils.invalidateNotifications();
    },
  });
};

export const usePrefetchProject = () => {  
  return async (projectId: string) => {
    await cacheUtils.prefetchProject(projectId, () => projectsApi.getById(projectId));
  };
};

export const usePrefetchProjectTasks = () => {  
  return async (projectId: string) => {
    await cacheUtils.prefetchProjectTasks(projectId, () => tasksApi.getByProject(projectId));
  };
};