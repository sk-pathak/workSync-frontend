import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  FolderOpen,
  Star,
  Users,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { projectsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import { userApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  const { data: projectsResponse } = useQuery({
    queryKey: ['projects', 'dashboard'],
    queryFn: () => projectsApi.getAll(),
  });

  const { data: starredResponse } = useQuery({
    queryKey: ['projects', 'starred'],
    queryFn: () => userApi.getStarredProjects(),
  });

  const projects = projectsResponse?.content || [];
  const starredProjects = starredResponse?.content || [];

  const visibleProjects = projects.filter((project: Project) => {
    if (project.isPublic) return true;
    return user && user.id === project.ownerId;
  });

  const stats = {
    totalProjects: visibleProjects.length,
    activeProjects: visibleProjects.filter((p: Project) => p.status === 'ACTIVE').length,
    completedProjects: visibleProjects.filter((p: Project) => p.status === 'COMPLETED').length,
    starredProjects: starredProjects.length,
  };

  const recentProjects = visibleProjects
    .sort((a: Project, b: Project) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 bg-gradient-dark min-h-screen">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-primary drop-shadow">
          Welcome back, {user?.name || user?.username}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your projects today.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedProjects}</div>
              <p className="text-xs text-muted-foreground">
                Successfully finished
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Starred</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.starredProjects}</div>
              <p className="text-xs text-muted-foreground">
                Your favorite projects
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="neu-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Button asChild variant="outline" size="sm" className="neu-btn">
                <Link to="/projects">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No projects yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by creating your first project.
                </p>
                <div className="mt-6">
                  <Button asChild className="neu-btn">
                    <Link to="/projects/new">Create Project</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project: Project, index: number) => {
                  let progress = 0;
                  if (project.tasks && Array.isArray(project.tasks)) {
                    const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length;
                    const totalTasks = project.tasks.length;
                    progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                  } else if (typeof project.progress === 'number') {
                    progress = project.progress;
                  }
                  const memberCount = project.members && Array.isArray(project.members)
                    ? project.members.length
                    : (project.memberCount || 0);
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center space-x-4 p-4 rounded-neu hover-neu transition-all bg-gradient-dark"
                    >
                      <div className="flex-1">
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {project.name}
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.description || 'No description'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={project.owner?.avatarUrl} />
                              <AvatarFallback className="text-xs">
                                {project.owner?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {project.owner?.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {memberCount}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                project.isPublic 
                                  ? 'bg-green-500/10 text-green-700 border-green-200' 
                                  : 'bg-orange-500/10 text-orange-700 border-orange-200'
                              }`}
                            >
                              {project.isPublic ? 'Public' : 'Private'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-muted-foreground">Progress:</span>
                          <span className="text-xs font-semibold">{progress}%</span>
                          <Progress value={progress} className="h-2 w-32" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}