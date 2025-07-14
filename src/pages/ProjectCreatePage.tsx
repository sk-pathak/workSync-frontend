import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { projectsApi } from '@/lib/api';
import { toast } from 'sonner';
import type { CreateProjectRequest } from '@/types';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  isPublic: z.boolean(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export const ProjectCreatePage = () => {
  const [isLoading, setIsLoading] = useState(false);

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
      name: '',
      description: '',
      isPublic: false,
      status: 'PLANNED',
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.create(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created', {
        description: 'Your project has been created successfully.',
      });
      navigate(`/projects/${project.id}`);
    },
    onError: (error: any) => {
      toast.error('Failed to create project', {
        description: error.response?.data?.message || 'Something went wrong',
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    setIsLoading(true);
    const payload: CreateProjectRequest = {
      name: data.name,
      description: typeof data.description === 'string' ? data.description : '',
      isPublic: !!data.isPublic,
      status: data.status,
    };
    createProjectMutation.mutate(payload);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen bg-gradient-dark">
      <div className="relative w-full max-w-md mx-auto">
        <Card className="glass-card backdrop-blur-2xl bg-white/10 border border-purple-400/30 shadow-2xl rounded-3xl p-0 overflow-hidden" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', border: '1.5px solid rgba(255,255,255,0.18)' }}>
          <div className="absolute -inset-0.5 rounded-3xl pointer-events-none border-2 border-purple-400/30" style={{ filter: 'blur(6px)', opacity: 0.5 }}></div>
          <CardHeader className="z-10 relative px-8 pt-8 pb-4 flex flex-row items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="glass-button !bg-transparent border border-white/20 hover:bg-white/10 transition mr-2" tabIndex={-1}>
              <a href="/projects" aria-label="Back to Projects">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
            </Button>
            <CardTitle className="text-3xl font-bold text-white drop-shadow-lg tracking-tight">Create New Project</CardTitle>
          </CardHeader>
          <Separator className="bg-white/20 mx-8" />
          <CardContent className="z-10 relative px-8 py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-white text-base font-medium">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter project name"
                    {...register('name')}
                    className={`glass-input text-lg px-4 py-3 ${errors.name ? 'border-destructive' : 'border-white/20'} bg-white/15 text-white placeholder:text-white/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/30 rounded-xl`}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description" className="text-white text-base font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter project description"
                    {...register('description')}
                    rows={3}
                    className="glass-input text-lg px-4 py-3 bg-white/15 text-white placeholder:text-white/60 border-white/20 focus:border-accent/60 focus:ring-2 focus:ring-accent/30 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white text-base font-medium">Public Project</Label>
                      <p className="text-sm text-white/60 mt-1">
                        Allow anyone to view and request to join this project
                      </p>
                    </div>
                    <Switch
                      checked={watch('isPublic')}
                      onCheckedChange={(checked) => setValue('isPublic', checked)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status" className="text-white text-base font-medium">Project Status</Label>
                  <select
                    id="status"
                    {...register('status')}
                    className="glass-input w-full text-lg px-4 py-3 bg-white/15 text-white border-white/20 focus:border-accent/60 focus:ring-2 focus:ring-accent/30 rounded-xl shadow"
                    defaultValue="PLANNED"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full glass-button bg-gradient-to-r from-purple-500/80 to-accent/80 text-white hover:from-purple-600 hover:to-accent/90 font-semibold text-lg py-3 rounded-xl shadow-lg border-2 border-purple-400/30 transition-all duration-200">
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Create Project
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}