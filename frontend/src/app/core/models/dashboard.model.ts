export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  newClientsThisMonth: number;
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  rentedUnits: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
  overduePayments: number;
  totalContractors: number;
  activeContractors: number;
}

export interface RevenueChartData {
  labels: string[];
  income: number[];
  expense: number[];
}

export interface ProjectStatusChart {
  labels: string[];
  data: number[];
}

export interface TopClients {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  projectsCount: number;
}

export interface TopProjects {
  projectId: string;
  projectName: string;
  budget: number;
  progress: number;
  status: string;
}

export interface RecentActivity {
  id: string;
  type: 'PROJECT' | 'CLIENT' | 'CONTRACT' | 'PAYMENT' | 'INVENTORY';
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  createdAt: Date;
}

export interface MonthlyStats {
  month: string;
  projects: number;
  revenue: number;
  clients: number;
}