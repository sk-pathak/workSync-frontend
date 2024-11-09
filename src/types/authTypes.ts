import { User } from "./userTypes";

export type RegisterUser = {
  name: string;
  username: string;
  email: string;
  password: string;
}

export type Res= {
  token: string;
  message: string;
  'status code': number;
  'expiration time': string;
}
export type Response = Res & User;

export type AuthStatus = "authorized" | "unauthorized" | "loading";