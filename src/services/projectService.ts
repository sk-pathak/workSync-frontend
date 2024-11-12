import { AxiosError } from "axios";
import { configApi } from "../api/configApi";
import { ProjectResponse } from "../types/projectTypes.ts";

export const getProjects = async (page: number, limit: number=4): Promise<ProjectResponse> => {
  try {
    const { data } = await configApi.get<ProjectResponse>(`/api/projects/all?page=${page}&size=${limit}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
      throw new Error(error.response?.data)
    }
    console.log(error);
    throw new Error('Cannot fetch projects')
  }
}

export const createProject = async (formData: FormData): Promise<ProjectResponse> => {
  try {
    const { data } = await configApi.post<ProjectResponse>('/api/projects/create', formData);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
      throw new Error(error.response?.data)
    }
    console.log(error);
    throw new Error('Could not create project')
  }
}