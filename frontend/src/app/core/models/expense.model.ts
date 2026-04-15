export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  projectId?: string;
  vendorId?: string;
  paymentMethod: PaymentMethod;
  receipt?: string;
  status: ExpenseStatus;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = 'materials' | 'labor' | 'equipment' | 'transportation' | 'permits' | 'utilities' | 'maintenance' | 'other';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'cheque';
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  projectId?: string;
  vendorId?: string;
  paymentMethod: PaymentMethod;
  receipt?: string;
  notes?: string;
}

export interface UpdateExpenseRequest {
  title?: string;
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  date?: string;
  projectId?: string;
  vendorId?: string;
  paymentMethod?: PaymentMethod;
  receipt?: string;
  status?: ExpenseStatus;
  approvedBy?: string;
  notes?: string;
}

export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginatedExpenses {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalAmount: number;
}