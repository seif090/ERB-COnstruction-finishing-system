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
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '@core/services/expense.service';
import { Expense, ExpenseCategory, ExpenseStatus } from '@core/models/expense.model';

@Component({
  selector: 'app-expenses',
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
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">المصروفات</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          مصروف جديد
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ totalAmount | currency }}</div>
              <div class="text-gray-500">إجمالي المصروفات</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ pendingCount }}</div>
              <div class="text-gray-500">قيد الانتظار</div>
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
              <div class="text-2xl font-bold">{{ paidCount }}</div>
              <div class="text-gray-500">مدفوع</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="mb-4 flex gap-4 flex-wrap">
        <mat-form-field appearance="outline" class="w-40">
          <mat-label>الفئة</mat-label>
          <mat-select [(ngModel)]="filterCategory" (selectionChange)="loadExpenses()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="materials">مواد</mat-option>
            <mat-option value="labor">عمالة</mat-option>
            <mat-option value="equipment">معدات</mat-option>
            <mat-option value="transportation">نقل</mat-option>
            <mat-option value="permits">تصاريح</mat-option>
            <mat-option value="utilities">مرافق</mat-option>
            <mat-option value="maintenance">صيانة</mat-option>
            <mat-option value="other">أخرى</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-40">
          <mat-label>الحالة</mat-label>
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadExpenses()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="pending">قيد الانتظار</mat-option>
            <mat-option value="approved">معتمد</mat-option>
            <mat-option value="paid">مدفوع</mat-option>
            <mat-option value="rejected">مرفوض</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="expenses" class="w-full">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>البيان</th>
            <td mat-cell *matCellDef="let exp">{{ exp.title }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>الفئة</th>
            <td mat-cell *matCellDef="let exp">
              <mat-chip>{{ getCategoryLabel(exp.category) }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>المبلغ</th>
            <td mat-cell *matCellDef="let exp" class="font-medium">{{ exp.amount | currency }}</td>
          </ng-container>

          <ng-container matColumnDef="paymentMethod">
            <th mat-header-cell *matHeaderCellDef>طريقة الدفع</th>
            <td mat-cell *matCellDef="let exp">{{ getPaymentMethodLabel(exp.paymentMethod) }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>الحالة</th>
            <td mat-cell *matCellDef="let exp">
              <mat-chip [color]="getStatusColor(exp.status)" selected>
                {{ getStatusLabel(exp.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>التاريخ</th>
            <td mat-cell *matCellDef="let exp">{{ exp.date | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let exp">
              <button mat-icon-button [routerLink]="[exp.id]" color="primary">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="approveExpense(exp)" *ngIf="exp.status === 'pending'" color="accent">
                <mat-icon>check</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteExpense(exp)" color="warn">
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
export class ExpensesComponent implements OnInit {
  displayedColumns = ['title', 'category', 'amount', 'paymentMethod', 'status', 'date', 'actions'];
  expenses: Expense[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  filterCategory: ExpenseCategory | '' = '';
  filterStatus: ExpenseStatus | '' = '';
  totalAmount = 0;
  pendingCount = 0;
  approvedCount = 0;
  paidCount = 0;

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.expenseService.getExpenses({
      page: this.page,
      limit: this.pageSize,
      category: this.filterCategory || undefined,
      status: this.filterStatus || undefined
    }).subscribe(response => {
      this.expenses = response.data;
      this.total = response.total;
      this.totalAmount = response.totalAmount || 0;
    });

    this.expenseService.getExpenses({ limit: 100 }).subscribe(response => {
      this.pendingCount = response.data.filter(e => e.status === 'pending').length;
      this.approvedCount = response.data.filter(e => e.status === 'approved').length;
      this.paidCount = response.data.filter(e => e.status === 'paid').length;
    });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadExpenses();
  }

  getCategoryLabel(category: ExpenseCategory): string {
    const labels: Record<ExpenseCategory, string> = {
      materials: 'مواد',
      labor: 'عمالة',
      equipment: 'معدات',
      transportation: 'نقل',
      permits: 'تصاريح',
      utilities: 'مرافق',
      maintenance: 'صيانة',
      other: 'أخرى'
    };
    return labels[category] || category;
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      cash: 'نقدي',
      bank_transfer: 'تحويل بنكي',
      credit_card: 'بطاقة ائتمان',
      cheque: 'شيك'
    };
    return labels[method] || method;
  }

  getStatusColor(status: ExpenseStatus): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'approved': return 'primary';
      case 'paid': return 'accent';
      case 'rejected': return '';
      default: return '';
    }
  }

  getStatusLabel(status: ExpenseStatus): string {
    const labels: Record<ExpenseStatus, string> = {
      pending: 'قيد الانتظار',
      approved: 'معتمد',
      paid: 'مدفوع',
      rejected: 'مرفوض'
    };
    return labels[status] || status;
  }

  approveExpense(exp: Expense) {
    this.expenseService.updateExpense(exp.id, { status: 'approved', approvedBy: 'Admin' }).subscribe(() => {
      this.loadExpenses();
    });
  }

  deleteExpense(exp: Expense) {
    if (confirm('حذف هذا المصروف؟')) {
      this.expenseService.deleteExpense(exp.id).subscribe(() => {
        this.loadExpenses();
      });
    }
  }
}