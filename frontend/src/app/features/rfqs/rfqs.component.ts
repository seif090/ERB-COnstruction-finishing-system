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
import { RFQService } from '@core/services/rfq.service';
import { RFQ, RFQStatus } from '@core/models/rfq.model';

@Component({
  selector: 'app-rfqs',
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
        <h1 class="text-2xl font-bold">طلبات عروض الأسعار</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          طلب جديد
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
              <div class="text-2xl font-bold">{{ sentCount }}</div>
              <div class="text-gray-500">مرسل</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ underReviewCount }}</div>
              <div class="text-gray-500">قيد المراجعة</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ awardedCount }}</div>
              <div class="text-gray-500">ممنوح</div>
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
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadRFQs()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="draft">مسودة</mat-option>
            <mat-option value="sent">مرسل</mat-option>
            <mat-option value="under_review">قيد المراجعة</mat-option>
            <mat-option value="awarded">ممنوح</mat-option>
            <mat-option value="closed">مغلق</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="rfqs" class="w-full">
          <ng-container matColumnDef="rfqNumber">
            <th mat-header-cell *matHeaderCellDef>رقم الطلب</th>
            <td mat-cell *matCellDef="let rfq">{{ rfq.rfqNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>العنوان</th>
            <td mat-cell *matCellDef="let rfq">{{ rfq.title }}</td>
          </ng-container>

          <ng-container matColumnDef="project">
            <th mat-header-cell *matHeaderCellDef>المشروع</th>
            <td mat-cell *matCellDef="let rfq">{{ rfq.projectId || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="items">
            <th mat-header-cell *matHeaderCellDef>الاصناف</th>
            <td mat-cell *matCellDef="let rfq">{{ rfq.items.length }} صنف</td>
          </ng-container>

          <ng-container matColumnDef="vendors">
            <th mat-header-cell *matHeaderCellDef>الموردون</th>
            <td mat-cell *matCellDef="let rfq">{{ rfq.vendors.length }} مورد</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>الحالة</th>
            <td mat-cell *matCellDef="let rfq">
              <mat-chip [color]="getStatusColor(rfq.status)" selected>
                {{ getStatusLabel(rfq.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="requiredBy">
            <th mat-header-cell *matHeaderCellDef>مطلوب قبل</th>
            <td mat-cell *matCellDef="let rfq">{{ rfq.requiredByDate | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let rfq">
              <button mat-icon-button [routerLink]="[rfq.id]" color="primary">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button (click)="sendRFQ(rfq)" *ngIf="rfq.status === 'draft'" color="accent">
                <mat-icon>send</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteRFQ(rfq)" color="warn">
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
export class RFQsComponent implements OnInit {
  displayedColumns = ['rfqNumber', 'title', 'project', 'items', 'vendors', 'status', 'requiredBy', 'actions'];
  rfqs: RFQ[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  filterStatus: RFQStatus | '' = '';
  draftCount = 0;
  sentCount = 0;
  underReviewCount = 0;
  awardedCount = 0;
  totalCount = 0;

  constructor(private rfqService: RFQService) {}

  ngOnInit() {
    this.loadRFQs();
  }

  loadRFQs() {
    this.rfqService.getRFQs({
      page: this.page,
      limit: this.pageSize,
      status: this.filterStatus || undefined
    }).subscribe(response => {
      this.rfqs = response.data;
      this.total = response.total;
    });

    this.rfqService.getRFQs({ limit: 100 }).subscribe(response => {
      this.totalCount = response.total;
      this.draftCount = response.data.filter(r => r.status === 'draft').length;
      this.sentCount = response.data.filter(r => r.status === 'sent').length;
      this.underReviewCount = response.data.filter(r => r.status === 'under_review').length;
      this.awardedCount = response.data.filter(r => r.status === 'awarded').length;
    });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadRFQs();
  }

  getStatusColor(status: RFQStatus): string {
    switch (status) {
      case 'draft': return '';
      case 'sent': return 'primary';
      case 'under_review': return 'warn';
      case 'awarded': return 'accent';
      case 'cancelled': return '';
      case 'closed': return 'accent';
      default: return '';
    }
  }

  getStatusLabel(status: RFQStatus): string {
    const labels: Record<RFQStatus, string> = {
      draft: 'مسودة',
      sent: 'مرسل',
      under_review: 'قيد المراجعة',
      awarded: 'ممنوح',
      cancelled: 'ملغي',
      closed: 'مغلق'
    };
    return labels[status] || status;
  }

  sendRFQ(rfq: RFQ) {
    this.rfqService.sendToVendors(rfq.id, []).subscribe(() => {
      this.loadRFQs();
    });
  }

  deleteRFQ(rfq: RFQ) {
    if (confirm('حذف هذا الطلب؟')) {
      this.rfqService.deleteRFQ(rfq.id).subscribe(() => {
        this.loadRFQs();
      });
    }
  }
}