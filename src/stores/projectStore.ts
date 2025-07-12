import { create } from 'zustand';
import type { Project, ProjectFilters, PagedResponse } from '@/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  filters: ProjectFilters;
  isLoading: boolean;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
  };
  setProjects: (projects: Project[]) => void;
  setProjectsFromPagedResponse: (response: PagedResponse<Project>) => void;
  setCurrentProject: (project: Project | null) => void;
  updateProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  setFilters: (filters: ProjectFilters) => void;
  setLoading: (loading: boolean) => void;
  toggleStar: (projectId: string) => void;
  setPagination: (pagination: { totalElements: number; totalPages: number; currentPage: number }) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  filters: {},
  isLoading: false,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
  },
  
  setProjects: (projects) => set({ projects }),
  
  setProjectsFromPagedResponse: (response) => set({ 
    projects: response.content,
    pagination: {
      totalElements: response.totalElements,
      totalPages: response.totalPages,
      currentPage: response.number,
    }
  }),
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  updateProject: (updatedProject) => {
    const { projects, currentProject } = get();
    const newProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    set({ 
      projects: newProjects,
      currentProject: currentProject?.id === updatedProject.id ? updatedProject : currentProject
    });
  },
  
  removeProject: (projectId) => {
    const { projects, currentProject } = get();
    const newProjects = projects.filter(p => p.id !== projectId);
    set({ 
      projects: newProjects,
      currentProject: currentProject?.id === projectId ? null : currentProject
    });
  },
  
  setFilters: (filters) => set({ filters }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  toggleStar: (projectId) => {
    const { projects } = get();
    const newProjects = projects.map(p => 
      p.id === projectId ? { ...p, isStarred: !p.isStarred } : p
    );
    set({ projects: newProjects });
  },
  
  setPagination: (pagination) => set({ pagination }),
}));