import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '@core/services/employee.service';
import { Employee, EmployeeStatus } from '@core/models/employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ 'Employees'  }}</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          {{ 'Add Employee'  }}
        </button>
      </div>

      <div class="mb-4 flex gap-4">
        <mat-form-field appearance="outline" class="w-64">
          <mat-label>{{ 'Search'  }}</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="search()" placeholder="{{ 'Search by name or email'  }}">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-48">
          <mat-label>{{ 'Department'  }}</mat-label>
          <mat-select [(ngModel)]="filterDepartment" (selectionChange)="loadEmployees()">
            <mat-option value="">{{ 'All'  }}</mat-option>
            <mat-option value="engineering">{{ 'Engineering'  }}</mat-option>
            <mat-option value="sales">{{ 'Sales'  }}</mat-option>
            <mat-option value="finance">{{ 'Finance'  }}</mat-option>
            <mat-option value="hr">{{ 'HR'  }}</mat-option>
            <mat-option value="operations">{{ 'Operations'  }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-40">
          <mat-label>{{ 'Status'  }}</mat-label>
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadEmployees()">
            <mat-option value="">{{ 'All'  }}</mat-option>
            <mat-option value="active">{{ 'Active'  }}</mat-option>
            <mat-option value="inactive">{{ 'Inactive'  }}</mat-option>
            <mat-option value="on_leave">{{ 'On Leave'  }}</mat-option>
            <mat-option value="terminated">{{ 'Terminated'  }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="employees" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>{{ 'Name'  }}</th>
            <td mat-cell *matCellDef="let employee">{{ employee.firstName }} {{ employee.lastName }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>{{ 'Email'  }}</th>
            <td mat-cell *matCellDef="let employee">{{ employee.email }}</td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>{{ 'Phone'  }}</th>
            <td mat-cell *matCellDef="let employee">{{ employee.phone }}</td>
          </ng-container>

          <ng-container matColumnDef="position">
            <th mat-header-cell *matHeaderCellDef>{{ 'Position'  }}</th>
            <td mat-cell *matCellDef="let employee">{{ employee.position }}</td>
          </ng-container>

          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>{{ 'Department'  }}</th>
            <td mat-cell *matCellDef="let employee">{{ employee.department }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>{{ 'Status'  }}</th>
            <td mat-cell *matCellDef="let employee">
              <mat-chip [color]="getStatusColor(employee.status)" selected>
                {{ getStatusLabel(employee.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>{{ 'Actions'  }}</th>
            <td mat-cell *matCellDef="let employee">
              <button mat-icon-button [routerLink]="[employee.id]" color="primary">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteEmployee(employee)" color="warn">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [length]="total" [pageSize]="pageSize" [pageIndex]="page - 1" [pageSizeOptions]="[10, 25, 50]" (page)="onPageChange($event)"></mat-paginator>
      </div>
    </div>
  `
})
export class EmployeesComponent implements OnInit {
  displayedColumns = ['name', 'email', 'phone', 'position', 'department', 'status', 'actions'];
  employees: Employee[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  searchQuery = '';
  filterDepartment = '';
  filterStatus: EmployeeStatus | '' = '';

  constructor(private employeeService: EmployeeService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getEmployees({
      page: this.page,
      limit: this.pageSize,
      search: this.searchQuery || undefined,
      department: this.filterDepartment || undefined,
      status: this.filterStatus || undefined
    }).subscribe(response => {
      this.employees = response.data;
      this.total = response.total;
    });
  }

  search() {
    this.page = 1;
    this.loadEmployees();
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }

  getStatusColor(status: EmployeeStatus): string {
    switch (status) {
      case 'active': return 'accent';
      case 'inactive': return 'warn';
      case 'on_leave': return 'primary';
      case 'terminated': return '';
      default: return '';
    }
  }

  getStatusLabel(status: EmployeeStatus): string {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'on_leave': return 'On Leave';
      case 'terminated': return 'Terminated';
      default: return status;
    }
  }

  deleteEmployee(employee: Employee) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(employee.id).subscribe(() => {
        this.loadEmployees();
      });
    }
  }
}