import { create } from 'zustand';

type ProjectStoreState = {
  searchTerm: string;
  sortBy: string;
  order: 'asc' | 'desc';
  page: number;
  setSearchTerm: (term: string) => void;
  setSortBy: (sortBy: string) => void;
  setOrder: (order: 'asc' | 'desc') => void;
  setPage: (newPage: number | ((prev: number) => number)) => void;
};

export const useProjectStore = create<ProjectStoreState>((set) => ({
  searchTerm: '',
  sortBy: 'name',
  order: 'asc',
  page: 0,
  setSearchTerm: (searchTerm) => set({ searchTerm: searchTerm, page: 0 }),
  setSortBy: (sortBy) => set({ sortBy: sortBy, page: 0 }),
  setOrder: (order) => set({ order: order, page: 0 }),
  setPage: (newPage) => set((state) => ({ page: typeof newPage === 'function' ? newPage(state.page) : newPage })),
}));
