import { create } from 'zustand';
import { Project } from '../types/projectTypes';

type SearchStoreState = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
};

export const useSearchStore = create<SearchStoreState>((set) => ({
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  projects: [],
  setProjects: (projects) => set({ projects }),
}));