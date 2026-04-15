import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { AccountingService } from '@core/services/accounting.service';
import { Transaction, CreateTransactionRequest, AccountingSummary } from '@core/models/accounting.model';

@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule, MatTabsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">المحاسبة</h1>
          <p class="page-subtitle">إدارة الإيرادات والمصروفات</p>
        </div>
        <button mat-flat-button color="primary" (click)="openDialog()"><mat-icon>add</mat-icon> عملية جديدة</button>
      </div>

      <mat-card class="summary-card">
        @if (summary()) {
          <div class="summary-grid">
            <div class="summary-item income"><mat-icon>trending_up</mat-icon><div><span>الإيرادات</span><strong>{{ formatCurrency(summary()!.totalIncome) }}</strong></div></div>
            <div class="summary-item expense"><mat-icon>trending_down</mat-icon><div><span>المصروفات</span><strong>{{ formatCurrency(summary()!.totalExpense) }}</strong></div></div>
            <div class="summary-item profit"><mat-icon>account_balance</mat-icon><div><span>صافي الربح</span><strong>{{ formatCurrency(summary()!.netProfit) }}</strong></div></div>
          </div>
        }
      </mat-card>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline"><mat-label>بحث</mat-label><input matInput [(ngModel)]="searchText" (input)="loadTransactions()" placeholder="الوصف"><mat-icon matPrefix>search</mat-icon></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>النوع</mat-label><mat-select [(ngModel)]="typeFilter" (selectionChange)="loadTransactions()"><mat-option value="">الكل</mat-option><mat-option value="INCOME">إيراد</mat-option><mat-option value="EXPENSE">مصروف</mat-option></mat-select></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>الفئة</mat-label><mat-select [(ngModel)]="categoryFilter" (selectionChange)="loadTransactions()"><mat-option value="">الكل</mat-option><mat-option value="PROJECT_PAYMENT">دفعة مشروع</mat-option><mat-option value="SALARY">راتب</mat-option><mat-option value="MATERIAL_PURCHASE">شراء مواد</mat-option><mat-option value="EQUIPMENT_RENTAL">تأجير معدات</mat-option><mat-option value="MAINTENANCE">صيانة</mat-option><mat-option value="UTILITIES">مرافق</mat-option><mat-option value="RENTAL_INCOME">إيجار</mat-option><mat-option value="SALE_INCOME">بيع</mat-option><mat-option value="OTHER">أخرى</mat-option></mat-select></mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>التاريخ</th><td mat-cell *matCellDef="let t">{{ formatDate(t.date) }}</td></ng-container>
          <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>النوع</th><td mat-cell *matCellDef="let t"><span class="type-badge" [class]="t.type.toLowerCase()">{{ t.type === 'INCOME' ? 'إيراد' : 'مصروف' }}</span></td></ng-container>
          <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>الفئة</th><td mat-cell *matCellDef="let t">{{ getCategoryLabel(t.category) }}</td></ng-container>
          <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef>الوصف</th><td mat-cell *matCellDef="let t">{{ t.description }}</td></ng-container>
          <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>المبلغ</th><td mat-cell *matCellDef="let t"><span class="amount" [class.income]="t.type === 'INCOME'" [class.expense]="t.type === 'EXPENSE'">{{ formatCurrency(t.amount) }}</span></td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>الإجراءات</th><td mat-cell *matCellDef="let t"><button mat-icon-button (click)="deleteTransaction(t.id)"><mat-icon>delete</mat-icon></button></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>

    @if (showDialog()) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <div class="dialog-header"><h2>عملية جديدة</h2><button mat-icon-button (click)="closeDialog()"><mat-icon>close</mat-icon></button></div>
          <form [formGroup]="transactionForm" (ngSubmit)="saveTransaction()">
            <div class="form-grid">
              <mat-form-field appearance="outline"><mat-label>النوع</mat-label><mat-select formControlName="type"><mat-option value="INCOME">إيراد</mat-option><mat-option value="EXPENSE">مصروف</mat-option></mat-select></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الفئة</mat-label><mat-select formControlName="category"><mat-option value="PROJECT_PAYMENT">دفعة مشروع</mat-option><mat-option value="SALARY">راتب</mat-option><mat-option value="MATERIAL_PURCHASE">شراء مواد</mat-option><mat-option value="EQUIPMENT_RENTAL">تأجير معدات</mat-option><mat-option value="MAINTENANCE">صيانة</mat-option><mat-option value="UTILITIES">مرافق</mat-option><mat-option value="RENTAL_INCOME">إيجار</mat-option><mat-option value="SALE_INCOME">بيع</mat-option><mat-option value="OTHER">أخرى</mat-option></mat-select></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>المبلغ</mat-label><input matInput formControlName="amount" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>التاريخ</mat-label><input matInput formControlName="date" type="date"></mat-form-field>
              <mat-form-field appearance="outline" class="full-width"><mat-label>الوصف</mat-label><textarea matInput formControlName="description" rows="2"></textarea></mat-form-field>
            </div>
            <div class="dialog-actions"><button mat-button type="button" (click)="closeDialog()">إلغاء</button><button mat-flat-button color="primary" type="submit" [disabled]="transactionForm.invalid">حفظ</button></div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .summary-card { margin-bottom: 20px; padding: 20px; border-radius: 16px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .summary-item { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 12px; }
    .summary-item.income { background: linear-gradient(135deg, #dcfce7, #bbf7d0); }
    .summary-item.expense { background: linear-gradient(135deg, #fee2e2, #fecaca); }
    .summary-item.profit { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
    .summary-item mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .summary-item.income mat-icon { color: #16a34a; }
    .summary-item.expense mat-icon { color: #dc2626; }
    .summary-item.profit mat-icon { color: #2563eb; }
    .summary-item span { display: block; font-size: 14px; color: var(--text-secondary); }
    .summary-item strong { font-size: 24px; }
    .filter-card { margin-bottom: 20px; padding: 16px; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .filters mat-form-field { min-width: 180px; flex: 1; }
    .table-card { border-radius: 16px; overflow: hidden; }
    table { width: 100%; }
    .type-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .type-badge.income { background: #dcfce7; color: #16a34a; }
    .type-badge.expense { background: #fee2e2; color: #dc2626; }
    .amount { font-weight: 600; }
    .amount.income { color: #16a34a; }
    .amount.expense { color: #dc2626; }
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog-content { background: var(--surface-color); border-radius: 16px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--border-color); }
    .dialog-header h2 { margin: 0; font-size: 20px; }
    form { padding: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .full-width { grid-column: 1 / -1; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color); }
    .page-subtitle { color: var(--text-secondary); margin-top: 4px; }
    @media (max-width: 768px) { .summary-grid { grid-template-columns: 1fr; } }
  `]
})
export class AccountingComponent implements OnInit {
  displayedColumns = ['date', 'type', 'category', 'description', 'amount', 'actions'];
  dataSource = new MatTableDataSource<Transaction>();
  searchText = ''; typeFilter = ''; categoryFilter = '';
  showDialog = signal(false);
  summary = signal<AccountingSummary | null>(null);
  transactionForm: FormGroup;

  constructor(private accountingService: AccountingService, private fb: FormBuilder) {
    this.transactionForm = this.fb.group({
      type: ['INCOME', Validators.required],
      category: ['OTHER', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() { this.loadTransactions(); this.loadSummary(); }

  loadTransactions() {
    this.accountingService.getTransactions({ search: this.searchText, type: this.typeFilter as any, category: this.categoryFilter as any, page: 1, limit: 100 }).subscribe({
      next: (res) => this.dataSource.data = res.data,
    });
  }

  loadSummary() {
    this.accountingService.getSummary().subscribe({ next: (data) => this.summary.set(data) });
  }

  openDialog() { this.transactionForm.reset({ type: 'INCOME', category: 'OTHER', date: new Date().toISOString().split('T')[0] }); this.showDialog.set(true); }
  closeDialog() { this.showDialog.set(false); }

  saveTransaction() {
    if (this.transactionForm.invalid) return;
    const data: CreateTransactionRequest = this.transactionForm.value;
    this.accountingService.createTransaction(data).subscribe({ next: () => { this.closeDialog(); this.loadTransactions(); this.loadSummary(); } });
  }

  deleteTransaction(id: string) { if (confirm('هل أنت متأكد من حذف هذه العملية؟')) { this.accountingService.deleteTransaction(id).subscribe({ next: () => { this.loadTransactions(); this.loadSummary(); } }); } }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = { PROJECT_PAYMENT: 'دفعة مشروع', SALARY: 'راتب', MATERIAL_PURCHASE: 'شراء مواد', EQUIPMENT_RENTAL: 'تأجير معدات', MAINTENANCE: 'صيانة', UTILITIES: 'مرافق', RENTAL_INCOME: 'إيجار', SALE_INCOME: 'بيع', OTHER: 'أخرى' };
    return labels[category] || category;
  }

  formatCurrency(amount: number): string { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount); }
  formatDate(date: Date): string { return new Date(date).toLocaleDateString('ar-SA'); }
}