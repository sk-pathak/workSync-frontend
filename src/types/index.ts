export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'PROJECT_INVITE'
  | 'PROJECT_JOIN_REQUEST'
  | 'PROJECT_JOIN_APPROVED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED';
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
  priority?: TaskPriority;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  assignee?: User;
}

export interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  message: string;
  payload: Record<string, any>;
  createdAt: string;
}

export interface TaskAssignmentPayload {
  taskId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
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
  type: string;
  expiresIn: number;
  user: User;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
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
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
  priority?: TaskPriority;
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