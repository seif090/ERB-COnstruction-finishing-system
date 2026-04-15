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
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { InventoryService } from '@core/services/inventory.service';
import { InventoryItem, InventoryTransaction, CreateInventoryItemRequest, CreateInventoryTransactionRequest } from '@core/models/inventory.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatMenuModule, MatDialogModule, MatChipsModule, MatBadgeModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">المخزن</h1>
          <p class="page-subtitle">إدارة الخامات والمستودجات</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="openTransactionDialog()"><mat-icon>swap_horiz</mat-icon> حركة مخزنية</button>
          <button mat-flat-button color="primary" (click)="openItemDialog()"><mat-icon>add</mat-icon> صنف جديد</button>
        </div>
      </div>

      <mat-card class="stats-bar">
        <div class="stat-item"><mat-icon>inventory_2</mat-icon><div><span>إجمالي الأصناف</span><strong>{{ totalItems }}</strong></div></div>
        <div class="stat-item warning"><mat-icon>warning</mat-icon><div><span>نقص المخزون</span><strong>{{ lowStockItems }}</strong></div></div>
        <div class="stat-item success"><mat-icon>check_circle</mat-icon><div><span>إجمالي الكمية</span><strong>{{ totalQuantity }}</strong></div></div>
      </mat-card>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline"><mat-label>بحث</mat-label><input matInput [(ngModel)]="searchText" (input)="loadItems()" placeholder="اسم أو كود الصنف"><mat-icon matPrefix>search</mat-icon></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>الفئة</mat-label><mat-select [(ngModel)]="categoryFilter" (selectionChange)="loadItems()"><mat-option value="">الكل</mat-option><mat-option value="ceramic">سيراميك</mat-option><mat-option value="paint">دهانات</mat-option><mat-option value="electrical">كهرباء</mat-option><mat-option value="plumbing">سباكة</mat-option><mat-option value="wood">خشب</mat-option><mat-option value="aluminum">ألمنيوم</mat-option><mat-option value="other">أخرى</mat-option></mat-select></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>الحالة</mat-label><mat-select [(ngModel)]="lowStockFilter" (selectionChange)="loadItems()"><mat-option value="">الكل</mat-option><mat-option value="true">نقص مخزون</mat-option></mat-select></mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>الكود</th><td mat-cell *matCellDef="let item"><span class="item-code">{{ item.code }}</span></td></ng-container>
          <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>اسم الصنف</th><td mat-cell *matCellDef="let item">{{ item.name }}</td></ng-container>
          <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>الفئة</th><td mat-cell *matCellDef="let item"><mat-chip>{{ getCategoryLabel(item.category) }}</mat-chip></td></ng-container>
          <ng-container matColumnDef="quantity"><th mat-header-cell *matHeaderCellDef>الكمية</th><td mat-cell *matCellDef="let item"><span class="quantity" [class.low]="item.quantity <= item.minQuantity">{{ item.quantity }} {{ item.unit }}</span></td></ng-container>
          <ng-container matColumnDef="minQuantity"><th mat-header-cell *matHeaderCellDef>الحد الأدنى</th><td mat-cell *matCellDef="let item">{{ item.minQuantity }}</td></ng-container>
          <ng-container matColumnDef="price"><th mat-header-cell *matHeaderCellDef>السعر</th><td mat-cell *matCellDef="let item">{{ formatCurrency(item.price) }}</td></ng-container>
          <ng-container matColumnDef="location"><th mat-header-cell *matHeaderCellDef>الموقع</th><td mat-cell *matCellDef="let item">{{ item.location || '-' }}</td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>الإجراءات</th><td mat-cell *matCellDef="let item"><button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button><mat-menu #menu="matMenu"><button mat-menu-item (click)="openItemDialog(item)"><mat-icon>edit</mat-icon><span>تعديل</span></button><button mat-menu-item (click)="deleteItem(item.id)"><mat-icon>delete</mat-icon><span>حذف</span></button></mat-menu></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>

    @if (showItemDialog()) {
      <div class="dialog-overlay" (click)="closeItemDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <div class="dialog-header"><h2>{{ editingItem() ? 'تعديل صنف' : 'صنف جديد' }}</h2><button mat-icon-button (click)="closeItemDialog()"><mat-icon>close</mat-icon></button></div>
          <form [formGroup]="itemForm" (ngSubmit)="saveItem()">
            <div class="form-grid">
              <mat-form-field appearance="outline"><mat-label>اسم الصنف</mat-label><input matInput formControlName="name"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الكود (SKU)</mat-label><input matInput formControlName="code"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الفئة</mat-label><mat-select formControlName="category"><mat-option value="ceramic">سيراميك</mat-option><mat-option value="paint">دهانات</mat-option><mat-option value="electrical">كهرباء</mat-option><mat-option value="plumbing">سباكة</mat-option><mat-option value="wood">خشب</mat-option><mat-option value="aluminum">ألمنيوم</mat-option><mat-option value="other">أخرى</mat-option></mat-select></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الوحدة</mat-label><mat-select formControlName="unit"><mat-option value="piece">قطعة</mat-option><mat-option value="meter">متر</mat-option><mat-option value="kg">كيلو</mat-option><mat-option value="liter">لتر</mat-option><mat-option value="box">صندوق</mat-option></mat-select></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الكمية</mat-label><input matInput formControlName="quantity" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الحد الأدنى</mat-label><input matInput formControlName="minQuantity" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>السعر</mat-label><input matInput formControlName="price" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>المورد</mat-label><input matInput formControlName="supplier"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الموقع</mat-label><input matInput formControlName="location"></mat-form-field>
              <mat-form-field appearance="outline" class="full-width"><mat-label>الوصف</mat-label><textarea matInput formControlName="description" rows="2"></textarea></mat-form-field>
            </div>
            <div class="dialog-actions"><button mat-button type="button" (click)="closeItemDialog()">إلغاء</button><button mat-flat-button color="primary" type="submit" [disabled]="itemForm.invalid">{{ editingItem() ? 'تعديل' : 'إضافة' }}</button></div>
          </form>
        </div>
      </div>
    }

    @if (showTransactionDialog()) {
      <div class="dialog-overlay" (click)="closeTransactionDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <div class="dialog-header"><h2>حركة مخزنية</h2><button mat-icon-button (click)="closeTransactionDialog()"><mat-icon>close</mat-icon></button></div>
          <form [formGroup]="transactionForm" (ngSubmit)="saveTransaction()">
            <div class="form-grid">
              <mat-form-field appearance="outline"><mat-label>الصنف</mat-label><mat-select formControlName="itemId">@for (item of items(); track item.id) {<mat-option [value]="item.id">{{ item.name }} ({{ item.quantity }} {{ item.unit }})</mat-option>}</mat-select></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>نوع الحركة</mat-label><mat-select formControlName="type"><mat-option value="IN">إضافة</mat-option><mat-option value="OUT">صرف</mat-option><mat-option value="RETURN">إرجاع</mat-option><mat-option value="ADJUSTMENT">تسوية</mat-option></mat-select></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الكمية</mat-label><input matInput formControlName="quantity" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>سعر الوحدة</mat-label><input matInput formControlName="unitPrice" type="number"></mat-form-field>
              <mat-form-field appearance="outline" class="full-width"><mat-label>ملاحظات</mat-label><textarea matInput formControlName="notes" rows="2"></textarea></mat-form-field>
            </div>
            <div class="dialog-actions"><button mat-button type="button" (click)="closeTransactionDialog()">إلغاء</button><button mat-flat-button color="primary" type="submit" [disabled]="transactionForm.invalid">حفظ</button></div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .header-actions { display: flex; gap: 12px; }
    .stats-bar { display: flex; gap: 24px; margin-bottom: 20px; padding: 20px; border-radius: 16px; }
    .stat-item { display: flex; align-items: center; gap: 12px; }
    .stat-item mat-icon { color: var(--primary-color); }
    .stat-item.warning mat-icon { color: #f59e0b; }
    .stat-item.success mat-icon { color: #22c55e; }
    .stat-item span { font-size: 12px; color: var(--text-secondary); }
    .stat-item strong { font-size: 20px; }
    .filter-card { margin-bottom: 20px; padding: 16px; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .filters mat-form-field { min-width: 180px; flex: 1; }
    .table-card { border-radius: 16px; overflow: hidden; }
    table { width: 100%; }
    .item-code { font-weight: 600; color: var(--primary-color); }
    .quantity.low { color: #ef4444; font-weight: 600; }
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog-content { background: var(--surface-color); border-radius: 16px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--border-color); }
    .dialog-header h2 { margin: 0; font-size: 20px; }
    form { padding: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .full-width { grid-column: 1 / -1; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color); }
    .page-subtitle { color: var(--text-secondary); margin-top: 4px; }
  `]
})
export class InventoryComponent implements OnInit {
  displayedColumns = ['code', 'name', 'category', 'quantity', 'minQuantity', 'price', 'location', 'actions'];
  dataSource = new MatTableDataSource<InventoryItem>();
  searchText = ''; categoryFilter = ''; lowStockFilter = '';
  showItemDialog = signal(false); showTransactionDialog = signal(false);
  editingItem = signal<InventoryItem | null>(null);
  items = signal<InventoryItem[]>([]);
  totalItems = 0; lowStockItems = 0; totalQuantity = 0;

  itemForm: FormGroup; transactionForm: FormGroup;

  constructor(private inventoryService: InventoryService, private fb: FormBuilder) {
    this.itemForm = this.fb.group({ name: ['', Validators.required], code: ['', Validators.required], category: ['ceramic', Validators.required], unit: ['piece'], quantity: [0], minQuantity: [0], price: [0, Validators.required], supplier: [''], location: [''], description: [''] });
    this.transactionForm = this.fb.group({ itemId: ['', Validators.required], type: ['IN', Validators.required], quantity: [1, [Validators.required, Validators.min(1)]], unitPrice: [0], notes: [''] });
  }

  ngOnInit() { this.loadItems(); }

  loadItems() {
    this.inventoryService.getItems({ search: this.searchText, category: this.categoryFilter, lowStock: this.lowStockFilter === 'true', page: 1, limit: 100 }).subscribe({
      next: (res) => { this.dataSource.data = res.data; this.items.set(res.data); this.calculateStats(); }
    });
  }

  calculateStats() { this.totalItems = this.dataSource.data.length; this.lowStockItems = this.dataSource.data.filter(i => i.quantity <= i.minQuantity).length; this.totalQuantity = this.dataSource.data.reduce((sum, i) => sum + Number(i.quantity), 0); }

  openItemDialog(item?: InventoryItem) { if (item) { this.editingItem.set(item); this.itemForm.patchValue(item); } else { this.editingItem.set(null); this.itemForm.reset({ category: 'ceramic', unit: 'piece' }); } this.showItemDialog.set(true); }
  closeItemDialog() { this.showItemDialog.set(false); this.editingItem.set(null); }

  saveItem() {
    if (this.itemForm.invalid) return;
    const data: CreateInventoryItemRequest = this.itemForm.value;
    if (this.editingItem()) { this.inventoryService.updateItem(this.editingItem()!.id, data).subscribe({ next: () => { this.closeItemDialog(); this.loadItems(); } }); }
    else { this.inventoryService.createItem(data).subscribe({ next: () => { this.closeItemDialog(); this.loadItems(); } }); }
  }

  deleteItem(id: string) { if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) { this.inventoryService.deleteItem(id).subscribe({ next: () => this.loadItems() }); } }

  openTransactionDialog() { this.transactionForm.reset({ type: 'IN', quantity: 1, unitPrice: 0 }); this.showTransactionDialog.set(true); }
  closeTransactionDialog() { this.showTransactionDialog.set(false); }

  saveTransaction() {
    if (this.transactionForm.invalid) return;
    const data: CreateInventoryTransactionRequest = this.transactionForm.value;
    this.inventoryService.createTransaction(data).subscribe({ next: () => { this.closeTransactionDialog(); this.loadItems(); } });
  }

  getCategoryLabel(category: string): string { const labels: Record<string, string> = { ceramic: 'سيراميك', paint: 'دهانات', electrical: 'كهرباء', plumbing: 'سباكة', wood: 'خشب', aluminum: 'ألمنيوم', other: 'أخرى' }; return labels[category] || category; }
  formatCurrency(amount: number): string { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount); }
}