import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { projectsService } from '@/services/api';
import { CreateProjectPayload, UpdateProjectPayload, Project } from '@/types/Project';

export function useProjects(
  status?: string,
  options?: Omit<UseQueryOptions<Project[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['projects', { status }],
    queryFn: () => projectsService.getProjects(status),
    ...options,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsService.getProject(id),
    enabled: !!id,
  });
}

export function useProjectMutations() {
  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectsService.createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectPayload }) => 
      projectsService.updateProject(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.setQueryData(['projects', data.id], data);
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    createProject,
    updateProject,
    deleteProject,
  };
}
