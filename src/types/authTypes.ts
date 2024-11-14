import { UserRes } from "./userTypes";

export type RegisterUser = {
  name: string;
  username: string;
  email: string;
  password: string;
  userProfile: string;
}

export type Response = {
  token: string;
  message: string;
  statusCode: number;
  expirationTime: string;
  role: string;
  user: UserRes
}

export type AuthStatus = "authorized" | "unauthorized" | "loading";