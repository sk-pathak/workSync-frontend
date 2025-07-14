import { motion } from 'framer-motion';
import {
  Calendar,
  Loader,
  CheckSquare,
  Ban,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task } from '@/types';
import { formatDistanceToNow, isFuture } from 'date-fns';

interface TaskCardProps {
  task: Task;
  canEdit: boolean;
  onStatusChange?: (status: string) => void;
}

const priorityColors = {
  1: 'bg-red-600 text-red-800',
  2: 'bg-orange-500 text-orange-900',
  3: 'bg-yellow-400 text-yellow-900',
  4: 'bg-blue-500 text-blue-900',
  5: 'bg-gray-500 text-gray-900',
};

const priorityLabels = {
  1: 'High',
  2: 'Medium-High',
  3: 'Medium',
  4: 'Low-Medium',
  5: 'Low',
};

const statusOptions = [
  { id: 'TODO', label: 'To Do', icon: <Loader className="w-4 h-4 mr-2 inline-block" /> },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: <Loader className="w-4 h-4 mr-2 animate-spin inline-block" /> },
  { id: 'DONE', label: 'Done', icon: <CheckSquare className="w-4 h-4 mr-2 inline-block" /> },
  { id: 'BLOCKED', label: 'Blocked', icon: <Ban className="w-4 h-4 mr-2 inline-block" /> },
];

export const TaskCard = ({ task, canEdit, onStatusChange }: TaskCardProps) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const priorityColor = {
    1: 'border-l-4 border-red-500',
    2: 'border-l-4 border-orange-500',
    3: 'border-l-4 border-yellow-400',
    4: 'border-l-4 border-blue-400',
    5: 'border-l-4 border-muted',
  }[task.priority as keyof typeof priorityColors] || 'border-l-4 border-muted';

  const getDueDateLabel = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isFuture(date)) {
      return `Due in ${formatDistanceToNow(date)}`;
    } else {
      return `Due ${formatDistanceToNow(date)} ago`;
    }
  };

  return (
    <motion.div
    >
      <Card className={`bg-background/80 shadow-md rounded-xl transition-shadow ${priorityColor} hover:shadow-lg`}> 
        <CardContent className="p-5">
          <div className="space-y-3">
            {/* Header */}
            <div>
              <h4 className="font-semibold text-base line-clamp-2">
                {task.title}
              </h4>
              {task.assignee && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground font-medium">Assigned to:</span>
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={task.assignee.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {task.assignee.name?.charAt(0) || task.assignee.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground font-medium">
                    {task.assignee.name || task.assignee.username}
                  </span>
                </div>
              )}
            </div>
            <div className="border-b border-muted my-2" />
            {/* Description */}
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                {task.description}
              </p>
            )}
            {/* Priority */}
            {task.priority && (
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full inline-block ${priorityColors[task.priority as keyof typeof priorityColors].split(' ')[0]} mr-1`} />
                <span className={`text-xs font-bold ${priorityColors[task.priority as keyof typeof priorityColors].split(' ')[1]}`}> {/* Vibrant color */}
                  {priorityLabels[task.priority as keyof typeof priorityLabels]}
                </span>
              </div>
            )}
            {/* Status */}
            {canEdit && onStatusChange ? (
              <Select
                value={task.status}
                onValueChange={onStatusChange}
              >
                <SelectTrigger className="w-28 h-7 text-xs flex items-center justify-center">
                  <SelectValue>
                    <span className="flex items-center justify-center w-full">
                      {statusOptions.find(s => s.id === task.status)?.icon}
                      <span className="flex-1 text-center">{statusOptions.find(s => s.id === task.status)?.label || task.status}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2a] border border-[#24183a] shadow-lg rounded-md">
                  {statusOptions.map(s => (
                    <SelectItem key={s.id} value={s.id} className="flex items-center">
                      {s.icon}
                      <span className="flex-1 text-center">{s.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="secondary" className="text-xs">
                {statusOptions.find(s => s.id === task.status)?.label || task.status}
              </Badge>
            )}
            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${isOverdue ? 'bg-red-500/80 text-white' : 'bg-muted text-muted-foreground'}`} variant="secondary">
                  <Calendar className="w-3 h-3 mr-1 inline-block" />
                  {getDueDateLabel(task.dueDate)}
                </Badge>
              </div>
            )}
            {/* Created */}
            <div className="text-xs text-muted-foreground mt-1">
              Created {formatDistanceToNow(new Date(task.createdAt))} ago
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
