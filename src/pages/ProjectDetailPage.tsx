import { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Settings,
  Star,
  Edit,
  Loader2,
  MessageSquare,
  Users,
  BarChart3,
  CheckSquare,
  Share2,
  Eye,
  EyeOff,
  Calendar,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { projectsApi, tasksApi } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import type { Task, ProjectStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import type { User } from '@/types';
import { useUpdateProjectStatus, useAssignTask, useUpdateTaskStatus } from '@/hooks/useOptimizedQueries';
import { cn } from '@/lib/utils';

const TaskBoard = lazy(() => import('@/components/tasks/TaskBoard').then(module => ({ default: module.TaskBoard })));
const TaskCreateDialog = lazy(() => import('@/components/tasks/TaskCreateDialog').then(module => ({ default: module.TaskCreateDialog })));
const TaskEditDialog = lazy(() => import('@/components/tasks/TaskEditDialog').then(module => ({ default: module.TaskEditDialog })));
const ProjectMembersCard = lazy(() => import('@/components/projects/ProjectMembersCard').then(module => ({ default: module.ProjectMembersCard })));
const ProjectSettingsDialog = lazy(() => import('@/components/projects/ProjectSettingsDialog').then(module => ({ default: module.ProjectSettingsDialog })));
const ChatBox = lazy(() => import('@/components/projects/ChatBox').then(module => ({ default: module.ChatBox })));
const AnalyticsPanel = lazy(() => import('@/components/projects/AnalyticsPanel').then(module => ({ default: module.AnalyticsPanel })));

const ComponentLoadingFallback = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  );
}

