import { StateCreator, create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { AuthStatus, RegisterUser, Response } from "../types/authTypes";
import { UserRes } from "../types/userTypes";
import * as AuthService from "../services/authService";
import { toast } from "react-toastify";

export type AuthState = {
  status: AuthStatus;
  token?: string;
  user?: UserRes;
  data?: Response;

  login: (email: string, password: string, navigate: Function) => Promise<void>;
  logout: (navigate: Function) => void;
  register: (data: RegisterUser, navigate: Function) => Promise<void>;
}

const storeApi: StateCreator<AuthState> = (set) => ({
  status: "unauthorized",
  token: undefined,
  user: undefined,
  login: async (username: string, password: string, navigate: Function) => {
    try {
      const data = await AuthService.login(username, password);
      const token = data.token;
      const user = data.user;
      set({ status: "authorized", token, user });
      navigate("/");
      
    } catch (error) {
      set({ status: "unauthorized", token: undefined, user: undefined });
      toast.error("Incorrect credentials");
    }
  },
  logout: (navigate: Function) => {
    set({ status: "unauthorized", token: undefined, user: undefined });
    toast.info("Logged out successfully");
    navigate("/");
  },
  register: async (data: RegisterUser, navigate: Function) => {
    try {
      const res = await AuthService.register(data);
      const token = res.token;
      const user = res.user;
      set({ status: "authorized", token, user });
      navigate("/");
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