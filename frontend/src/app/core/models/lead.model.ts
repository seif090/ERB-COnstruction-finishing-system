export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  budget?: number;
  requirements?: string;
  assignedTo?: string;
  notes?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadSource = 'website' | 'facebook' | 'instagram' | 'referral' | 'walk_in' | 'cold_call' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  source: LeadSource;
  budget?: number;
  requirements?: string;
  assignedTo?: string;
  notes?: string;
}

export interface UpdateLeadRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  status?: LeadStatus;
  budget?: number;
  requirements?: string;
  assignedTo?: string;
  notes?: string;
  convertedAt?: string;
}

export interface LeadQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: LeadSource;
  status?: LeadStatus;
  assignedTo?: string;
}

export interface PaginatedLeads {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}