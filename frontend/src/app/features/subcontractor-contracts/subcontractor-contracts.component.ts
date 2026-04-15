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
import { SubcontractorContractService } from '@core/services/subcontractor-contract.service';
import { SubcontractorContract, SubcontractorContractStatus } from '@core/models/subcontractor-contract.model';

@Component({
  selector: 'app-subcontractor-contracts',
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
        <h1 class="text-2xl font-bold">عقود المقاولين من الباطن</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          عقد جديد
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ draftCount }}</div>
              <div class="text-gray-500">مسودة</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ pendingCount }}</div>
              <div class="text-gray-500">بانتظار الاعتماد</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ activeCount }}</div>
              <div class="text-gray-500">نشط</div>
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
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadContracts()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="draft">مسودة</mat-option>
            <mat-option value="pending_approval">بانتظار الاعتماد</mat-option>
            <mat-option value="approved">معتمد</mat-option>
            <mat-option value="active">نشط</mat-option>
            <mat-option value="completed">مكتمل</mat-option>
            <mat-option value="terminated">منتهي</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="contracts" class="w-full">
          <ng-container matColumnDef="contractNumber">
            <th mat-header-cell *matHeaderCellDef>رقم العقد</th>
            <td mat-cell *matCellDef="let c">{{ c.contractNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>العنوان</th>
            <td mat-cell *matCellDef="let c">{{ c.title }}</td>
          </ng-container>

          <ng-container matColumnDef="subcontractor">
            <th mat-header-cell *matHeaderCellDef>المقاول</th>
            <td mat-cell *matCellDef="let c">{{ c.subcontractorId }}</td>
          </ng-container>

          <ng-container matColumnDef="project">
            <th mat-header-cell *matHeaderCellDef>المشروع</th>
            <td mat-cell *matCellDef="let c">{{ c.projectId }}</td>
          </ng-container>

          <ng-container matColumnDef="contractValue">
            <th mat-header-cell *matHeaderCellDef>القيمة</th>
            <td mat-cell *matCellDef="let c" class="font-medium">{{ c.contractValue | currency }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>الحالة</th>
            <td mat-cell *matCellDef="let c">
              <mat-chip [color]="getStatusColor(c.status)" selected>
                {{ getStatusLabel(c.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="endDate">
            <th mat-header-cell *matHeaderCellDef>تاريخ النهاية</th>
            <td mat-cell *matCellDef="let c">{{ c.endDate | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button [routerLink]="[c.id]" color="primary">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button (click)="approveContract(c)" *ngIf="c.status === 'pending_approval'" color="accent">
                <mat-icon>check</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteContract(c)" color="warn">
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
export class SubcontractorContractsComponent implements OnInit {
  displayedColumns = ['contractNumber', 'title', 'subcontractor', 'project', 'contractValue', 'status', 'endDate', 'actions'];
  contracts: SubcontractorContract[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  filterStatus: SubcontractorContractStatus | '' = '';
  draftCount = 0;
  pendingCount = 0;
  activeCount = 0;
  completedCount = 0;
  totalCount = 0;

  constructor(private subcontractorContractService: SubcontractorContractService) {}

  ngOnInit() {
    this.loadContracts();
  }

  loadContracts() {
    this.subcontractorContractService.getContracts({
      page: this.page,
      limit: this.pageSize,
      status: this.filterStatus || undefined
    }).subscribe(response => {
      this.contracts = response.data;
      this.total = response.total;
    });

    this.subcontractorContractService.getContracts({ limit: 100 }).subscribe(response => {
      this.totalCount = response.total;
      this.draftCount = response.data.filter(c => c.status === 'draft').length;
      this.pendingCount = response.data.filter(c => c.status === 'pending_approval').length;
      this.activeCount = response.data.filter(c => c.status === 'active').length;
      this.completedCount = response.data.filter(c => c.status === 'completed').length;
    });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadContracts();
  }

  getStatusColor(status: SubcontractorContractStatus): string {
    switch (status) {
      case 'draft': return '';
      case 'pending_approval': return 'warn';
      case 'approved': return 'primary';
      case 'active': return 'accent';
      case 'completed': return 'accent';
      case 'terminated': return '';
      case 'cancelled': return '';
      default: return '';
    }
  }

  getStatusLabel(status: SubcontractorContractStatus): string {
    const labels: Record<SubcontractorContractStatus, string> = {
      draft: 'مسودة',
      pending_approval: 'بانتظار الاعتماد',
      approved: 'معتمد',
      active: 'نشط',
      completed: 'مكتمل',
      terminated: 'منتهي',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  }

  approveContract(contract: SubcontractorContract) {
    this.subcontractorContractService.approveContract(contract.id).subscribe(() => {
      this.loadContracts();
    });
  }

  deleteContract(contract: SubcontractorContract) {
    if (confirm('حذف هذا العقد؟')) {
      this.subcontractorContractService.deleteContract(contract.id).subscribe(() => {
        this.loadContracts();
      });
    }
  }
}