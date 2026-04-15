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
import { MaterialRequestService } from '@core/services/material-request.service';
import { MaterialRequest, MaterialRequestStatus } from '@core/models/material-request.model';

@Component({
  selector: 'app-material-requests',
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
        <h1 class="text-2xl font-bold">طلبات المواد</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          طلب جديد
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <mat-card class="cursor-pointer" (click)="filterByStatus('pending')" [class.border-2]="filterStatus === 'pending'">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ pendingCount }}</div>
              <div class="text-gray-500">قيد الانتظار</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="cursor-pointer" (click)="filterByStatus('approved')" [class.border-2]="filterStatus === 'approved'">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ approvedCount }}</div>
              <div class="text-gray-500">معتمد</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="cursor-pointer" (click)="filterByStatus('ordered')" [class.border-2]="filterStatus === 'ordered'">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ orderedCount }}</div>
              <div class="text-gray-500">تم الطلب</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="cursor-pointer" (click)="filterByStatus('delivered')" [class.border-2]="filterStatus === 'delivered'">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ deliveredCount }}</div>
              <div class="text-gray-500">تم التسليم</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="cursor-pointer" (click)="filterByStatus('')" [class.border-2]="filterStatus === ''">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ totalCount }}</div>
              <div class="text-gray-500">الاجمالي</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="requests" class="w-full">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>رقم الطلب</th>
            <td mat-cell *matCellDef="let req">#{{ req.id.slice(0, 8) }}</td>
          </ng-container>

          <ng-container matColumnDef="project">
            <th mat-header-cell *matHeaderCellDef>المشروع</th>
            <td mat-cell *matCellDef="let req">{{ req.projectId }}</td>
          </ng-container>

          <ng-container matColumnDef="requestedBy">
            <th mat-header-cell *matHeaderCellDef>طلب بواسطة</th>
            <td mat-cell *matCellDef="let req">{{ req.requestedBy }}</td>
          </ng-container>

          <ng-container matColumnDef="items">
            <th mat-header-cell *matHeaderCellDef>عدد المواد</th>
            <td mat-cell *matCellDef="let req">{{ req.items.length }} مواد</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>الحالة</th>
            <td mat-cell *matCellDef="let req">
              <mat-chip [color]="getStatusColor(req.status)" selected>
                {{ getStatusLabel(req.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>التاريخ</th>
            <td mat-cell *matCellDef="let req">{{ req.createdAt | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let req">
              <button mat-icon-button [routerLink]="[req.id]" color="primary">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button (click)="approveRequest(req)" *ngIf="req.status === 'pending'" color="accent">
                <mat-icon>check</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteRequest(req)" color="warn">
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
export class MaterialRequestsComponent implements OnInit {
  displayedColumns = ['id', 'project', 'requestedBy', 'items', 'status', 'createdAt', 'actions'];
  requests: MaterialRequest[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  filterStatus: MaterialRequestStatus | '' = '';
  pendingCount = 0;
  approvedCount = 0;
  orderedCount = 0;
  deliveredCount = 0;
  totalCount = 0;

  constructor(private materialRequestService: MaterialRequestService) {}

  ngOnInit() {
    this.loadRequests();
    this.loadStats();
  }

  loadRequests() {
    this.materialRequestService.getMaterialRequests({
      page: this.page,
      limit: this.pageSize,
      status: this.filterStatus || undefined
    }).subscribe(response => {
      this.requests = response.data;
      this.total = response.total;
    });
  }

  loadStats() {
    this.materialRequestService.getMaterialRequests({ limit: 100 }).subscribe(response => {
      this.totalCount = response.total;
      this.pendingCount = response.data.filter(r => r.status === 'pending').length;
      this.approvedCount = response.data.filter(r => r.status === 'approved').length;
      this.orderedCount = response.data.filter(r => r.status === 'ordered').length;
      this.deliveredCount = response.data.filter(r => r.status === 'delivered').length;
    });
  }

  filterByStatus(status: MaterialRequestStatus | '') {
    this.filterStatus = status;
    this.page = 1;
    this.loadRequests();
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadRequests();
  }

  getStatusColor(status: MaterialRequestStatus): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'approved': return 'primary';
      case 'rejected': return '';
      case 'ordered': return 'accent';
      case 'delivered': return 'accent';
      case 'cancelled': return '';
      default: return '';
    }
  }

  getStatusLabel(status: MaterialRequestStatus): string {
    const labels: Record<MaterialRequestStatus, string> = {
      pending: 'قيد الانتظار',
      approved: 'معتمد',
      rejected: 'مرفوض',
      ordered: 'تم الطلب',
      delivered: 'تم التسليم',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  }

  approveRequest(req: MaterialRequest) {
    this.materialRequestService.updateMaterialRequest(req.id, {
      status: 'approved',
      approvedBy: 'Admin',
      approvedAt: new Date().toISOString()
    }).subscribe(() => {
      this.loadRequests();
      this.loadStats();
    });
  }

  deleteRequest(req: MaterialRequest) {
    if (confirm('حذف هذا الطلب؟')) {
      this.materialRequestService.deleteMaterialRequest(req.id).subscribe(() => {
        this.loadRequests();
        this.loadStats();
      });
    }
  }
}