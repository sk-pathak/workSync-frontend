import { create } from 'zustand';
import type { Task, PagedResponse } from '@/types';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
  };
  setTasks: (tasks: Task[]) => void;
  setTasksFromPagedResponse: (response: PagedResponse<Task>) => void;
  setCurrentTask: (task: Task | null) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: { totalElements: number; totalPages: number; currentPage: number }) => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
  },
  
  setTasks: (tasks) => set({ tasks }),
  
  setTasksFromPagedResponse: (response) => set({ 
    tasks: response.content,
    pagination: {
      totalElements: response.totalElements,
      totalPages: response.totalPages,
      currentPage: response.number,
    }
  }),
  
  setCurrentTask: (task) => set({ currentTask: task }),
  
  addTask: (task) => {
    const { tasks } = get();
    set({ tasks: [task, ...tasks] });
  },
  
  updateTask: (updatedTask) => {
    const { tasks, currentTask } = get();
    const newTasks = tasks.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    );
    set({ 
      tasks: newTasks,
      currentTask: currentTask?.id === updatedTask.id ? updatedTask : currentTask
    });
  },
  
  removeTask: (taskId) => {
    const { tasks, currentTask } = get();
    const newTasks = tasks.filter(t => t.id !== taskId);
    set({ 
      tasks: newTasks,
      currentTask: currentTask?.id === taskId ? null : currentTask
    });
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setPagination: (pagination) => set({ pagination }),
  
  clearTasks: () => set({ tasks: [], currentTask: null }),
}));