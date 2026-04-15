import { Client } from './client.model';
import { User } from './user.model';

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  client?: Client;
  managerId?: string;
  manager?: User;
  status: ProjectStatus;
  budget: number;
  actualCost: number;
  startDate?: Date;
  endDate?: Date;
  actualEndDate?: Date;
  progress: number;
  location?: string;
  area?: number;
  contractValue?: number;
  profitMargin?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  stages?: ProjectStage[];
  tasks?: Task[];
}

export type ProjectStatus = 'PENDING' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export interface ProjectStage {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  order: number;
  status: ProjectStageStatus;
  budget: number;
  actualCost: number;
  startDate?: Date;
  endDate?: Date;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStageStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  stageId?: string;
  assigneeId?: string;
  assignee?: User;
  creatorId?: string;
  creator?: User;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface CreateProjectRequest {
  name: string;
  description?: string;
  clientId: string;
  managerId?: string;
  status?: ProjectStatus;
  budget: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  area?: number;
  contractValue?: number;
  profitMargin?: number;
  notes?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  progress?: number;
  actualCost?: number;
  status?: ProjectStatus;
}

export interface ProjectFilter {
  status?: ProjectStatus;
  clientId?: string;
  managerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}