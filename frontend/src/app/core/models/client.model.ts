export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  altPhone?: string;
  company?: string;
  position?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'NEGOTIATION' | 'CLOSED' | 'LOST';
  source?: string;
  notes?: string;
  address?: string;
  city?: string;
  country: string;
  nationalId?: string;
  createdAt: Date;
  updatedAt: Date;
  projectsCount?: number;
  contractsCount?: number;
}

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientInteraction {
  id: string;
  clientId: string;
  type: string;
  subject: string;
  description?: string;
  date: Date;
  createdBy?: string;
  createdAt: Date;
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  altPhone?: string;
  company?: string;
  position?: string;
  status?: 'LEAD' | 'NEGOTIATION' | 'ACTIVE' | 'INACTIVE' | 'CLOSED' | 'LOST';
  source?: string;
  notes?: string;
  address?: string;
  city?: string;
  country?: string;
  nationalId?: string;
}

export interface UpdateClientRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  altPhone?: string;
  company?: string;
  position?: string;
  status?: 'LEAD' | 'NEGOTIATION' | 'ACTIVE' | 'INACTIVE' | 'CLOSED' | 'LOST';
  source?: string;
  notes?: string;
  address?: string;
  city?: string;
  country?: string;
  nationalId?: string;
}

export interface ClientFilter {
  status?: Client['status'];
  search?: string;
  city?: string;
  source?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}