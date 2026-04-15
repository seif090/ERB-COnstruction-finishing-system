export interface SubcontractorContract {
  id: string;
  contractNumber: string;
  subcontractorId: string;
  projectId: string;
  title: string;
  description: string;
  scopeOfWork: string;
  contractValue: number;
  paymentTerms: string;
  startDate: string;
  endDate: string;
  status: SubcontractorContractStatus;
  retentionPercentage?: number;
  penaltyClause?: string;
  insuranceRequired: boolean;
  insuranceAmount?: number;
  approvedBy?: string;
  approvedAt?: string;
  documents?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubcontractorContractStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'terminated' | 'cancelled';

export interface CreateSubcontractorContractRequest {
  subcontractorId: string;
  projectId: string;
  title: string;
  description: string;
  scopeOfWork: string;
  contractValue: number;
  paymentTerms: string;
  startDate: string;
  endDate: string;
  retentionPercentage?: number;
  penaltyClause?: string;
  insuranceRequired: boolean;
  insuranceAmount?: number;
  documents?: string[];
  notes?: string;
}

export interface UpdateSubcontractorContractRequest {
  title?: string;
  description?: string;
  scopeOfWork?: string;
  contractValue?: number;
  paymentTerms?: string;
  startDate?: string;
  endDate?: string;
  status?: SubcontractorContractStatus;
  retentionPercentage?: number;
  penaltyClause?: string;
  insuranceRequired?: boolean;
  insuranceAmount?: number;
  approvedBy?: string;
  approvedAt?: string;
  documents?: string[];
  notes?: string;
}

export interface SubcontractorContractQueryParams {
  page?: number;
  limit?: number;
  subcontractorId?: string;
  projectId?: string;
  status?: SubcontractorContractStatus;
}

export interface PaginatedSubcontractorContracts {
  data: SubcontractorContract[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}