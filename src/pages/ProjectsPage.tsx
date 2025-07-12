import { useState, Suspense, lazy, useRef } from 'react';
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
  EyeOff,
  FolderOpen,
  TrendingUp,
  CheckCircle,
  Settings,
  X,
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
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    onError: (err, _, context) => {
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

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const visibleProjects = projects.filter((project: Project) => {
    if (project.isPublic) return true;
    return user && user.id === project.ownerId;
  });

  const filteredProjects = visibleProjects.filter((project: Project) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    return (
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      false
    );
  });

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

  const stats = {
    total: filteredProjects.length,
    active: filteredProjects.filter(p => p.status === 'ACTIVE').length,
    completed: filteredProjects.filter(p => p.status === 'COMPLETED').length,
    starred: starredProjects.length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gradient-dark min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-primary">
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-text-primary">Projects</h1>
            <p className="text-text-secondary text-lg">
              Manage and collaborate on your projects
            </p>
          </div>
        </div>
        <Button asChild className="glass-button">
          <Link to="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="glass-card hover:scale-105 transition-transform duration-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FolderOpen className="w-5 h-5 text-accent mr-2" />
              <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
            </div>
            <p className="text-sm text-text-secondary">Total Projects</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:scale-105 transition-transform duration-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
              <div className="text-2xl font-bold text-text-primary">{stats.active}</div>
            </div>
            <p className="text-sm text-text-secondary">Active</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:scale-105 transition-transform duration-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-yellow-400 mr-2" />
              <div className="text-2xl font-bold text-text-primary">{stats.starred}</div>
            </div>
            <p className="text-sm text-text-secondary">Starred</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:scale-105 transition-transform duration-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-blue-400 mr-2" />
              <div className="text-2xl font-bold text-text-primary">{stats.completed}</div>
            </div>
            <p className="text-sm text-text-secondary">Completed</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter & Sort Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative group w-full max-w-xs">
              {/* Search Input */}
              <Input
                ref={searchInputRef}
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 neu-input border-white/10 focus:border-accent/50 transition-all duration-300 group-hover:border-accent/30 relative z-10 text-left bg-transparent"
                style={{ textAlign: 'left' }}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-50">
                <Search className="w-5 h-5 text-white" stroke="white" />
              </span>
              {/* Clear Button */}
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-hover transition-colors z-20"
                  type="button"
                >
                  <X className="w-4 h-4 text-text-secondary hover:text-text-primary" />
                </motion.button>
              )}
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
            className="mt-6 pt-6 border-t border-white/10"
          >
            <div className="flex justify-center">
              <div className="w-full max-w-md bg-surface-hover/90 rounded-2xl border border-white/10 shadow-xl p-8 flex flex-col md:flex-row md:items-center md:gap-8 gap-6 my-8">
                {/* Status Filter */}
                <div className="flex-1 flex flex-col items-center md:items-start">
                  <label className="text-sm font-medium text-text-secondary mb-2">Status</label>
                  <div className="w-full flex items-center justify-center">
                    <Select
                      value={filters.status || 'all'}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value as ProjectStatus }))}
                    >
                      <SelectTrigger className="w-full h-11 rounded-lg border border-white/10 bg-surface-hover/90 shadow focus:border-accent/60 focus:ring-2 focus:ring-accent/30 transition-all text-base">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="glass-card rounded-lg shadow-lg">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Divider for desktop only, hidden on mobile */}
                <div className="hidden md:flex items-center justify-center mx-4 self-stretch">
                  <div className="h-full w-px bg-white/10 rounded-full" />
                </div>
                {/* Ownership/Starred Filter */}
                <div className="flex-1 flex flex-col items-center md:items-start">
                  <label className="text-sm font-medium text-text-secondary mb-2">Project Type</label>
                  <div className="w-full flex items-center justify-center">
                    <Select
                      value={filters.owned ? 'owned' : filters.member ? 'member' : filters.starred ? 'starred' : 'all'}
                      onValueChange={(value) => {
                        if (value === 'owned') {
                          setFilters(prev => ({ ...prev, owned: true, member: undefined, starred: undefined }));
                        } else if (value === 'member') {
                          setFilters(prev => ({ ...prev, member: true, owned: undefined, starred: undefined }));
                        } else if (value === 'starred') {
                          setFilters(prev => ({ ...prev, starred: true, owned: undefined, member: undefined }));
                        } else {
                          setFilters(prev => ({ ...prev, owned: undefined, member: undefined, starred: undefined }));
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-11 rounded-lg border border-white/10 bg-surface-hover/90 shadow focus:border-accent/60 focus:ring-2 focus:ring-accent/30 transition-all text-base">
                        <SelectValue placeholder="All Projects" />
                      </SelectTrigger>
                      <SelectContent className="glass-card rounded-lg shadow-lg">
                        <SelectItem value="all">All Projects</SelectItem>
                        <SelectItem value="owned">My Projects</SelectItem>
                        <SelectItem value="member">Member Of</SelectItem>
                        <SelectItem value="starred">Starred Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
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
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <FolderOpen className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2 text-text-primary">No projects found</h3>
                  <p className="text-text-secondary mb-6">
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
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card h-full hover:scale-105 transition-transform duration-200 group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/projects/${project.id}`}
                            className="block"
                          >
                            <CardTitle className="text-lg text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                              {project.name}
                            </CardTitle>
                          </Link>
                          <p className="text-text-secondary text-sm line-clamp-2 mt-2">
                            {project.description || 'No description'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStar(project.id)}
                          className="p-2 h-auto glass-button hover:scale-110 transition-transform"
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
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={project.owner?.avatarUrl} />
                            <AvatarFallback className="text-xs bg-accent/20 text-accent">
                              {project.owner?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-text-secondary">
                            {project.owner?.name || project.owner?.username}
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
                              <Settings className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
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