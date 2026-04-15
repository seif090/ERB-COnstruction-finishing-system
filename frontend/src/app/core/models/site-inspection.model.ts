export interface SiteInspection {
  id: string;
  projectId: string;
  inspectorId: string;
  inspectorName: string;
  title: string;
  location: string;
  inspectionDate: string;
  findings: string;
  recommendations?: string;
  photos?: string[];
  status: InspectionStatus;
  issuesCount: number;
  severity?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'needs_follow_up';

export interface CreateSiteInspectionRequest {
  projectId: string;
  inspectorId: string;
  inspectorName: string;
  title: string;
  location: string;
  inspectionDate: string;
  findings: string;
  recommendations?: string;
  photos?: string[];
  severity?: string;
  followUpDate?: string;
}

export interface UpdateSiteInspectionRequest {
  title?: string;
  findings?: string;
  recommendations?: string;
  photos?: string[];
  status?: InspectionStatus;
  issuesCount?: number;
  severity?: string;
  followUpDate?: string;
}

export interface SiteInspectionQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  inspectorId?: string;
  status?: InspectionStatus;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedSiteInspections {
  data: SiteInspection[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}