import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import {
  FolderOpen,
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

const AnimatedCounter = memo(({ value, duration = 600 }: { value: number; duration?: number }) => {
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

  return <span className="text-lg font-bold text-white drop-shadow-lg">{count}</span>;
});

AnimatedCounter.displayName = 'AnimatedCounter';

const notificationMessages: Record<string, string> = {
  TASK_ASSIGNED: 'Task assigned to you',
  PROJECT_UPDATED: 'Project updated',
  JOIN_REQUEST: 'Join request received',
};

export const DashboardPage = memo(() => {
  const { user } = useAuthStore();

  const { data: projectsResponse } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: starredResponse } = useQuery({
    queryKey: ['projects', 'starred'],
    queryFn: () => userApi.getStarredProjects(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: notificationsResponse } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const projects = projectsResponse?.content || [];
  const starredProjects = starredResponse?.content || [];
  const notifications = notificationsResponse?.content || [];

  const visibleProjects = useMemo(() =>
    projects.filter((project: Project) => {
      if (project.isPublic) return true;
      return user && user.id === project.ownerId;
    }), [projects, user]
  );

  const stats = useMemo(() => ({
    totalProjects: visibleProjects.length,
    activeProjects: visibleProjects.filter((p: Project) => p.status === 'ACTIVE').length,
    completedProjects: visibleProjects.filter((p: Project) => p.status === 'COMPLETED').length,
    starredProjects: starredProjects.length,
  }), [visibleProjects, starredProjects]);

  const recentProjects = useMemo(() =>
    visibleProjects
      .sort((a: Project, b: Project) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4), [visibleProjects]
  );

  const recentNotifications = useMemo(() =>
    notifications.slice(0, 5), [notifications]
  );

  const getCurrentDate = useCallback(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12 bg-background min-h-screen">
      <div className="space-y-8">
        {/* Hero Overview Section */}
        <div className="card p-8 rounded-3xl animate-fade-in bg-surface/80 border border-border shadow-md">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 flex-1 min-w-0">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                  Welcome back, {user?.name || user?.username}! 👋
                </h1>
                <p className="text-gray-200 text-lg drop-shadow">
                  {getCurrentDate()}
                </p>
                <p className="text-gray-200 text-lg drop-shadow">
                  Here's what's happening with your projects today
                </p>
              </div>
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 items-center mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-white/90">
                    <AnimatedCounter value={stats.activeProjects} /> active projects
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-white/90">
                    <AnimatedCounter value={stats.completedProjects} /> completed
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-white/90">
                    <AnimatedCounter value={recentNotifications.length} /> new notifications
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 flex-shrink-0 flex items-center justify-center">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Project Progress */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Card className="bg-surface/80 border border-border shadow-md h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white drop-shadow">Project Progress</CardTitle>
                  <Target className="w-5 h-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {recentProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="mx-auto h-12 w-12 text-text-secondary" />
                    <h3 className="mt-2 text-sm font-semibold text-text-primary">No projects yet</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      Get started by creating your first project.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {recentProjects.map((project: Project, index: number) => {
                      const progress = typeof project.progressPercentage === 'number' ? Math.round(project.progressPercentage) : 0;
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
          {/* Task Overview Card */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Card className="bg-surface/80 border border-border shadow-md h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white drop-shadow">Task Overview</CardTitle>
                  <Activity className="w-5 h-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                {recentProjects.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    No tasks to show
                  </div>
                ) : (
                  (() => {
                    let totalTasks = 0, todo = 0, inProgress = 0, done = 0, blocked = 0;
                    recentProjects.forEach((project: Project) => {
                      totalTasks += project.totalTasks || 0;
                      if (project.taskStatusBreakdown) {
                        todo += project.taskStatusBreakdown.TODO || 0;
                        inProgress += project.taskStatusBreakdown.IN_PROGRESS || 0;
                        done += project.taskStatusBreakdown.DONE || 0;
                        blocked += project.taskStatusBreakdown.BLOCKED || 0;
                      }
                    });
                    const percent = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

                    return (
                      <div className="space-y-2">
                        <div className="text-lg font-semibold text-text-primary">Total Tasks: {totalTasks}</div>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <div className="flex items-center gap-1 text-blue-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span> TODO: {todo}
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span> In Progress: {inProgress}
                          </div>
                          <div className="flex items-center gap-1 text-green-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Done: {done}
                          </div>
                          <div className="flex items-center gap-1 text-red-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Blocked: {blocked}
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-text-secondary">Overall Progress</span>
                            <span className="text-sm font-semibold text-accent">{percent}%</span>
                          </div>
                          <Progress value={percent} className="h-2 bg-surface-hover" />
                        </div>
                      </div>
                    );
                  })()
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Card className="bg-surface/80 border border-border shadow-md mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white drop-shadow">Recent Activity</CardTitle>
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
                          {notificationMessages[notification.type] || 'New notification'}
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
    </div>
  );
});

DashboardPage.displayName = 'DashboardPage';