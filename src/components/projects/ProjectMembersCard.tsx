import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserPlus, Crown, User as UserL, MoreVertical, UserMinus, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { projectsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import type { ProjectMember, User } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ProjectMembersCardProps {
  projectId: string;
  members: ProjectMember[];
  isOwner: boolean;
  projectOwner?: User;
}

export const ProjectMembersCard = ({
  projectId,
  members,
  isOwner,
  projectOwner,
}: ProjectMembersCardProps) => {
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalMembersCount = members.length;

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      toast({
        title: 'Member removed',
        description: 'The member has been successfully removed from the project.',
      });
      setMemberToRemove(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to remove member',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const approveMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.approveMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      toast({
        title: 'Member approved',
        description: 'The member has been approved and added to the project.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to approve member',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const handleRemoveMember = (member: ProjectMember) => {
    setMemberToRemove(member);
  };

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      removeMemberMutation.mutate(memberToRemove.userId);
    }
  };

  return (
    <>
      <Card className="neu-card border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-slate-100">
              <UserL className="w-5 h-5 mr-2 text-purple-400" />
              Team Members ({totalMembersCount})
            </CardTitle>
            {isOwner && (
              <Button size="sm" variant="outline" disabled className="opacity-50 cursor-not-allowed border-slate-600 text-slate-400">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Members (Coming Soon)
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Project Owner */}
            {projectOwner && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative flex items-center justify-between p-4 rounded-xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-purple-600/5 to-purple-500/10 hover:from-purple-500/15 hover:via-purple-600/10 hover:to-purple-500/15 transition-all duration-300 neu-card hover-neu group"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-purple-500/30 group-hover:ring-purple-500/50 transition-all duration-300">
                      <AvatarImage src={projectOwner.avatarUrl} />
                      <AvatarFallback className="bg-purple-600/20 text-purple-300 font-semibold">
                        {projectOwner.name?.charAt(0) || projectOwner.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-slate-100 text-lg">
                        {projectOwner.name || projectOwner.username}
                      </p>
                      {projectOwner.id === user?.id && (
                        <Badge variant="secondary" className="text-xs bg-purple-600/20 text-purple-300 border-purple-500/30">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-300">
                      {projectOwner.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <p className="text-xs text-purple-300 font-medium">
                        Project Owner
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 relative z-10">
                  <Badge className="flex items-center space-x-1 bg-purple-600/20 text-purple-300 border-purple-500/40 px-3 py-1 font-medium">
                    <Crown className="w-3 h-3" />
                    <span>Owner</span>
                  </Badge>
                </div>
              </motion.div>
            )}

            {/* Team Members */}
            {members.length > 0 && (
              <div className="space-y-3">
                <div className="border-t border-slate-700/50 pt-4">
                </div>
                {members.filter(member => member.userId !== projectOwner?.id).map((member, index) => (
                  <motion.div
                    key={member.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 1) * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/40 transition-all duration-200 neu-card"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.user?.avatarUrl} />
                        <AvatarFallback className="bg-slate-700 text-slate-300">
                          {member.user?.name?.charAt(0) || member.user?.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-slate-100">
                            {member.user?.name || member.user?.username}
                          </p>
                          {member.user?.id === user?.id && (
                            <Badge variant="secondary" className="text-xs bg-slate-600/20 text-slate-300 border-slate-500/30">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          {member.user?.email}
                        </p>
                        <p className="text-xs text-slate-500">
                          Joined {formatDistanceToNow(new Date(member.joinedAt))} ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="flex items-center space-x-1 bg-slate-700/20 text-slate-300 border-slate-600/50">
                        <UserL className="w-3 h-3" />
                        <span>Member</span>
                      </Badge>
                      {isOwner && !member.approved && (
                        <Button size="sm" variant="default" onClick={() => approveMemberMutation.mutate(member.userId)} className="bg-purple-600 hover:bg-purple-700 text-white">
                          Approve
                        </Button>
                      )}
                      {isOwner && member.user?.id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300 hover:bg-slate-700/50">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove from project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {members.length === 0 && !projectOwner && (
              <div className="text-center py-8">
                <UserL className="mx-auto h-12 w-12 text-slate-500" />
                <h3 className="mt-2 text-sm font-semibold text-slate-300">No members yet</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Invite team members to collaborate on this project.
                </p>
              </div>
            )}

            {members.length === 0 && projectOwner && (
              <div className="text-center py-8">
                <UserL className="mx-auto h-12 w-12 text-slate-500" />
                <h3 className="mt-2 text-sm font-semibold text-slate-300">No team members yet</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Invite team members to collaborate on this project.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Remove Member</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to remove {memberToRemove?.user?.name || memberToRemove?.user?.username} from this project?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
