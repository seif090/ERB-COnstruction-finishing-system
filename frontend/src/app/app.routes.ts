import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./features/clients/clients.component').then(m => m.ClientsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'clients/:id',
    loadComponent: () =>
      import('./features/clients/client-detail/client-detail.component').then(m => m.ClientDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/projects.component').then(m => m.ProjectsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'contractors',
    loadComponent: () =>
      import('./features/contractors/contractors.component').then(m => m.ContractorsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'units',
    loadComponent: () =>
      import('./features/units/units.component').then(m => m.UnitsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'units/:id',
    loadComponent: () =>
      import('./features/units/unit-detail/unit-detail.component').then(m => m.UnitDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'contracts',
    loadComponent: () =>
      import('./features/contracts/contracts.component').then(m => m.ContractsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'contracts/:id',
    loadComponent: () =>
      import('./features/contracts/contract-detail/contract-detail.component').then(m => m.ContractDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory/inventory.component').then(m => m.InventoryComponent),
    canActivate: [authGuard],
  },
  {
    path: 'accounting',
    loadComponent: () =>
      import('./features/accounting/accounting.component').then(m => m.AccountingComponent),
    canActivate: [authGuard],
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./features/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'employees',
    loadComponent: () =>
      import('./features/employees/employees.component').then(m => m.EmployeesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'employees/:id',
    loadComponent: () =>
      import('./features/employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/tasks.component').then(m => m.TasksComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import('./features/tasks/task-form/task-form.component').then(m => m.TaskFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'documents',
    loadComponent: () =>
      import('./features/documents/documents.component').then(m => m.DocumentsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'leads',
    loadComponent: () =>
      import('./features/leads/leads.component').then(m => m.LeadsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'leads/:id',
    loadComponent: () =>
      import('./features/leads/lead-form/lead-form.component').then(m => m.LeadFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'suppliers',
    loadComponent: () =>
      import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent),
    canActivate: [authGuard],
  },
  {
    path: 'suppliers/:id',
    loadComponent: () =>
      import('./features/suppliers/supplier-form/supplier-form.component').then(m => m.SupplierFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./features/calendar/calendar.component').then(m => m.CalendarComponent),
    canActivate: [authGuard],
  },
  {
    path: 'material-requests',
    loadComponent: () =>
      import('./features/material-requests/material-requests.component').then(m => m.MaterialRequestsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./features/expenses/expenses.component').then(m => m.ExpensesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'equipment',
    loadComponent: () =>
      import('./features/equipment/equipment.component').then(m => m.EquipmentComponent),
    canActivate: [authGuard],
  },
  {
    path: 'site-inspections',
    loadComponent: () =>
      import('./features/site-inspections/site-inspections.component').then(m => m.SiteInspectionsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'warranties',
    loadComponent: () =>
      import('./features/warranties/warranties.component').then(m => m.WarrantiesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'purchase-orders',
    loadComponent: () =>
      import('./features/purchase-orders/purchase-orders.component').then(m => m.PurchaseOrdersComponent),
    canActivate: [authGuard],
  },
  {
    path: 'rfqs',
    loadComponent: () =>
      import('./features/rfqs/rfqs.component').then(m => m.RFQsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'work-orders',
    loadComponent: () =>
      import('./features/work-orders/work-orders.component').then(m => m.WorkOrdersComponent),
    canActivate: [authGuard],
  },
  {
    path: 'subcontractor-contracts',
    loadComponent: () =>
      import('./features/subcontractor-contracts/subcontractor-contracts.component').then(m => m.SubcontractorContractsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'time-tracking',
    loadComponent: () =>
      import('./features/time-tracking/time-tracking.component').then(m => m.TimeTrackingComponent),
    canActivate: [authGuard],
  },
  {
    path: 'quality-control',
    loadComponent: () =>
      import('./features/quality-control/quality-control.component').then(m => m.QualityControlComponent),
    canActivate: [authGuard],
  },
  {
    path: 'safety',
    loadComponent: () =>
      import('./features/safety/safety.component').then(m => m.SafetyComponent),
    canActivate: [authGuard],
  },
  {
    path: 'project-budgeting',
    loadComponent: () =>
      import('./features/project-budgeting/project-budgeting.component').then(m => m.ProjectBudgetingComponent),
    canActivate: [authGuard],
  },
  {
    path: 'issues',
    loadComponent: () =>
      import('./features/issues/issues.component').then(m => m.IssuesComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];