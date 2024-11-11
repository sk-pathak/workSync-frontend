import {create} from 'zustand';

type ModalState = {
  modals: { [key: string]: boolean };
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
};

export const useModalStore = create<ModalState>((set) => ({
  modals: {
    signup: false,
    login: false,
    newProject: false,
  },
  openModal: (modalName: string) => set((state) => ({
    modals: { ...state.modals, [modalName]: true },
  })),
  closeModal: (modalName: string) => set((state) => ({
    modals: { ...state.modals, [modalName]: false },
  })),
}));
