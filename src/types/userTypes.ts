export type User = {
  userId: number;
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
}

export type UserRes = {
  userId: number;
  name: string;
  email: string;
}