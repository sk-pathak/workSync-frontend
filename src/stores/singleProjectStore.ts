import { create } from "zustand";
import { Project } from "../types/projectTypes";

type SingleProjectStoreState = {
  fetchStatus: "loading" | "error" | "success" | "idle";
  project: Project | null;
  setProject: (project: Project | null) => void;
  setFetchStatus: (projectStatus: "loading" | "error" | "success" | "idle") => void;
};

export const useSingleProjectStore = create<SingleProjectStoreState>((set) => ({
  fetchStatus: "loading",
  project: null,
  setProject: (project) => set({ project }),
  setFetchStatus: (fetchStatus) => set({ fetchStatus })
}));