import { Project } from './project.model';

export interface Contractor {
  id: string;
  name: string;
  email: string;
  phone: string;
  altPhone?: string;
  specialty: string[];
  experienceYears?: number;
  idNumber?: string;
  rating: number;
  dailyRate?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractorAssignment {
  id: string;
  contractorId: string;
  contractor?: Contractor;
  projectId: string;
  project?: Project;
  role?: string;
  hourlyRate?: number;
  startDate: Date;
  endDate?: Date;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractorReview {
  id: string;
  contractorId: string;
  projectId?: string;
  rating: number;
  comment?: string;
  createdBy?: string;
  createdAt: Date;
}

export interface CreateContractorRequest {
  name: string;
  email: string;
  phone: string;
  altPhone?: string;
  specialty: string[];
  experienceYears?: number;
  idNumber?: string;
  dailyRate?: number;
  notes?: string;
}

export interface UpdateContractorRequest extends Partial<CreateContractorRequest> {
  isActive?: boolean;
}

export interface ContractorFilter {
  specialty?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}