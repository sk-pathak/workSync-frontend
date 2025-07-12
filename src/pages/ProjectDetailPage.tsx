import { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Settings,
  Star,
  Edit,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const statusColors = {
  PLANNED: 'bg-blue-500/10 text-blue-700 border-blue-200',
  ACTIVE: 'bg-green-500/10 text-green-700 border-green-200',
  COMPLETED: 'bg-purple-500/10 text-purple-700 border-purple-200',
  ON_HOLD: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  CANCELLED: 'bg-red-500/10 text-red-700 border-red-200',
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
  const [loadingMembership, setLoadingMembership] = useState(false);

  const fetchMembership = async () => {
    setLoadingMembership(true);
    try {
      const data = await projectsApi.getMembership(id!);
      setMembership(data);
    } catch (e) {
      setMembership(null);
    } finally {
      setLoadingMembership(false);
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
    onError: (err, starred, context) => {
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

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project not found</h2>
          <Link to="/projects" className="text-primary hover:underline">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/projects">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {membership && !membership.isMember && membership.canJoin && (
            <Button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
              {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Project'}
            </Button>
          )}
          {membership && membership.isMember && membership.canLeave && !isOwner && (
            <Button variant="outline" onClick={() => leaveMutation.mutate()} disabled={leaveMutation.isPending}>
              {leaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Leave Project'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleStarProject}
            disabled={starMutation.isPending}
          >
            <Star className={cn('w-4 h-4', starredStatus ? 'fill-yellow-400 text-yellow-400' : '')} />
          </Button>
          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStatusChange}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Status</h3>
          </CardHeader>
          <CardContent>
            <Badge className={statusColors[project.status]}>
              {project.status.replace('_', ' ')}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Created</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Visibility</h3>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">
              {project.isPublic ? 'Public' : 'Private'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Tasks</h2>
            {canEdit && (
              <Button onClick={() => setCreateTaskOpen(true)}>
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
          <h2 className="text-2xl font-bold">Team Chat</h2>
          <Suspense fallback={<ComponentLoadingFallback />}>
            <ChatBox chatId={project?.chatId} projectId={id!} members={members} />
          </Suspense>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <h2 className="text-2xl font-bold">Team Members</h2>
          <Suspense fallback={<ComponentLoadingFallback />}>
            <ProjectMembersCard
              projectId={id!}
              members={projectMembers}
              isOwner={isOwner}
              projectOwner={project?.owner}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-2xl font-bold">Analytics</h2>
          <Suspense fallback={<ComponentLoadingFallback />}>
            <AnalyticsPanel projectId={id!} />
          </Suspense>
        </TabsContent>
      </Tabs>

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Project Status</DialogTitle>
            <DialogDescription>
              Select the new status for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={(value: ProjectStatus) => setNewStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusChangeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}