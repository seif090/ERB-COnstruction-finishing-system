export interface SafetyIncident {
  id: string;
  incidentNumber: string;
  projectId: string;
  location: string;
  incidentDate: string;
  type: SafetyIncidentType;
  severity: SafetySeverity;
  description: string;
  injuredPerson?: string;
  reportedBy: string;
  witnesses?: string[];
  status: SafetyStatus;
  rootCause?: string;
  correctiveActions?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type SafetyIncidentType = 'near_miss' | 'first_aid' | 'recordable' | 'lost_time' | 'fatality';
export type SafetySeverity = 'low' | 'medium' | 'high' | 'critical';
export type SafetyStatus = 'reported' | 'investigating' | 'action_required' | 'closed';

export interface SafetyChecklist {
  id: string;
  projectId: string;
  name: string;
  items: SafetyChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SafetyChecklistItem {
  id: string;
  description: string;
  category: string;
  isCritical: boolean;
}

export interface SafetyMeeting {
  id: string;
  projectId: string;
  title: string;
  meetingDate: string;
  attendees: string[];
  topics: string[];
  notes?: string;
  conductedBy: string;
  createdAt: string;
}

export interface CreateSafetyIncidentRequest {
  projectId: string;
  location: string;
  incidentDate: string;
  type: SafetyIncidentType;
  severity: SafetySeverity;
  description: string;
  injuredPerson?: string;
  reportedBy: string;
  witnesses?: string[];
}

export interface SafetyQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  type?: SafetyIncidentType;
  severity?: SafetySeverity;
  status?: SafetyStatus;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedIncidents {
  data: SafetyIncident[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  incidentRate: number;
}