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
import { WarrantyService } from '@core/services/warranty.service';
import { Warranty, WarrantyType, WarrantyStatus } from '@core/models/warranty.model';

@Component({
  selector: 'app-warranties',
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
        <h1 class="text-2xl font-bold">الضمانات</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          ضمان جديد
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ activeCount }}</div>
              <div class="text-gray-500">نشط</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ expiringCount }}</div>
              <div class="text-gray-500">ينتهي قريباً</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ expiredCount }}</div>
              <div class="text-gray-500">منتهي</div>
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
          <mat-label>الفئة</mat-label>
          <mat-select [(ngModel)]="filterType" (selectionChange)="loadWarranties()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="equipment">معدات</mat-option>
            <mat-option value="materials">مواد</mat-option>
            <mat-option value="appliances">أجهزة</mat-option>
            <mat-option value="structural">إنشائية</mat-option>
            <mat-option value="other">أخرى</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-40">
          <mat-label>الحالة</mat-label>
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadWarranties()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="active">نشط</mat-option>
            <mat-option value="expired">منتهي</mat-option>
            <mat-option value="voided">ملغي</mat-option>
            <mat-option value="renewed">متجدد</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="warranties" class="w-full">
          <ng-container matColumnDef="itemName">
            <th mat-header-cell *matHeaderCellDef>اسم العنصر</th>
            <td mat-cell *matCellDef="let w">{{ w.itemName }}</td>
          </ng-container>

          <ng-container matColumnDef="warrantyType">
            <th mat-header-cell *matHeaderCellDef>نوع الضمان</th>
            <td mat-cell *matCellDef="let w">
              <mat-chip>{{ getTypeLabel(w.warrantyType) }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="startDate">
            <th mat-header-cell *matHeaderCellDef>تاريخ البداية</th>
            <td mat-cell *matCellDef="let w">{{ w.startDate | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="endDate">
            <th mat-header-cell *matHeaderCellDef>تاريخ النهاية</th>
            <td mat-cell *matCellDef="let w" [class.text-red-600]="isExpired(w.endDate)">
              {{ w.endDate | date:'short' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>الحالة</th>
            <td mat-cell *matCellDef="let w">
              <mat-chip [color]="getStatusColor(w.status)" selected>
                {{ getStatusLabel(w.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="daysLeft">
            <th mat-header-cell *matHeaderCellDef>الأيام المتبقية</th>
            <td mat-cell *matCellDef="let w">
              <span [class.text-red-600]="getDaysLeft(w.endDate) <= 30" [class.text-orange-500]="getDaysLeft(w.endDate) <= 90 && getDaysLeft(w.endDate) > 30">
                {{ getDaysLeft(w.endDate) }} يوم
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let w">
              <button mat-icon-button [routerLink]="[w.id]" color="primary">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="renewWarranty(w)" *ngIf="w.status === 'expired'" color="accent">
                <mat-icon>refresh</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteWarranty(w)" color="warn">
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
export class WarrantiesComponent implements OnInit {
  displayedColumns = ['itemName', 'warrantyType', 'startDate', 'endDate', 'status', 'daysLeft', 'actions'];
  warranties: Warranty[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  filterType: WarrantyType | '' = '';
  filterStatus: WarrantyStatus | '' = '';
  activeCount = 0;
  expiringCount = 0;
  expiredCount = 0;
  totalCount = 0;

  constructor(private warrantyService: WarrantyService) {}

  ngOnInit() {
    this.loadWarranties();
  }

  loadWarranties() {
    this.warrantyService.getWarranties({
      page: this.page,
      limit: this.pageSize,
      warrantyType: this.filterType || undefined,
      status: this.filterStatus || undefined
    }).subscribe(response => {
      this.warranties = response.data;
      this.total = response.total;
    });

    this.warrantyService.getWarranties({ limit: 100 }).subscribe(response => {
      this.totalCount = response.total;
      this.activeCount = response.data.filter(w => w.status === 'active').length;
      this.expiringCount = response.expiringSoon;
      this.expiredCount = response.expired;
    });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadWarranties();
  }

  getTypeLabel(type: WarrantyType): string {
    const labels: Record<WarrantyType, string> = {
      equipment: 'معدات',
      materials: 'مواد',
      appliances: 'أجهزة',
      structural: 'إنشائية',
      other: 'أخرى'
    };
    return labels[type] || type;
  }

  getStatusColor(status: WarrantyStatus): string {
    switch (status) {
      case 'active': return 'accent';
      case 'expired': return 'warn';
      case 'voided': return '';
      case 'renewed': return 'primary';
      default: return '';
    }
  }

  getStatusLabel(status: WarrantyStatus): string {
    const labels: Record<WarrantyStatus, string> = {
      active: 'نشط',
      expired: 'منتهي',
      voided: 'ملغي',
      renewed: 'متجدد'
    };
    return labels[status] || status;
  }

  getDaysLeft(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  isExpired(endDate: string): boolean {
    return this.getDaysLeft(endDate) < 0;
  }

  renewWarranty(warranty: Warranty) {
    const newEndDate = new Date();
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    this.warrantyService.updateWarranty(warranty.id, {
      status: 'renewed',
      startDate: new Date().toISOString(),
      endDate: newEndDate.toISOString()
    }).subscribe(() => {
      this.loadWarranties();
    });
  }

  deleteWarranty(warranty: Warranty) {
    if (confirm('حذف هذا الضمان؟')) {
      this.warrantyService.deleteWarranty(warranty.id).subscribe(() => {
        this.loadWarranties();
      });
    }
  }
}