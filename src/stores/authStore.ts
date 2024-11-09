import { StateCreator, create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { AuthStatus, RegisterUser } from "../types/authTypes";
import { User } from "../types/userTypes";
import * as AuthService from "../services/authService";
import { toast } from "react-toastify";

export type AuthState = {
  status: AuthStatus;
  token?: string;
  user?: User;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterUser) => Promise<void>;
}

const storeApi: StateCreator<AuthState> = (set) => ({
  status: "unauthorized",
  token: undefined,
  user: undefined,
  login: async (username: string, password: string) => {
    try {
      const { token, ...user } = await AuthService.login(username, password);
      set({ status: "authorized", token, user });
    } catch (error) {
      set({ status: "unauthorized", token: undefined, user: undefined });
      toast.error("Incorrect credentials");
    }
  },
  logout: () => {
    set({ status: "unauthorized", token: undefined, user: undefined });
  },
  register: async (data: RegisterUser) => {
    try {
      const { token, ...user } = await AuthService.register(data);
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