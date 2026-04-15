import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { WorkOrderService } from '@core/services/work-order.service';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '@core/models/work-order.model';

@Component({
  selector: 'app-work-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">أوامر العمل</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          أمر عمل جديد
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ pendingCount }}</div>
              <div class="text-gray-500">معلق</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ assignedCount }}</div>
              <div class="text-gray-500">مُسند</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ inProgressCount }}</div>
              <div class="text-gray-500">قيد التنفيذ</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ completedCount }}</div>
              <div class="text-gray-500">مكتمل</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ totalCount }}</div>
              <div class="text-gray-500">الاجمالي</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="mb-4 flex gap-4">
        <mat-form-field appearance="outline" class="w-40">
          <mat-label>الحالة</mat-label>
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadWorkOrders()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="pending">معلق</mat-option>
            <mat-option value="assigned">مُسند</mat-option>
            <mat-option value="in_progress">قيد التنفيذ</mat-option>
            <mat-option value="on_hold">معلق مؤقتاً</mat-option>
            <mat-option value="completed">مكتمل</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-40">
          <mat-label>الأولوية</mat-label>
          <mat-select [(ngModel)]="filterPriority" (selectionChange)="loadWorkOrders()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="low">منخفضة</mat-option>
            <mat-option value="medium">متوسطة</mat-option>
            <mat-option value="high">عالية</mat-option>
            <mat-option value="urgent">عاجلة</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="workOrders" class="w-full">
          <ng-container matColumnDef="woNumber">
            <th mat-header-cell *matHeaderCellDef>رقم الأمر</th>
            <td mat-cell *matCellDef="let wo">{{ wo.woNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>العنوان</th>
            <td mat-cell *matCellDef="let wo">{{ wo.title }}</td>
          </ng-container>

          <ng-container matColumnDef="project">
            <th mat-header-cell *matHeaderCellDef>المشروع</th>
            <td mat-cell *matCellDef="let wo">{{ wo.projectId }}</td>
          </ng-container>

          <ng-container matColumnDef="assignedTo">
            <th mat-header-cell *matHeaderCellDef>مُسند إلى</th>
            <td mat-cell *matCellDef="let wo">{{ wo.assignedTo }}</td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>الأولوية</th>
            <td mat-cell *matCellDef="let wo">
              <mat-chip [color]="getPriorityColor(wo.priority)" selected>
                {{ getPriorityLabel(wo.priority) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>الحالة</th>
            <td mat-cell *matCellDef="let wo">
              <mat-chip [color]="getStatusColor(wo.status)" selected>
                {{ getStatusLabel(wo.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="endDate">
            <th mat-header-cell *matHeaderCellDef>تاريخ النهاية</th>
            <td mat-cell *matCellDef="let wo">{{ wo.endDate | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let wo">
              <button mat-icon-button [routerLink]="[wo.id]" color="primary">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="completeWorkOrder(wo)" *ngIf="wo.status === 'in_progress'" color="accent">
                <mat-icon>check</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteWorkOrder(wo)" color="warn">
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
export class WorkOrdersComponent implements OnInit {
  displayedColumns = ['woNumber', 'title', 'project', 'assignedTo', 'priority', 'status', 'endDate', 'actions'];
  workOrders: WorkOrder[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  filterStatus: WorkOrderStatus | '' = '';
  filterPriority: WorkOrderPriority | '' = '';
  pendingCount = 0;
  assignedCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  totalCount = 0;

  constructor(private workOrderService: WorkOrderService) {}

  ngOnInit() {
    this.loadWorkOrders();
  }

  loadWorkOrders() {
    this.workOrderService.getWorkOrders({
      page: this.page,
      limit: this.pageSize,
      status: this.filterStatus || undefined,
      priority: this.filterPriority || undefined
    }).subscribe(response => {
      this.workOrders = response.data;
      this.total = response.total;
    });

    this.workOrderService.getWorkOrders({ limit: 100 }).subscribe(response => {
      this.totalCount = response.total;
      this.pendingCount = response.data.filter(w => w.status === 'pending').length;
      this.assignedCount = response.data.filter(w => w.status === 'assigned').length;
      this.inProgressCount = response.data.filter(w => w.status === 'in_progress').length;
      this.completedCount = response.data.filter(w => w.status === 'completed').length;
    });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadWorkOrders();
  }

  getPriorityColor(priority: WorkOrderPriority): string {
    switch (priority) {
      case 'low': return '';
      case 'medium': return 'primary';
      case 'high': return 'accent';
      case 'urgent': return 'warn';
      default: return '';
    }
  }

  getPriorityLabel(priority: WorkOrderPriority): string {
    const labels: Record<WorkOrderPriority, string> = {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      urgent: 'عاجلة'
    };
    return labels[priority] || priority;
  }

  getStatusColor(status: WorkOrderStatus): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'assigned': return 'primary';
      case 'in_progress': return 'accent';
      case 'on_hold': return '';
      case 'completed': return 'accent';
      case 'cancelled': return '';
      default: return '';
    }
  }

  getStatusLabel(status: WorkOrderStatus): string {
    const labels: Record<WorkOrderStatus, string> = {
      pending: 'معلق',
      assigned: 'مُسند',
      in_progress: 'قيد التنفيذ',
      on_hold: 'معلق مؤقتاً',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  }

  completeWorkOrder(wo: WorkOrder) {
    this.workOrderService.completeWorkOrder(wo.id).subscribe(() => {
      this.loadWorkOrders();
    });
  }

  deleteWorkOrder(wo: WorkOrder) {
    if (confirm('حذف هذا الأمر؟')) {
      this.workOrderService.deleteWorkOrder(wo.id).subscribe(() => {
        this.loadWorkOrders();
      });
    }
  }
}