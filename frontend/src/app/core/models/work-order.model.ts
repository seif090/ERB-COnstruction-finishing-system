export interface WorkOrder {
  id: string;
  woNumber: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedType: 'contractor' | 'employee';
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours?: number;
  laborCost?: number;
  materialsCost?: number;
  totalCost?: number;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WorkOrderStatus = 'pending' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface CreateWorkOrderRequest {
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedType: 'contractor' | 'employee';
  priority: WorkOrderPriority;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  laborCost?: number;
  materialsCost?: number;
  notes?: string;
}

export interface UpdateWorkOrderRequest {
  title?: string;
  description?: string;
  assignedTo?: string;
  assignedType?: 'contractor' | 'employee';
  priority?: WorkOrderPriority;
  status?: WorkOrderStatus;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  laborCost?: number;
  materialsCost?: number;
  totalCost?: number;
  completedAt?: string;
  notes?: string;
}

export interface WorkOrderQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  assignedTo?: string;
  assignedType?: 'contractor' | 'employee';
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
}

export interface PaginatedWorkOrders {
  data: WorkOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}