export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: EmployeeStatus;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  position?: string;
  department?: string;
  salary?: number;
  hireDate?: string;
  status?: EmployeeStatus;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: EmployeeStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedEmployees {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}