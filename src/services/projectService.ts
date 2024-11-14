import { AxiosError } from "axios";
import { configApi } from "../api/configApi";
import { ProjectResponse } from "../types/projectTypes.ts";

export const getProjects = async (searchTerm: string = '', sortBy: string = '', order: 'asc' | 'desc' = 'asc', page: number, limit: number = 4): Promise<ProjectResponse> => {
  try {
    const params = new URLSearchParams();
    if(searchTerm) params.append('searchTerm', searchTerm);
    if(sortBy) params.append('sortBy', sortBy);
    if(order) params.append('order', order);
    params.append('page', page.toString());
    params.append('size', limit.toString());
    const { data } = await configApi.get<ProjectResponse>(`/api/projects/all?${params.toString()}`);
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