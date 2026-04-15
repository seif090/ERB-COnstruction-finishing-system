export interface QualityControlChecklist {
  id: string;
  name: string;
  projectId: string;
  category: QCCategory;
  items: QCItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QCItem {
  id: string;
  description: string;
  isCritical: boolean;
  passed?: boolean;
  notes?: string;
}

export type QCCategory = 'structural' | 'electrical' | 'plumbing' | 'finishing' | 'safety' | 'other';

export interface QualityInspection {
  id: string;
  checklistId: string;
  projectId: string;
  inspectorId: string;
  inspectorName: string;
  title: string;
  location: string;
  inspectionDate: string;
  status: QCInspectionStatus;
  score: number;
  totalItems: number;
  passedItems: number;
  failedItems: number;
  findings: QCFinding[];
  photos?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QCFinding {
  id: string;
  description: string;
  severity: QCSeverity;
  location: string;
  assignedTo?: string;
  dueDate?: string;
  resolvedAt?: string;
  status: QCFindingStatus;
}

export type QCInspectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'passed' | 'failed';
export type QCSeverity = 'low' | 'medium' | 'high' | 'critical';
export type QCFindingStatus = 'open' | 'in_progress' | 'resolved' | 'verified';

export interface CreateQualityInspectionRequest {
  checklistId: string;
  projectId: string;
  inspectorId: string;
  inspectorName: string;
  title: string;
  location: string;
  inspectionDate: string;
  notes?: string;
}

export interface UpdateInspectionRequest {
  status?: QCInspectionStatus;
  score?: number;
  passedItems?: number;
  failedItems?: number;
  findings?: QCFinding[];
  notes?: string;
}

export interface QCQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  status?: QCInspectionStatus;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedInspections {
  data: QualityInspection[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  passRate: number;
}