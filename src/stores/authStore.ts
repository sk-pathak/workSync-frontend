import { StateCreator, create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { AuthStatus, Response } from "../types/authTypes";
import { UserRes } from "../types/userTypes";
import * as AuthService from "../services/authService";
import { toast } from "react-toastify";

export type AuthState = {
  status: AuthStatus;
  token?: string;
  user?: UserRes;
  data?: Response;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: FormData) => Promise<void>;
}

const storeApi: StateCreator<AuthState> = (set) => ({
  status: "unauthorized",
  token: undefined,
  user: undefined,
  login: async (username: string, password: string) => {
    try {
      const data = await AuthService.login(username, password);
      const token = data.token;
      const user = data.user;
      set({ status: "authorized", token, user });
      
    } catch (error) {
      set({ status: "unauthorized", token: undefined, user: undefined });
      toast.error("Incorrect credentials");
    }
  },
  logout: () => {
    set({ status: "unauthorized", token: undefined, user: undefined });
    toast.info("Logged out successfully");
  },
  register: async (formData: FormData) => {
    try {
      const res = await AuthService.register(formData);
      const token = res.token;
      const user = res.user;
      set({ status: "authorized", token, user });
    } catch (error) {
      toast.error("Cannot register user");
    }
  }
});

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      storeApi, { name: "auth-storage" }
    )
  )
);