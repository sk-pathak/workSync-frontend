import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  FolderOpen,
  Users,
  MessageSquare,
  Activity,
  Target,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { projectsApi, notificationsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import { userApi } from '@/lib/api';
import type { Project, Notification } from '@/types';

const AnimatedCounter = ({ value, duration = 600 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">{count}</span>;
};

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

  const { data: notificationsResponse } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(),
  });

  const projects = projectsResponse?.content || [];
  const starredProjects = starredResponse?.content || [];
  const notifications = notificationsResponse?.content || [];

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
    .slice(0, 4);

  const recentNotifications = notifications.slice(0, 5);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Overview Section */}
      <div className="glass-card p-8 rounded-3xl animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-text-primary">
                Welcome back, {user?.name || user?.username}! 👋
              </h1>
              <p className="text-text-secondary text-lg">
                {getCurrentDate()} • Here's what's happening with your projects today
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-text-secondary">
                  <AnimatedCounter value={stats.activeProjects} /> active projects
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-text-secondary">
                  <AnimatedCounter value={stats.completedProjects} /> completed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-text-secondary">
                  {recentNotifications.length} new notifications
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 lg:mt-0">
            <Button asChild className="glass-button text-lg px-8 py-4">
              <Link to="/projects/new">
                <Plus className="w-5 h-5 mr-2" />
                Create New Project
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Progress */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Card className="glass-card h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-text-primary">Project Progress</CardTitle>
                <Target className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="mx-auto h-12 w-12 text-text-secondary" />
                  <h3 className="mt-2 text-sm font-semibold text-text-primary">No projects yet</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    Get started by creating your first project.
                  </p>
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
                    
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/projects/${project.id}`}
                            className="font-medium text-text-primary hover:text-accent transition-colors line-clamp-1"
                          >
                            {project.name}
                          </Link>
                          <span className="text-sm font-semibold text-accent">{progress}%</span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2 bg-surface-hover" 
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Capacity */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Card className="glass-card h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-text-primary">Team Capacity</CardTitle>
                <Users className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-text-secondary" />
                <h3 className="mt-2 text-sm font-semibold text-text-primary">Team features coming soon</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Team management and capacity tracking will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-text-primary">Recent Activity</CardTitle>
              <Activity className="w-5 h-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-text-secondary" />
                <h3 className="mt-2 text-sm font-semibold text-text-primary">No recent activity</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Activity will appear here as you work on projects.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentNotifications.map((notification: Notification, index: number) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-surface-hover transition-colors duration-150"
                    style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                  >
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary line-clamp-2">
                        {notification.type === 'TASK_ASSIGNED' && 'Task assigned to you'}
                        {notification.type === 'PROJECT_UPDATED' && 'Project updated'}
                        {notification.type === 'JOIN_REQUEST' && 'Join request received'}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};