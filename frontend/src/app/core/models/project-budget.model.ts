export interface ProjectBudget {
  id: string;
  projectId: string;
  totalBudget: number;
  allocated: number;
  spent: number;
  remaining: number;
  categories: BudgetCategory[];
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
  forecast: number;
}

export type BudgetStatus = 'on_track' | 'over_budget' | 'under_budget' | 'critical';

export interface BudgetForecast {
  id: string;
  projectId: string;
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedProfit: number;
  actualIncome: number;
  actualExpenses: number;
  actualProfit: number;
  variance: number;
}

export interface CostChange {
  id: string;
  projectId: string;
  description: string;
  originalCost: number;
  newCost: number;
  changeAmount: number;
  changeType: 'increase' | 'decrease';
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface CreateBudgetRequest {
  projectId: string;
  totalBudget: number;
  categories: { category: string; allocated: number }[];
}

export interface UpdateBudgetRequest {
  totalBudget?: number;
  categories?: { category: string; allocated: number }[];
}

export interface BudgetQueryParams {
  projectId?: string;
}

export interface PaginatedBudgets {
  data: ProjectBudget[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalSpent: number;
  totalBudget: number;
}