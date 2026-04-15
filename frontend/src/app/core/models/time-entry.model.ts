export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId?: string;
  taskId?: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  totalHours: number;
  overtimeHours: number;
  status: TimeEntryStatus;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type TimeEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface CreateTimeEntryRequest {
  employeeId: string;
  projectId?: string;
  taskId?: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  notes?: string;
}

export interface UpdateTimeEntryRequest {
  clockIn?: string;
  clockOut?: string;
  breakMinutes?: number;
  status?: TimeEntryStatus;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface TimeEntryQueryParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  status?: TimeEntryStatus;
}

export interface PaginatedTimeEntries {
  data: TimeEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalHours: number;
  overtimeHours: number;
}

export interface EmployeeAttendanceSummary {
  employeeId: string;
  employeeName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  totalHours: number;
  overtimeHours: number;
}