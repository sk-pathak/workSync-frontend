import {create} from 'zustand';

type Store = {
  activeSection: 'overview' | 'team' | 'relevant links' | 'contact';
  setActiveSection: (section: 'overview' | 'team' | 'relevant links' | 'contact') => void;
}

export const useProjectNavStore = create<Store>((set) => ({
  activeSection: 'overview',
  setActiveSection: (section) => set({ activeSection: section }),
}));