const statusColors = {
  PLANNED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  COMPLETED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ON_HOLD: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ProjectStatus>('ACTIVE');
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [membership, setMembership] = useState<{ isMember: boolean; isOwner: boolean; canJoin: boolean; canLeave: boolean } | null>(null);

  const fetchMembership = async () => {
    try {
      const data = await projectsApi.getMembership(id!);
      setMembership(data);
    } catch (e) {
      setMembership(null);
    }
  };

  useEffect(() => {
    if (id) fetchMembership();
  }, [id]);

  const joinMutation = useMutation({
    mutationFn: () => projectsApi.join(id!),
    onSuccess: () => {
      fetchMembership();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project-members', id] });
    },
    onError: (error) => {
      toast({
        title: "Failed to join project",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });
  const leaveMutation = useMutation({
    mutationFn: () => projectsApi.leave(id!),
    onSuccess: () => {
      fetchMembership();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project-members', id] });
    },
    onError: (error) => {
      toast({
        title: "Failed to leave project",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  });

  const { data: tasksResponse } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getByProject(id!),
    enabled: !!id,
  });

  const { data: membersResponse } = useQuery({
    queryKey: ['project-members', id],
    queryFn: () => projectsApi.getMembers(id!),
    enabled: !!id,
  });

  const { data: starredStatus = false } = useQuery({
    queryKey: ['project-starred', id],
    queryFn: () => projectsApi.isStarred(id!),
    enabled: !!id,
  });

  const tasks = tasksResponse?.content || [];
  const members: User[] = membersResponse?.content || [];

  const projectMembers = members.map((user) => ({
    projectId: project?.id || '',
    userId: user.id,
    roleId: 0,
    joinedAt: user.createdAt,
    approved: true,
    user,
  }));

  const starMutation = useMutation({
    mutationFn: (starred: boolean) => {
      return starred ? projectsApi.unstar(id!) : projectsApi.star(id!);
    },
    onMutate: async (starred) => {
      await queryClient.cancelQueries({ queryKey: ['project-starred', id] });
      const previousStarredStatus = queryClient.getQueryData(['project-starred', id]);
      queryClient.setQueryData(['project-starred', id], !starred);
      return { previousStarredStatus };
    },
    onError: (err, _starred, context) => {
      if (context?.previousStarredStatus !== undefined) {
        queryClient.setQueryData(['project-starred', id], context.previousStarredStatus);
      }
      console.error('Star mutation failed:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project-starred', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: ({ projectId, taskId }: { projectId: string; taskId: string }) =>
      tasksApi.delete(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      toast({
        title: 'Task deleted',
        description: 'The task has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete task',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useUpdateProjectStatus();
  const assignTaskMutation = useAssignTask();
  const updateTaskStatusMutation = useUpdateTaskStatus();

  const handleStarProject = () => {
    starMutation.mutate(starredStatus);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditTaskOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate({ projectId: id!, taskId });
  };

  const handleStatusChange = () => {
    setStatusChangeOpen(true);
  };

  const handleUpdateStatus = () => {
    updateStatusMutation.mutate(
      { projectId: id!, status: newStatus },
      {
        onSuccess: () => {
          setStatusChangeOpen(false);
          toast({
            title: 'Status updated',
            description: 'Project status has been updated successfully.',
          });
        },
      }
    );
  };

  const handleAssignTask = (taskId: string, userId: string) => {
    assignTaskMutation.mutate(
      { projectId: id!, taskId, userId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', id] });
          toast({
            title: 'Task assigned',
            description: 'Task has been assigned successfully.',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to assign task',
            description: error.response?.data?.message || 'Something went wrong',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleTaskStatusChange = (taskId: string, status: string) => {
    updateTaskStatusMutation.mutate(
      { projectId: id!, taskId, status },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', id] });
          toast({
            title: 'Task status updated',
            description: 'Task status has been updated successfully.',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to update task status',
            description: error.response?.data?.message || 'Something went wrong',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const getProgress = () => {
    if (project?.tasks && Array.isArray(project.tasks)) {
      const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length;
      const totalTasks = project.tasks.length;
      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    }
    return project?.progress || 0;
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-accent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-text-primary">Project not found</h2>
          <Link to="/projects" className="text-accent hover:underline">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === project.ownerId;
  const canEdit = isOwner || membership?.isMember || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm" className="glass-button">
              <Link to="/projects">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-text-primary">{project.name}</h1>
                <Badge className={statusColors[project.status]}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-text-secondary mt-1">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {membership && !membership.isMember && membership.canJoin && (
              <Button 
                onClick={() => joinMutation.mutate()} 
                disabled={joinMutation.isPending}
                className="glass-button"
              >
                {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Project'}
              </Button>
            )}
            {membership && membership.isMember && membership.canLeave && !isOwner && (
              <Button 
                variant="ghost" 
                onClick={() => leaveMutation.mutate()} 
                disabled={leaveMutation.isPending}
                className="glass-button"
              >
                {leaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Leave Project'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStarProject}
              disabled={starMutation.isPending}
              className="glass-button"
            >
              <Star className={cn('w-4 h-4', starredStatus ? 'fill-yellow-400 text-yellow-400' : '')} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="glass-button"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStatusChange}
                  className="glass-button"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettingsOpen(true)}
                  className="glass-button"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Project Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm text-text-primary">Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-accent">{getProgress()}%</span>
              </div>
              <Progress value={getProgress()} className="h-2 bg-surface-hover" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm text-text-primary">Members</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-text-primary">{members.length}</span>
              <span className="text-text-secondary text-sm">team members</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm text-text-primary">Tasks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-text-primary">{tasks.length}</span>
              <span className="text-text-secondary text-sm">total tasks</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm text-text-primary">Created</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">
                {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabbed Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="glass-card p-1 h-auto">
            <TabsTrigger value="tasks" className="flex items-center space-x-2 data-[state=active]:bg-accent/20">
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2 data-[state=active]:bg-accent/20">
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center space-x-2 data-[state=active]:bg-accent/20">
              <Users className="w-4 h-4" />
              <span>Team</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center space-x-2 data-[state=active]:bg-accent/20">
              <Target className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-accent/20">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Tasks</h2>
              {canEdit && (
                <Button onClick={() => setCreateTaskOpen(true)} className="glass-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
            <Suspense fallback={<ComponentLoadingFallback />}>
              <TaskBoard
                tasks={tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                canEdit={canEdit}
                members={projectMembers}
                onAssignTask={handleAssignTask}
                onStatusChange={handleTaskStatusChange}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">Team Chat</h2>
            <Suspense fallback={<ComponentLoadingFallback />}>
              <ChatBox chatId={project?.chatId} projectId={id!} members={members} />
            </Suspense>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">Team Members</h2>
            <Suspense fallback={<ComponentLoadingFallback />}>
              <ProjectMembersCard
                projectId={id!}
                members={projectMembers}
                isOwner={isOwner}
                projectOwner={project?.owner}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">Project Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-text-primary">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Status</span>
                    <Badge className={statusColors[project.status]}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Visibility</span>
                    <div className="flex items-center space-x-1">
                      {project.isPublic ? (
                        <Eye className="w-4 h-4 text-text-secondary" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-text-secondary" />
                      )}
                      <span className="text-text-primary">{project.isPublic ? 'Public' : 'Private'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Created</span>
                    <span className="text-text-primary">
                      {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Last Updated</span>
                    <span className="text-text-primary">
                      {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-text-primary">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Total Tasks</span>
                    <span className="text-text-primary font-semibold">{tasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Completed Tasks</span>
                    <span className="text-text-primary font-semibold">
                      {tasks.filter((t: Task) => t.status === 'DONE').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Team Members</span>
                    <span className="text-text-primary font-semibold">{members.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Progress</span>
                    <span className="text-accent font-semibold">{getProgress()}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">Analytics</h2>
            <Suspense fallback={<ComponentLoadingFallback />}>
              <AnalyticsPanel projectId={id!} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Dialogs */}
      <Suspense fallback={null}>
        {createTaskOpen && (
          <TaskCreateDialog
            open={createTaskOpen}
            onOpenChange={setCreateTaskOpen}
            projectId={id!}
            members={projectMembers}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {editTaskOpen && selectedTask && (
          <TaskEditDialog
            open={editTaskOpen}
            onOpenChange={setEditTaskOpen}
            task={selectedTask}
            members={projectMembers}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {settingsOpen && (
          <ProjectSettingsDialog
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            project={project}
          />
        )}
      </Suspense>

      {/* Status Change Dialog */}
      <Dialog open={statusChangeOpen} onOpenChange={setStatusChangeOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Change Project Status</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Select the new status for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={(value: ProjectStatus) => setNewStatus(value)}>
              <SelectTrigger className="neu-input border-white/10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusChangeOpen(false)} className="glass-button">
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending} className="glass-button">
              {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};