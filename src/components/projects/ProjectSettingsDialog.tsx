import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { projectsApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Project, ProjectStatus, UpdateProjectRequest } from '@/types';
import { useNavigate } from 'react-router-dom';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
  isPublic: z.boolean(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export const ProjectSettingsDialog = ({
  open,
  onOpenChange,
  project,
}: ProjectSettingsDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      status: project.status,
      isPublic: project.isPublic,
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: UpdateProjectRequest) => projectsApi.update(project.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated', {
        description: 'The project has been successfully updated.',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Project update error:', error);
      let errorMessage = 'Something went wrong';
      
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (typeof message === 'string') {
          errorMessage = message;
        } else if (typeof message === 'object' && message.description) {
          errorMessage = String(message.description);
        } else {
          errorMessage = String(message);
        }
      }
      
      console.log('Processed error message:', errorMessage);
      toast.error('Failed to update project', {
        description: errorMessage,
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsApi.delete(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted', {
        description: 'The project has been successfully deleted.',
      });
      navigate('/projects');
    },
    onError: (error: any) => {
      let errorMessage = 'Something went wrong';
      
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (typeof message === 'string') {
          errorMessage = message;
        } else if (typeof message === 'object' && message.description) {
          errorMessage = String(message.description);
        } else {
          errorMessage = String(message);
        }
      }
      
      toast.error('Failed to delete project', {
        description: errorMessage,
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    console.log('Form data:', data);
    console.log('Form errors:', errors);
    setIsLoading(true);
    const payload: UpdateProjectRequest = {
      name: data.name,
      description: data.description || '',
      status: data.status,
      isPublic: data.isPublic || false,
    };
    console.log('Submitting project update:', payload);
    updateProjectMutation.mutate(payload);
    setIsLoading(false);
  };

  const handleDeleteProject = () => {
    deleteProjectMutation.mutate();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg bg-[#18181b] rounded-2xl shadow-2xl p-8 border border-[#27272a]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white mb-1">Project Settings</DialogTitle>
            <DialogDescription className="mb-4 text-gray-400">
              Update your project settings and preferences.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : 'w-full px-4 py-2 rounded-lg bg-[#23232b] text-white border border-[#27272a] focus:ring-2 focus:ring-purple-500 transition'}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {typeof errors.name.message === 'string' 
                      ? errors.name.message 
                      : String(errors.name.message)
                    }
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter project description"
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-[#23232b] text-white border border-[#27272a] focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Status</Label>
                <Select
                  defaultValue={project.status}
                  onValueChange={(value) => setValue('status', value as ProjectStatus)}
                >
                  <SelectTrigger className="w-full rounded-lg bg-[#23232b] text-white border border-[#27272a] focus:ring-2 focus:ring-purple-500 transition flex items-center justify-center text-center">
                    <SelectValue className="flex items-center justify-center text-center" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a0f2a] border border-[#24183a] shadow-lg rounded-md">
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Public Project</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anyone to view and request to join this project
                  </p>
                </div>
                <Switch
                  checked={watch('isPublic')}
                  onCheckedChange={(checked) => setValue('isPublic', checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-destructive mb-2">Danger Zone</h4>
                <div className="border border-destructive/20 rounded-lg p-4 bg-[#23232b]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Delete Project</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this project and all its data
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="px-4 py-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#27272a] pt-6 flex justify-end gap-3 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-5 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-[#23232b] transition"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
              All tasks, members, and project data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
