export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  projectId?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: PurchaseOrderStatus;
  paymentTerms?: string;
  deliveryAddress?: string;
  expectedDeliveryDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export type PurchaseOrderStatus = 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled';

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  projectId?: string;
  items: { itemName: string; description?: string; quantity: number; unit: string; unitPrice: number }[];
  paymentTerms?: string;
  deliveryAddress?: string;
  expectedDeliveryDate?: string;
  notes?: string;
}

export interface UpdatePurchaseOrderRequest {
  items?: { itemName: string; description?: string; quantity: number; unit: string; unitPrice: number }[];
  status?: PurchaseOrderStatus;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface PurchaseOrderQueryParams {
  page?: number;
  limit?: number;
  supplierId?: string;
  projectId?: string;
  status?: PurchaseOrderStatus;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedPurchaseOrders {
  data: PurchaseOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}