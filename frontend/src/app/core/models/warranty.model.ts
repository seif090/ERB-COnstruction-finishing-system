export interface Warranty {
  id: string;
  projectId?: string;
  unitId?: string;
  itemName: string;
  vendorId?: string;
  warrantyType: WarrantyType;
  startDate: string;
  endDate: string;
  status: WarrantyStatus;
  description?: string;
  documentUrl?: string;
  reminderDays: number;
  createdAt: string;
  updatedAt: string;
}

export type WarrantyType = 'equipment' | 'materials' | 'appliances' | 'structural' | 'other';
export type WarrantyStatus = 'active' | 'expired' | 'voided' | 'renewed';

export interface CreateWarrantyRequest {
  projectId?: string;
  unitId?: string;
  itemName: string;
  vendorId?: string;
  warrantyType: WarrantyType;
  startDate: string;
  endDate: string;
  description?: string;
  documentUrl?: string;
  reminderDays?: number;
}

export interface UpdateWarrantyRequest {
  projectId?: string;
  unitId?: string;
  itemName?: string;
  vendorId?: string;
  warrantyType?: WarrantyType;
  startDate?: string;
  endDate?: string;
  status?: WarrantyStatus;
  description?: string;
  documentUrl?: string;
  reminderDays?: number;
}

export interface WarrantyQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  unitId?: string;
  warrantyType?: WarrantyType;
  status?: WarrantyStatus;
  expiringWithinDays?: number;
}

export interface PaginatedWarranties {
  data: Warranty[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  expiringSoon: number;
  expired: number;
}