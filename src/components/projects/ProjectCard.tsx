import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Star,
  Users,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProjectCardProps {
  project: Project;
  starredProjects?: Project[];
  onStar?: (projectId: string) => void;
  onJoin?: (projectId: string) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

const statusColors = {
  PLANNED: 'bg-blue-500/10 text-blue-700 border-blue-200',
  ACTIVE: 'bg-green-500/10 text-green-700 border-green-200',
  COMPLETED: 'bg-purple-500/10 text-purple-700 border-purple-200',
  ON_HOLD: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  CANCELLED: 'bg-red-500/10 text-red-700 border-red-200',
};

export const ProjectCard = ({
  project,
  starredProjects = [],
  onStar,
  onEdit,
  onDelete,
}: ProjectCardProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [membership, setMembership] = useState<{ isMember: boolean; isOwner: boolean; canJoin: boolean; canLeave: boolean } | null>(null);
  const [loadingMembership, setLoadingMembership] = useState(false);

  const isStarred = starredProjects.some((sp: Project) => sp.id === project.id);

  const fetchMembership = async () => {
    setLoadingMembership(true);
    try {
      const data = await projectsApi.getMembership(project.id);
      setMembership(data);
    } catch (e) {
      setMembership(null);
    } finally {
      setLoadingMembership(false);
    }
  };

  useEffect(() => {
    fetchMembership();
  }, [project.id]);

  const joinMutation = useMutation({
    mutationFn: () => projectsApi.join(project.id),
    onSuccess: () => {
      fetchMembership();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-members', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'dashboard'] });
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
    mutationFn: () => projectsApi.leave(project.id),
    onSuccess: () => {
      fetchMembership();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-members', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'dashboard'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to leave project",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="animate-fade-in">
      <Card className="h-full hover:shadow-lg transition-all duration-150 hover:scale-102">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link to={`/projects/${project.id}`}>
                <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                  {project.name}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description || 'No description provided'}
              </p>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStar?.(project.id)}
                disabled={!onStar}
                className={cn(
                  'p-1 transition-all duration-200 hover:scale-110',
                  isStarred 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'text-muted-foreground hover:text-yellow-500'
                )}
              >
                <Star
                  className={cn(
                    'w-4 h-4 transition-all duration-200',
                    isStarred 
                      ? 'fill-current drop-shadow-sm' 
                      : 'hover:scale-110'
                  )}
                />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/projects/${project.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  {project.ownerId === user?.id && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit?.(project)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(project.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status and Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={cn(statusColors[project.status])}
                >
                  {project.status.replace('_', ' ')}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    project.isPublic 
                      ? 'bg-green-500/10 text-green-700 border-green-200' 
                      : 'bg-orange-500/10 text-orange-700 border-orange-200'
                  )}
                >
                  {project.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {project.progress || 0}% complete
              </span>
            </div>
            <Progress value={project.progress || 0} className="h-2" />
          </div>

          {/* Owner and Members */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={project.owner?.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {project.owner?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {project.owner?.name || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{project.memberCount || 0}</span>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Created {formatDistanceToNow(new Date(project.createdAt))} ago
            </span>
          </div>

          {/* Actions */}
          {membership && project.isPublic && !membership.isOwner && (
            <div className="flex justify-end mt-2">
              {membership.canJoin ? (
                <Button
                  size="sm"
                  className="neu-btn"
                  onClick={() => joinMutation.mutate()}
                  disabled={joinMutation.isPending || loadingMembership}
                >
                  {joinMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Join
                </Button>
              ) : membership.canLeave ? (
                <Button
                  size="sm"
                  className="neu-btn bg-destructive text-white hover:bg-destructive/80"
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending || loadingMembership}
                >
                  {leaveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Leave
                </Button>
              ) : membership.isMember ? (
                <span className="text-xs text-muted-foreground">Already a member</span>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
