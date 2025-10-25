import { useMutation } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { cacheUtils } from '@/lib/queryConfig';

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