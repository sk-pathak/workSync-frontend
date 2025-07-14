import { memo, useMemo, Suspense, lazy } from 'react';
import type { Task, ProjectMember } from '@/types';
import { CheckSquare, Loader, Ban } from 'lucide-react';

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
  { id: 'TODO', title: 'To Do', color: 'bg-blue-900/40', icon: Loader, badgeColor: 'bg-blue-500 text-white' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-yellow-900/40', icon: Loader, badgeColor: 'bg-yellow-400 text-white' },
  { id: 'DONE', title: 'Done', color: 'bg-green-900/40', icon: CheckSquare, badgeColor: 'bg-green-500 text-white' },
  { id: 'BLOCKED', title: 'Blocked', color: 'bg-red-900/40', icon: Ban, badgeColor: 'bg-red-500 text-white' },
];

const TaskColumn = memo(({ 
  column, 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  canEdit, 
  members, 
  onAssignTask, 
  onStatusChange 
}: {
  column: typeof columns[0];
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  canEdit: boolean;
  members: ProjectMember[];
  onAssignTask: (taskId: string, userId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
}) => {
  const Icon = column.icon;
  
  return (
    <div className={`rounded-xl ${column.color} shadow-lg border border-surface-hover p-4 min-h-[400px] flex flex-col animate-fade-in`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <h3 className="font-semibold text-base tracking-wide">
            {column.title}
          </h3>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${column.badgeColor}`}>
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3 flex-1">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
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
          </div>
        ))}
      </div>
    </div>
  );
});

TaskColumn.displayName = 'TaskColumn';

export const TaskBoard = memo(({ tasks, onEditTask, onDeleteTask, canEdit, members, onAssignTask, onStatusChange }: TaskBoardProps) => {
  const tasksByColumn = useMemo(() => {
    const grouped = {
      TODO: [] as Task[],
      IN_PROGRESS: [] as Task[],
      DONE: [] as Task[],
      BLOCKED: [] as Task[],
    };
    
    tasks.forEach(task => {
      if (grouped[task.status as keyof typeof grouped]) {
        grouped[task.status as keyof typeof grouped].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <TaskColumn
          key={column.id}
          column={column}
          tasks={tasksByColumn[column.id as keyof typeof tasksByColumn]}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          canEdit={canEdit}
          members={members}
          onAssignTask={onAssignTask}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
});

TaskBoard.displayName = 'TaskBoard';
