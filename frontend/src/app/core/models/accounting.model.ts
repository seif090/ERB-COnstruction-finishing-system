import { User } from './user.model';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  date: Date;
  createdById?: string;
  createdBy?: User;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionCategory = 
  | 'PROJECT_PAYMENT' 
  | 'SALARY' 
  | 'MATERIAL_PURCHASE' 
  | 'EQUIPMENT_RENTAL' 
  | 'MAINTENANCE' 
  | 'UTILITIES' 
  | 'RENTAL_INCOME' 
  | 'SALE_INCOME' 
  | 'OTHER';

export interface AccountingSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  incomeByCategory: { category: string; amount: number }[];
  expenseByCategory: { category: string; amount: number }[];
  monthlyIncome: { month: string; amount: number }[];
  monthlyExpense: { month: string; amount: number }[];
}

export interface CreateTransactionRequest {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  date?: string;
}

export interface TransactionFilter {
  type?: TransactionType;
  category?: TransactionCategory;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}