import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProjects } from '../services/projectService';
import { ProjectResponse } from '../types/projectTypes';
import { useProjectStore } from '../stores';

export const useProjects = () => {
  const { page, searchTerm, sortBy, order } = useProjectStore();

  return useQuery<ProjectResponse, Error>({
    queryKey: ['projects', searchTerm, sortBy, order, page],
    queryFn: () => getProjects(searchTerm, sortBy, order, page),
    placeholderData: keepPreviousData,
  });
};