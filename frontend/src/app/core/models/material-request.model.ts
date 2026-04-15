export interface MaterialRequest {
  id: string;
  projectId: string;
  requestedBy: string;
  items: MaterialRequestItem[];
  status: MaterialRequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialRequestItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export type MaterialRequestStatus = 'pending' | 'approved' | 'rejected' | 'ordered' | 'delivered' | 'cancelled';

export interface CreateMaterialRequestRequest {
  projectId: string;
  requestedBy: string;
  items: { itemName: string; quantity: number; unit: string; notes?: string }[];
  notes?: string;
  deliveryDate?: string;
}

export interface UpdateMaterialRequestRequest {
  items?: { itemName: string; quantity: number; unit: string; notes?: string }[];
  status?: MaterialRequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  deliveryDate?: string;
}

export interface MaterialRequestQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  status?: MaterialRequestStatus;
  requestedBy?: string;
}

export interface PaginatedMaterialRequests {
  data: MaterialRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}