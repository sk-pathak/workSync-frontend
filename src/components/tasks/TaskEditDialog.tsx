import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tasksApi } from '@/lib/api';
import { DateInput } from '@/components/ui/date-input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Task, UpdateTaskRequest, TaskStatus, TaskPriority, ProjectMember } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  members: ProjectMember[];
}

export const TaskEditDialog = ({
  open,
  onOpenChange,
  task,
  members,
}: TaskEditDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      status: task.status,
      assigneeId: task.assigneeId || '',
      priority: task.priority || undefined,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        assigneeId: task.assigneeId || '',
        priority: task.priority || undefined,
      });
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    }
  }, [open, task, reset]);

  const updateTaskMutation = useMutation({
    mutationFn: (data: UpdateTaskRequest) => tasksApi.update(task.projectId, task.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', task.projectId] });
      toast.success('Task updated', {
        description: 'The task has been successfully updated.',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Failed to update task', {
        description: error.response?.data?.message || 'Something went wrong',
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    setIsLoading(true);
    const taskData: UpdateTaskRequest = {
      ...data,
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
    };
    updateTaskMutation.mutate(taskData);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#18181b] rounded-2xl shadow-2xl p-8 border border-[#27272a]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white mb-1">Edit Task</DialogTitle>
          <DialogDescription className="mb-4 text-gray-400">
            Update the task details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              {...register('title')}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-[#23232b] text-white border border-[#27272a] focus:ring-2 focus:ring-purple-500 transition',
                errors.title ? 'border-destructive' : ''
              )}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-[#23232b] text-white border border-[#27272a] focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select
                defaultValue={task.status}
                onValueChange={(value) => setValue('status', value as TaskStatus)}
              >
                <SelectTrigger className="w-full rounded-lg bg-[#23232b] text-white border border-[#27272a] focus:ring-2 focus:ring-purple-500 transition flex items-center justify-center text-center">
                  <SelectValue className="flex items-center justify-center text-center" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2a] border border-[#24183a] shadow-lg rounded-md">
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Priority</Label>
              <Select
                defaultValue={task.priority || ''}
                onValueChange={(value) => setValue('priority', value as TaskPriority)}
              >
                <SelectTrigger className="w-full rounded-lg bg-[#23232b] text-white border border-[#27272a] focus:ring-2 focus:ring-purple-500 transition flex items-center justify-center text-center">
                  <SelectValue placeholder="Select priority" className="flex items-center justify-center text-center" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2a] border border-[#24183a] shadow-lg rounded-md">
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-gray-300">Assignee</Label>
              <Select
                defaultValue={task.assigneeId || ''}
                onValueChange={(value) => setValue('assigneeId', value)}
              >
                <SelectTrigger className="w-full rounded-lg bg-[#23232b] text-white border border-[#27272a] focus:ring-2 focus:ring-purple-500 transition flex items-center justify-center text-center">
                  <SelectValue placeholder="Select assignee" className="flex items-center justify-center text-center" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2a] border border-[#24183a] shadow-lg rounded-md">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.filter(m => m.approved).map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.user?.name || member.user?.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {task.assignee && (
                <div className="flex items-center gap-2 mt-3 p-2 rounded bg-[#23232b] border border-[#27272a]">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={task.assignee.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {task.assignee.name?.charAt(0) || task.assignee.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white font-medium">
                    Assigned to: {task.assignee.name || task.assignee.username}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Due Date</Label>
            <DateInput
              value={dueDate}
              onChange={setDueDate}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 rounded-lg bg-[#23232b] text-white border border-[#27272a] focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="border-t border-[#27272a] pt-6 flex justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-5 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-[#23232b] transition">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
