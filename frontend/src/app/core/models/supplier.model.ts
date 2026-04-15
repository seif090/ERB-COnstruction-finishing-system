export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  contactPerson?: string;
  category: SupplierCategory;
  status: SupplierStatus;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SupplierCategory = 'materials' | 'equipment' | 'furniture' | 'electrical' | 'plumbing' | 'paint' | 'tools' | 'other';
export type SupplierStatus = 'active' | 'inactive' | 'blocked';

export interface CreateSupplierRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  contactPerson?: string;
  category: SupplierCategory;
  rating?: number;
  notes?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  category?: SupplierCategory;
  status?: SupplierStatus;
  rating?: number;
  notes?: string;
}

export interface SupplierQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: SupplierCategory;
  status?: SupplierStatus;
}

export interface PaginatedSuppliers {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}