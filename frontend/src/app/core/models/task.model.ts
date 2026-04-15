export interface Task {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  assignedTo: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface CreateTaskRequest {
  title: string;
  description: string;
  projectId?: string;
  assignedTo: string;
  priority: TaskPriority;
  dueDate: string;
  notes?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  projectId?: string;
  assignedTo?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  projectId?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface PaginatedTasks {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}