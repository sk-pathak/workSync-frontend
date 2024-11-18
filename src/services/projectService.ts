import { AxiosError } from "axios";
import { configApi } from "../api/configApi";
import { ProjectsResponse, ProjectResponse, Project } from "../types/projectTypes.ts";
import { toast } from "react-toastify";

export const getProjects = async (searchTerm: string = '', sortBy: string = '', order: 'asc' | 'desc' = 'asc', page: number, limit: number = 4): Promise<ProjectsResponse> => {
  try {
    const params = new URLSearchParams();
    if(searchTerm) params.append('searchTerm', searchTerm);
    if(sortBy) params.append('sortBy', sortBy);
    if(order) params.append('order', order);
    params.append('page', page.toString());
    params.append('size', limit.toString());
    const { data } = await configApi.get<ProjectsResponse>(`/api/projects/all?${params.toString()}`);
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

export const createProject = async (formData: FormData): Promise<ProjectsResponse> => {
  try {
    const { data } = await configApi.post<ProjectsResponse>('/api/projects/create', formData);
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

export const getProject = async (id: number): Promise<ProjectResponse> => {
  try {
    const { data } = await configApi.get<ProjectResponse>(`/api/projects/all/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
      throw new Error(error.response?.data)
    }
    console.log(error);
    throw new Error('Cannot fetch project')
  }
}

export const joinProject = async (id: number): Promise<ProjectResponse> => {
  try {
    const { data } = await configApi.put<ProjectResponse>(`/api/projects/adduser/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
      toast.error(error.response?.data.message);
      throw new Error(error.response?.data)
    }
    console.log(error);
    throw new Error('Could not join project')
  }
}

export const updateProject = async (id: number, project: Project): Promise<ProjectResponse> => {
  try {
    const { data } = await configApi.put<ProjectResponse>(`/api/projects/update/${id}`, project);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
      throw new Error(error.response?.data)
    }
    console.log(error);
    throw new Error('Could not update project')
  }
}