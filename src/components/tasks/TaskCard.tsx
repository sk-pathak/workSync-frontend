import { motion } from 'framer-motion';
import {
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task, ProjectMember } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  members?: ProjectMember[];
  onAssign?: (userId: string) => void;
  onStatusChange?: (status: string) => void;
}

const priorityColors = {
  1: 'bg-red-500/10 text-red-700 border-red-200',
  2: 'bg-orange-500/10 text-orange-700 border-orange-200',
  3: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  4: 'bg-blue-500/10 text-blue-700 border-blue-200',
  5: 'bg-gray-500/10 text-gray-700 border-gray-200',
};

const priorityLabels = {
  1: 'High',
  2: 'Medium-High',
  3: 'Medium',
  4: 'Low-Medium',
  5: 'Low',
};

const statusOptions = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'DONE', label: 'Done' },
  { id: 'BLOCKED', label: 'Blocked' },
];

export const TaskCard = ({ task, onEdit, onDelete, canEdit, members = [], onAssign, onStatusChange }: TaskCardProps) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm line-clamp-2 flex-1">
                {task.title}
              </h4>
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Priority */}
            {task.priority && (
              <Badge
                variant="outline"
                className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}
              >
                {priorityLabels[task.priority as keyof typeof priorityLabels]}
              </Badge>
            )}

            {/* Assignee */}
            <div className="flex items-center space-x-2">
              {task.assignee && (
                <>
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={task.assignee.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {task.assignee.name?.charAt(0) || task.assignee.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {task.assignee.name || task.assignee.username}
                  </span>
                </>
              )}
              {canEdit && members.length > 0 && onAssign && (
                <Select
                  value={task.assigneeId || ''}
                  onValueChange={onAssign}
                >
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <SelectValue placeholder="Assign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.filter(m => m.approved).map(m => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.user?.name || m.user?.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {statusOptions.find(s => s.id === task.status)?.label || task.status}
              </Badge>
              {canEdit && onStatusChange && (
                <Select
                  value={task.status}
                  onValueChange={onStatusChange}
                >
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center space-x-1 text-xs ${
                isOverdue ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                <Calendar className="w-3 h-3" />
                <span>
                  Due {formatDistanceToNow(new Date(task.dueDate))} ago
                </span>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
              </div>
            )}

            {/* Created */}
            <div className="text-xs text-muted-foreground">
              Created {formatDistanceToNow(new Date(task.createdAt))} ago
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
