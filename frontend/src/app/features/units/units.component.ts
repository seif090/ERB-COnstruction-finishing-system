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
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { UnitService } from '@core/services/unit.service';
import { Unit, CreateUnitRequest } from '@core/models/unit.model';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatMenuModule, MatChipsModule, MatDialogModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">العقارات</h1>
          <p class="page-subtitle">إدارة الوحدات العقارية (شقق - فيلات - محلات)</p>
        </div>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          إضافة وحدة
        </button>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>بحث</mat-label>
            <input matInput [(ngModel)]="searchText" (input)="loadUnits()" placeholder="عنوان أو موقع">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>النوع</mat-label>
            <mat-select [(ngModel)]="typeFilter" (selectionChange)="loadUnits()">
              <mat-option value="">الكل</mat-option>
              <mat-option value="APARTMENT">شقة</mat-option>
              <mat-option value="VILLA">فيلا</mat-option>
              <mat-option value="COMMERCIAL">تجاري</mat-option>
              <mat-option value="OFFICE">مكتب</mat-option>
              <mat-option value="WAREHOUSE">مستودع</mat-option>
              <mat-option value="LAND">أرض</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>الحالة</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="loadUnits()">
              <mat-option value="">الكل</mat-option>
              <mat-option value="AVAILABLE">متاحة</mat-option>
              <mat-option value="RESERVED">محجوزة</mat-option>
              <mat-option value="SOLD">مباعة</mat-option>
              <mat-option value="RENTED">مؤجرة</mat-option>
              <mat-option value="UNDER_MAINTENANCE">صيانة</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="units-grid">
        @for (unit of dataSource.data; track unit.id) {
          <mat-card class="unit-card">
            <div class="unit-image">
              @if (unit.images && unit.images.length > 0) {
                <img [src]="unit.images[0]" [alt]="unit.title">
              } @else {
                <mat-icon>home</mat-icon>
              }
            </div>
            <div class="unit-content">
              <div class="unit-header">
                <h3>{{ unit.title }}</h3>
                <span class="status-badge" [class]="getStatusClass(unit.status)">{{ getStatusLabel(unit.status) }}</span>
              </div>
              <p class="unit-location">
                <mat-icon>location_on</mat-icon>
                {{ unit.city }} - {{ unit.location || '-' }}
              </p>
              <div class="unit-details">
                <span><mat-icon>square_foot</mat-icon>{{ unit.area }} م²</span>
                @if (unit.bedrooms) { <span><mat-icon>bed</mat-icon>{{ unit.bedrooms }} غرف</span> }
                @if (unit.bathrooms) { <span><mat-icon>bathtub</mat-icon>{{ unit.bathrooms }} حمامات</span> }
              </div>
              <div class="unit-price">
                <span class="price">{{ formatCurrency(unit.price) }}</span>
                @if (unit.rentPrice) {
                  <span class="rent">إيجار: {{ formatCurrency(unit.rentPrice) }}/شهر</span>
                }
              </div>
              <div class="unit-actions">
                <button mat-icon-button [routerLink]="['/units', unit.id]"><mat-icon>visibility</mat-icon></button>
                <button mat-icon-button (click)="openDialog(unit)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button (click)="deleteUnit(unit.id)"><mat-icon>delete</mat-icon></button>
              </div>
            </div>
          </mat-card>
        } @empty {
          <div class="empty-state">
            <mat-icon>home_work</mat-icon>
            <p>لا توجد وحدات عقارية</p>
          </div>
        }
      </mat-card>

      <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
    </div>

    @if (showDialog()) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editingUnit() ? 'تعديل وحدة' : 'إضافة وحدة جديدة' }}</h2>
            <button mat-icon-button (click)="closeDialog()"><mat-icon>close</mat-icon></button>
          </div>
          <form [formGroup]="unitForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width"><mat-label>العنوان</mat-label><input matInput formControlName="title"></mat-form-field>
              <mat-form-field appearance="outline" class="full-width"><mat-label>الوصف</mat-label><textarea matInput formControlName="description" rows="2"></textarea></mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>النوع</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="APARTMENT">شقة</mat-option>
                  <mat-option value="VILLA">فيلا</mat-option>
                  <mat-option value="COMMERCIAL">تجاري</mat-option>
                  <mat-option value="OFFICE">مكتب</mat-option>
                  <mat-option value="WAREHOUSE">مستودع</mat-option>
                  <mat-option value="LAND">أرض</mat-option>
                  <mat-option value="PENTHOUSE">بنتهاوس</mat-option>
                  <mat-option value="STUDIO">استوديو</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>الحالة</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="AVAILABLE">متاحة</mat-option>
                  <mat-option value="RESERVED">محجوزة</mat-option>
                  <mat-option value="SOLD">مباعة</mat-option>
                  <mat-option value="RENTED">مؤجرة</mat-option>
                  <mat-option value="UNDER_MAINTENANCE">صيانة</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline"><mat-label>السعر</mat-label><input matInput formControlName="price" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>سعر الإيجار</mat-label><input matInput formControlName="rentPrice" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>المساحة (م²)</mat-label><input matInput formControlName="area" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>عدد الغرف</mat-label><input matInput formControlName="bedrooms" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>عدد الحمامات</mat-label><input matInput formControlName="bathrooms" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الFloor</mat-label><input matInput formControlName="floor" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>اسم المبنى</mat-label><input matInput formControlName="buildingName"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>المدينة</mat-label><input matInput formControlName="city"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الموقع</mat-label><input matInput formControlName="location"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>سنة البناء</mat-label><input matInput formControlName="yearBuilt" type="number"></mat-form-field>
            </div>
            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialog()">إلغاء</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="unitForm.invalid">{{ editingUnit() ? 'تعديل' : 'إضافة' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .filter-card { margin-bottom: 20px; padding: 16px; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .filters mat-form-field { min-width: 180px; flex: 1; }
    .units-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; padding: 20px; }
    .unit-card { border-radius: 16px; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .unit-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
    .unit-image { height: 180px; background: linear-gradient(135deg, #e2e8f0, #cbd5e1); display: flex; align-items: center; justify-content: center; }
    .unit-image img { width: 100%; height: 100%; object-fit: cover; }
    .unit-image mat-icon { font-size: 64px; width: 64px; height: 64px; color: #94a3b8; }
    .unit-content { padding: 16px; }
    .unit-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .unit-header h3 { margin: 0; font-size: 16px; }
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .status-badge.available { background: #dcfce7; color: #16a34a; }
    .status-badge.reserved { background: #fef3c7; color: #d97706; }
    .status-badge.sold { background: #dbeafe; color: #2563eb; }
    .status-badge.rented { background: #f3e8ff; color: #9333ea; }
    .status-badge.under_maintenance { background: #f1f5f9; color: #64748b; }
    .unit-location { display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 13px; margin-bottom: 12px; }
    .unit-location mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .unit-details { display: flex; gap: 16px; margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); }
    .unit-details mat-icon { font-size: 16px; width: 16px; height: 16px; vertical-align: middle; margin-left: 4px; }
    .unit-price { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .unit-price .price { font-size: 18px; font-weight: 700; color: var(--primary-color); }
    .unit-price .rent { font-size: 13px; color: var(--text-secondary); }
    .unit-actions { display: flex; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 12px; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--text-secondary); }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog-content { background: var(--surface-color); border-radius: 16px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--border-color); }
    .dialog-header h2 { margin: 0; font-size: 20px; }
    form { padding: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .full-width { grid-column: 1 / -1; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color); }
    .page-subtitle { color: var(--text-secondary); margin-top: 4px; }
  `]
})
export class UnitsComponent implements OnInit {
  displayedColumns = ['title', 'type', 'status', 'area', 'price', 'city', 'actions'];
  dataSource = new MatTableDataSource<Unit>();

  searchText = '';
  typeFilter = '';
  statusFilter = '';
  showDialog = signal(false);
  editingUnit = signal<Unit | null>(null);
  unitForm: FormGroup;

  constructor(private unitService: UnitService, private fb: FormBuilder) {
    this.unitForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['APARTMENT', Validators.required],
      status: ['AVAILABLE'],
      price: [0, [Validators.required, Validators.min(0)]],
      rentPrice: [0],
      area: [0, [Validators.required, Validators.min(0)]],
      bedrooms: [0],
      bathrooms: [0],
      floor: [0],
      buildingName: [''],
      city: ['', Validators.required],
      location: [''],
      yearBuilt: [0],
    });
  }

  ngOnInit() { this.loadUnits(); }

  loadUnits() {
    this.unitService.getUnits({ search: this.searchText, type: this.typeFilter as any, status: this.statusFilter as any, page: 1, limit: 100 }).subscribe({
      next: (res) => this.dataSource.data = res.data,
    });
  }

  openDialog(unit?: Unit) {
    if (unit) {
      this.editingUnit.set(unit);
      this.unitForm.patchValue(unit);
    } else {
      this.editingUnit.set(null);
      this.unitForm.reset({ type: 'APARTMENT', status: 'AVAILABLE', price: 0, rentPrice: 0, area: 0, bedrooms: 0, bathrooms: 0, floor: 0, yearBuilt: 0 });
    }
    this.showDialog.set(true);
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editingUnit.set(null);
    this.unitForm.reset({ type: 'APARTMENT', status: 'AVAILABLE' });
  }

  onSubmit() {
    if (this.unitForm.invalid) return;
    const data: CreateUnitRequest = this.unitForm.value;
    if (this.editingUnit()) {
      this.unitService.updateUnit(this.editingUnit()!.id, data).subscribe({ next: () => { this.closeDialog(); this.loadUnits(); } });
    } else {
      this.unitService.createUnit(data).subscribe({ next: () => { this.closeDialog(); this.loadUnits(); } });
    }
  }

  deleteUnit(id: string) {
    if (confirm('هل أنت متأكد من حذف هذه الوحدة؟')) {
      this.unitService.deleteUnit(id).subscribe({ next: () => this.loadUnits() });
    }
  }

  getStatusClass(status: string): string { return status.toLowerCase(); }
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { AVAILABLE: 'متاحة', RESERVED: 'محجوزة', SOLD: 'مباعة', RENTED: 'مؤجرة', UNDER_MAINTENANCE: 'صيانة' };
    return labels[status] || status;
  }
  formatCurrency(amount: number): string { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount); }
}