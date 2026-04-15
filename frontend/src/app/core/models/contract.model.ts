import { Client } from './client.model';
import { Project } from './project.model';
import { Unit } from './unit.model';
import { User } from './user.model';

export interface Contract {
  id: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  title: string;
  description?: string;
  clientId: string;
  client?: Client;
  projectId?: string;
  project?: Project;
  unitId?: string;
  unit?: Unit;
  contractValue: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: Date;
  endDate: Date;
  renewalDate?: Date;
  terms?: string;
  conditions?: string;
  notes?: string;
  documentUrl?: string;
  createdById?: string;
  createdBy?: User;
  createdAt: Date;
  updatedAt: Date;
  payments?: Payment[];
}

export type ContractType = 'FINISHING' | 'SALES' | 'RENTAL' | 'MAINTENANCE' | 'CONSULTATION';
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'COMPLETED';

export interface Payment {
  id: string;
  paymentNumber: string;
  contractId: string;
  contract?: Contract;
  projectId?: string;
  project?: Project;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  dueDate: Date;
  paymentDate?: Date;
  notes?: string;
  receiptUrl?: string;
  createdById?: string;
  createdBy?: User;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIALLY_PAID';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHEQUE' | 'ONLINE';

export interface CreateContractRequest {
  type: ContractType;
  title: string;
  description?: string;
  clientId: string;
  projectId?: string;
  unitId?: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  terms?: string;
  conditions?: string;
  notes?: string;
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  status?: ContractStatus;
  paidAmount?: number;
}

export interface ContractFilter {
  type?: ContractType;
  status?: ContractStatus;
  clientId?: string;
  projectId?: string;
  unitId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}