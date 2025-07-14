export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
export type NotificationType =
  | 'JOIN_REQUEST'
  | 'JOIN_APPROVED'
  | 'JOIN_REJECTED'
  | 'MEMBER_REMOVED'
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE'
  | 'PROJECT_UPDATED'
  | 'PROJECT_STATUS_CHANGED'
  | 'TASK_COMMENTED'
  | 'MENTIONED_IN_COMMENT';
export type NotificationStatus = 'PENDING' | 'READ' | 'DISMISSED';

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  chatId?: string;
  owner?: User;
  members?: ProjectMember[];
  tasks?: Task[];
  progress?: number;
  isStarred?: boolean;
  memberCount?: number;
  totalTasks?: number;
  completedTasks?: number;
  progressPercentage?: number;
  taskStatusBreakdown?: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
    BLOCKED: number;
  };
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  roleId: number;
  joinedAt: string;
  approved: boolean;
  user?: User;
}

export interface Task {
  id: string;
  projectId: string;
  creatorId: string;
  assigneeId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  priority?: number;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  assignee?: User;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  sender?: User | null;
  projectId?: string;
  project?: Project | null;
  type: NotificationType;
  status: NotificationStatus;
  payload: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignmentPayload {
  taskId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: number;
}

export interface TaskStatusChangePayload {
  taskId: string;
  title: string;
  oldStatus: string;
  newStatus: string;
}

export interface TaskCommentPayload {
  taskId: string;
  title: string;
  commentId: string;
  commentText: string;
}

export interface Chat {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  sentAt: string;
  sender?: User;
}

export interface AuthResponse {
  token: string;
  role: string;
  expirationTime: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  isPublic?: boolean;
  status?: ProjectStatus;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  status?: ProjectStatus;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  priority?: number;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
  priority?: number;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
  starred?: boolean;
  owned?: boolean;
  member?: boolean;
  page?: number;
  size?: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface GithubAnalyticsDTO {
  [key: string]: any;
}