import { useState, Suspense, lazy } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Star,
  Users,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { projectsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { ProjectFilters, ProjectStatus, Project } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/lib/api';

const ProjectSettingsDialog = lazy(() => import('@/components/projects/ProjectSettingsDialog').then(module => ({ default: module.ProjectSettingsDialog })));

export const ProjectsPage = () => {
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
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

  const visibleProjects = projects.filter((project: Project) => {
    if (project.isPublic) return true;
    return user && user.id === project.ownerId;
  });

  const filteredProjects = visibleProjects.filter((project: Project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'COMPLETED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PLANNED': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'ON_HOLD': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getProgress = (project: Project) => {
    if (project.tasks && Array.isArray(project.tasks)) {
      const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length;
      const totalTasks = project.tasks.length;
      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    }
    return project.progress || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
            <p className="text-text-secondary">
              Manage and collaborate on your projects
            </p>
          </div>
          <Button asChild className="glass-button">
            <Link to="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Sticky Filter & Sort Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="sticky top-0 z-10 glass-card p-4 rounded-2xl"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <Input
                placeholder="Search projects by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 neu-input border-white/10 focus:border-accent/50"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="glass-button"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="glass-button"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="glass-button"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value as ProjectStatus }))}
              >
                <SelectTrigger className="neu-input border-white/10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="glass-card">
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
                <SelectTrigger className="neu-input border-white/10">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="owned">My Projects</SelectItem>
                  <SelectItem value="member">Member Of</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.starred ? 'starred' : 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, starred: value === 'starred' }))}
              >
                <SelectTrigger className="neu-input border-white/10">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="starred">Starred Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardHeader>
                <div className="h-4 bg-surface-hover rounded w-3/4"></div>
                <div className="h-3 bg-surface-hover rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-surface-hover rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredProjects.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 text-text-primary">No projects found</h3>
                  <p className="text-text-secondary mb-4">
                    {searchQuery || Object.keys(filters).length > 0
                      ? 'Try adjusting your search or filters.'
                      : 'Get started by creating your first project.'}
                  </p>
                  {!searchQuery && Object.keys(filters).length === 0 && (
                    <Button asChild className="glass-button">
                      <Link to="/projects/new">Create Project</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Card className="glass-card h-full hover:scale-102 transition-transform duration-150 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/projects/${project.id}`}
                            className="block"
                          >
                            <CardTitle className="text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                              {project.name}
                            </CardTitle>
                          </Link>
                          <p className="text-text-secondary text-sm line-clamp-2 mt-1">
                            {project.description || 'No description'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStar(project.id)}
                          className="p-1 h-auto"
                        >
                          <Star 
                            className={`w-4 h-4 ${
                              starredProjects.some((sp: Project) => sp.id === project.id)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-text-secondary'
                            }`} 
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Status and Visibility */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(project.status)}`}
                        >
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {project.isPublic ? (
                            <Eye className="w-3 h-3 text-text-secondary" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-text-secondary" />
                          )}
                          <span className="text-xs text-text-secondary">
                            {project.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">Progress</span>
                          <span className="text-accent font-semibold">{getProgress(project)}%</span>
                        </div>
                        <Progress 
                          value={getProgress(project)} 
                          className="h-2 bg-surface-hover" 
                        />
                      </div>

                      {/* Project Meta */}
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{project.memberCount || 0} members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={project.owner?.avatarUrl} />
                            <AvatarFallback className="text-xs bg-accent/20 text-accent">
                              {project.owner?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-text-secondary">
                            {project.owner?.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {user && user.id !== project.ownerId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleJoin(project.id)}
                              className="text-xs glass-button"
                            >
                              Join
                            </Button>
                          )}
                          {user && user.id === project.ownerId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(project)}
                              className="text-xs glass-button"
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
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
};