import { useState, Suspense, lazy } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { projectsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { ProjectFilters, ProjectStatus, Project } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/lib/api';

const ProjectCard = lazy(() => import('@/components/projects/ProjectCard').then(module => ({ default: module.ProjectCard })));
const ProjectSettingsDialog = lazy(() => import('@/components/projects/ProjectSettingsDialog').then(module => ({ default: module.ProjectSettingsDialog })));

const ComponentLoadingFallback = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export const ProjectsPage = () => {
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const { data: projectsResponse, isLoading } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsApi.getAll(filters),
  });

  const { data: starredProjectsResponse } = useQuery({
    queryKey: ['starred-projects'],
    queryFn: () => userApi.getStarredProjects(),
  });

  const projects = projectsResponse?.content || [];
  const starredProjects = starredProjectsResponse?.content || [];
  
  const starMutation = useMutation({
    mutationFn: ({ projectId, starred }: { projectId: string; starred: boolean }) => {
      return starred ? projectsApi.unstar(projectId) : projectsApi.star(projectId);
    },
    onMutate: async ({ projectId, starred }) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      await queryClient.cancelQueries({ queryKey: ['starred-projects'] });
      
      const previousProjects = queryClient.getQueryData(['projects']);
      const previousStarredProjects = queryClient.getQueryData(['starred-projects']);
      
      queryClient.setQueryData(['starred-projects'], (old: any) => {
        if (!old?.content) return old;
        if (starred) {
          return {
            ...old,
            content: old.content.filter((p: Project) => p.id !== projectId),
          };
        } else {
          const project = projects.find((p: Project) => p.id === projectId);
          if (project) {
            return {
              ...old,
              content: [...old.content, project],
            };
          }
        }
        return old;
      });
      
      return { previousProjects, previousStarredProjects };
    },
    onError: (err, { projectId }, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      if (context?.previousStarredProjects) {
        queryClient.setQueryData(['starred-projects'], context.previousStarredProjects);
      }
      console.error('Star mutation failed in ProjectsPage:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['starred-projects'] });
    },
  });

  const joinMutation = useMutation({
    mutationFn: projectsApi.join,
    onSuccess: () => {
      toast({
        title: 'Join request sent',
        description: 'Your request to join the project has been sent to the owner.',
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to join project',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const handleStar = (projectId: string) => {
    const project = projects.find((p: Project) => p.id === projectId);
    if (project) {
      const isCurrentlyStarred = starredProjects.some((sp: Project) => sp.id === projectId);
      starMutation.mutate({ projectId, starred: isCurrentlyStarred });
    }
  };

  const handleJoin = (projectId: string) => {
    joinMutation.mutate(projectId);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleDelete = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      projectsApi.delete(projectId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          toast({
            title: 'Project deleted',
            description: 'The project has been successfully deleted.',
          });
        })
        .catch((error: any) => {
          toast({
            title: 'Failed to delete project',
            description: error.response?.data?.message || 'Something went wrong',
            variant: 'destructive',
          });
        });
    }
  };

  const visibleProjects = projects.filter((project: Project) => {
    if (project.isPublic) return true;
    return user && user.id === project.ownerId;
  });

  const filteredProjects = visibleProjects.filter((project: Project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-dark min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary drop-shadow">Projects</h1>
          <p className="text-muted-foreground">
            Manage and collaborate on your projects
          </p>
        </div>
        <Button asChild className="neu-btn">
          <Link to="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 neu-input"
                />
              </div>
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value as ProjectStatus }))}
            >
              <SelectTrigger className="w-full sm:w-[180px] neu-input">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.owned ? 'owned' : filters.member ? 'member' : 'all'}
              onValueChange={(value) => {
                if (value === 'owned') {
                  setFilters(prev => ({ ...prev, owned: true, member: undefined }));
                } else if (value === 'member') {
                  setFilters(prev => ({ ...prev, member: true, owned: undefined }));
                } else {
                  setFilters(prev => ({ ...prev, owned: undefined, member: undefined }));
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] neu-input">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="owned">My Projects</SelectItem>
                <SelectItem value="member">Member Of</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.starred ? 'starred' : 'all'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, starred: value === 'starred' }))}
            >
              <SelectTrigger className="w-full sm:w-[180px] neu-input">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="starred">Starred Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="neu-card animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredProjects.length === 0 ? (
            <Card className="neu-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || Object.keys(filters).length > 0
                      ? 'Try adjusting your search or filters.'
                      : 'Get started by creating your first project.'}
                  </p>
                  {!searchQuery && Object.keys(filters).length === 0 && (
                    <Button asChild className="neu-btn">
                      <Link to="/projects/new">Create Project</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Suspense fallback={<ComponentLoadingFallback />}>
                                 {filteredProjects.map((project) => (
                   <ProjectCard
                     key={project.id}
                     project={project}
                     starredProjects={starredProjects}
                     onStar={handleStar}
                     onJoin={handleJoin}
                     onEdit={handleEdit}
                     onDelete={handleDelete}
                   />
                 ))}
              </Suspense>
            </div>
          )}
        </>
      )}

      {/* Settings Dialog */}
      <Suspense fallback={null}>
        {editingProject && (
          <ProjectSettingsDialog
            open={!!editingProject}
            onOpenChange={(open) => !open && setEditingProject(null)}
            project={editingProject}
          />
        )}
      </Suspense>
    </div>
  );
}