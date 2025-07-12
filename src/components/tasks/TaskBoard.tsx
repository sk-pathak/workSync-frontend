import { motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import type { Task, ProjectMember } from '@/types';

const TaskCard = lazy(() => import('./TaskCard').then(module => ({ default: module.TaskCard })));

const TaskCardLoadingFallback = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-card rounded-lg p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
      </div>
    </div>
  );
}

interface TaskBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  canEdit: boolean;
  members: ProjectMember[];
  onAssignTask: (taskId: string, userId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
}

const columns = [
  { id: 'TODO', title: 'To Do', color: 'border-blue-200 bg-blue-50/50' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-yellow-200 bg-yellow-50/50' },
  { id: 'DONE', title: 'Done', color: 'border-green-200 bg-green-50/50' },
  { id: 'BLOCKED', title: 'Blocked', color: 'border-red-200 bg-red-50/50' },
];

export const TaskBoard = ({ tasks, onEditTask, onDeleteTask, canEdit, members, onAssignTask, onStatusChange }: TaskBoardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.id);
        
        return (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg border-2 border-dashed p-4 min-h-[400px] ${column.color}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                {column.title}
              </h3>
              <span className="text-xs text-muted-foreground bg-card px-2 py-1 rounded-full">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {columnTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Suspense fallback={<TaskCardLoadingFallback />}>
                    <TaskCard
                      task={task}
                      onEdit={() => onEditTask(task)}
                      onDelete={() => onDeleteTask(task.id)}
                      canEdit={canEdit}
                      members={members}
                      onAssign={(userId: string) => onAssignTask(task.id, userId)}
                      onStatusChange={(status: string) => onStatusChange(task.id, status)}
                    />
                  </Suspense>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
