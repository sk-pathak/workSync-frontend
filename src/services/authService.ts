import { AxiosError } from "axios";
import { configApi } from "../api/configApi";
import { Response } from "../types/authTypes";

export const login = async (username: string, password: string): Promise<Response> => {
  try {
    const { data } = await configApi.post<Response>('/api/login', { username, password });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
      throw new Error(error.response?.data)
    }
    console.log(error);
    throw new Error('Cannot login user')
  }
}

export const register = async (formData: FormData): Promise<Response> => {
  try {
    const { data } = await configApi.post<Response>('/api/register', formData);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
      throw new Error(error.response?.data)
    }
    console.log(error);
    throw new Error('Cannot register user')
  }
}