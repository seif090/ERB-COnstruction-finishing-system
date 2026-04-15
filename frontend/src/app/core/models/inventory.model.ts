import { Project, ProjectStage } from './project.model';

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  price: number;
  supplier?: string;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  item?: InventoryItem;
  type: InventoryTransactionType;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
  performedById?: string;
  createdAt: Date;
}

export type InventoryTransactionType = 'IN' | 'OUT' | 'RETURN' | 'ADJUSTMENT';

export interface ProjectMaterial {
  id: string;
  projectId: string;
  project?: Project;
  stageId?: string;
  stage?: ProjectStage;
  itemId: string;
  item?: InventoryItem;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryItemRequest {
  name: string;
  code: string;
  category: string;
  description?: string;
  unit?: string;
  quantity?: number;
  minQuantity?: number;
  price: number;
  supplier?: string;
  location?: string;
}

export interface UpdateInventoryItemRequest extends Partial<CreateInventoryItemRequest> {
  isActive?: boolean;
}

export interface InventoryFilter {
  category?: string;
  isActive?: boolean;
  search?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateInventoryTransactionRequest {
  itemId: string;
  type: InventoryTransactionType;
  quantity: number;
  unitPrice: number;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
}