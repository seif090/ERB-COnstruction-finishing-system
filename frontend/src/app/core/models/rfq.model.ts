export interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  projectId?: string;
  description: string;
  requiredByDate: string;
  items: RFQItem[];
  status: RFQStatus;
  vendors: RFQVendorResponse[];
  selectedVendorId?: string;
  awardedAmount?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RFQItem {
  id: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  specifications?: string;
}

export interface RFQVendorResponse {
  vendorId: string;
  vendorName: string;
  price: number;
  deliveryTime: string;
  notes?: string;
  submittedAt: string;
  isWinner: boolean;
}

export type RFQStatus = 'draft' | 'sent' | 'under_review' | 'awarded' | 'cancelled' | 'closed';

export interface CreateRFQRequest {
  title: string;
  projectId?: string;
  description: string;
  requiredByDate: string;
  items: { itemName: string; description?: string; quantity: number; unit: string; specifications?: string }[];
  vendorIds?: string[];
  notes?: string;
}

export interface UpdateRFQRequest {
  title?: string;
  description?: string;
  requiredByDate?: string;
  items?: { itemName: string; description?: string; quantity: number; unit: string; specifications?: string }[];
  status?: RFQStatus;
  selectedVendorId?: string;
  awardedAmount?: string;
  notes?: string;
}

export interface RFQQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  status?: RFQStatus;
}

export interface PaginatedRFQs {
  data: RFQ[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}