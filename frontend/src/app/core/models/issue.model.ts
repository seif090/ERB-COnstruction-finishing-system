export interface Issue {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  taskId?: string;
  reportedBy: string;
  assignedTo?: string;
  priority: IssuePriority;
  status: IssueStatus;
  category: IssueCategory;
  dueDate?: string;
  resolvedAt?: string;
  attachments?: string[];
  comments: IssueComment[];
  createdAt: string;
  updatedAt: string;
}

export interface IssueComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
export type IssueCategory = 'technical' | 'design' | 'material' | 'schedule' | 'quality' | 'other';

export interface CreateIssueRequest {
  title: string;
  description: string;
  projectId?: string;
  taskId?: string;
  reportedBy: string;
  assignedTo?: string;
  priority: IssuePriority;
  category: IssueCategory;
  dueDate?: string;
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  assignedTo?: string;
  priority?: IssuePriority;
  status?: IssueStatus;
  dueDate?: string;
  resolvedAt?: string;
}

export interface IssueQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  assignedTo?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  category?: IssueCategory;
}

export interface PaginatedIssues {
  data: Issue[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  openCount: number;
  criticalCount: number;
}