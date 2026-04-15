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
import { PurchaseOrderService } from '@core/services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStatus } from '@core/models/purchase-order.model';

@Component({
  selector: 'app-purchase-orders',
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
        <h1 class="text-2xl font-bold">أوامر الشراء</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          أمر شراء جديد
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
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
              <div class="text-2xl font-bold">{{ approvedCount }}</div>
              <div class="text-gray-500">معتمد</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ orderedCount }}</div>
              <div class="text-gray-500">تم الطلب</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ receivedCount }}</div>
              <div class="text-gray-500">مستلم</div>
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
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadOrders()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="draft">مسودة</mat-option>
            <mat-option value="pending_approval">بانتظار الاعتماد</mat-option>
            <mat-option value="approved">معتمد</mat-option>
            <mat-option value="ordered">تم الطلب</mat-option>
            <mat-option value="partial">جزئي</mat-option>
            <mat-option value="received">مستلم</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="orders" class="w-full">
          <ng-container matColumnDef="poNumber">
            <th mat-header-cell *matHeaderCellDef>رقم الأمر</th>
            <td mat-cell *matCellDef="let po">{{ po.poNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="supplier">
            <th mat-header-cell *matHeaderCellDef>المورد</th>
            <td mat-cell *matCellDef="let po">{{ po.supplierId }}</td>
          </ng-container>

          <ng-container matColumnDef="items">
            <th mat-header-cell *matHeaderCellDef>الاصناف</th>
            <td mat-cell *matCellDef="let po">{{ po.items.length }} صنف</td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>الاجمالي</th>
            <td mat-cell *matCellDef="let po" class="font-medium">{{ po.total | currency }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>الحالة</th>
            <td mat-cell *matCellDef="let po">
              <mat-chip [color]="getStatusColor(po.status)" selected>
                {{ getStatusLabel(po.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="expectedDelivery">
            <th mat-header-cell *matHeaderCellDef>تاريخ التسليم المتوقع</th>
            <td mat-cell *matCellDef="let po">{{ po.expectedDeliveryDate | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let po">
              <button mat-icon-button [routerLink]="[po.id]" color="primary">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button (click)="approveOrder(po)" *ngIf="po.status === 'pending_approval'" color="accent">
                <mat-icon>check</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteOrder(po)" color="warn">
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
export class PurchaseOrdersComponent implements OnInit {
  displayedColumns = ['poNumber', 'supplier', 'items', 'total', 'status', 'expectedDelivery', 'actions'];
  orders: PurchaseOrder[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  filterStatus: PurchaseOrderStatus | '' = '';
  draftCount = 0;
  pendingCount = 0;
  approvedCount = 0;
  orderedCount = 0;
  receivedCount = 0;
  totalCount = 0;

  constructor(private purchaseOrderService: PurchaseOrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.purchaseOrderService.getPurchaseOrders({
      page: this.page,
      limit: this.pageSize,
      status: this.filterStatus || undefined
    }).subscribe(response => {
      this.orders = response.data;
      this.total = response.total;
    });

    this.purchaseOrderService.getPurchaseOrders({ limit: 100 }).subscribe(response => {
      this.totalCount = response.total;
      this.draftCount = response.data.filter(o => o.status === 'draft').length;
      this.pendingCount = response.data.filter(o => o.status === 'pending_approval').length;
      this.approvedCount = response.data.filter(o => o.status === 'approved').length;
      this.orderedCount = response.data.filter(o => o.status === 'ordered').length;
      this.receivedCount = response.data.filter(o => o.status === 'received').length;
    });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  getStatusColor(status: PurchaseOrderStatus): string {
    switch (status) {
      case 'draft': return '';
      case 'pending_approval': return 'warn';
      case 'approved': return 'primary';
      case 'ordered': return 'accent';
      case 'partial': return 'accent';
      case 'received': return 'accent';
      case 'cancelled': return '';
      default: return '';
    }
  }

  getStatusLabel(status: PurchaseOrderStatus): string {
    const labels: Record<PurchaseOrderStatus, string> = {
      draft: 'مسودة',
      pending_approval: 'بانتظار الاعتماد',
      approved: 'معتمد',
      ordered: 'تم الطلب',
      partial: 'جزئي',
      received: 'مستلم',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  }

  approveOrder(po: PurchaseOrder) {
    this.purchaseOrderService.approvePurchaseOrder(po.id).subscribe(() => {
      this.loadOrders();
    });
  }

  deleteOrder(po: PurchaseOrder) {
    if (confirm('حذف هذا الأمر؟')) {
      this.purchaseOrderService.deletePurchaseOrder(po.id).subscribe(() => {
        this.loadOrders();
      });
    }
  }
}