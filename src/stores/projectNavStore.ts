import {create} from 'zustand';

type Store = {
  activeSection: 'overview' | 'team' | 'tasks' | 'contact' | 'activity';
  setActiveSection: (section: 'overview' | 'team' | 'tasks' | 'contact' | 'activity') => void;
}

export const useProjectNavStore = create<Store>((set) => ({
  activeSection: 'overview',
  setActiveSection: (section) => set({ activeSection: section }),
}));